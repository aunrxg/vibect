import { FastifyInstance } from "fastify";
import { BadRequestError, NotFoundError } from "../../utils/error";
import { CACHE_KEYS, REDIS_CHANNELS } from "../../config/constants";

export class VoteService {
  constructor(private app: FastifyInstance) {}

  async vote(songId: string, userId: string, value: number) {
    if (![-1, 0, 1].includes(value)) {
      throw new BadRequestError(
        "Vote value must be -1(downvote), 0(revome), 1(upvote) only",
      );
    }

    const song = await this.app.prisma.songs.findFirst({
      where: { id: songId },
      include: {
        space: true,
        votes: true,
      },
    });

    if (!song) {
      throw new NotFoundError("Song not found");
    }
    if (song.playedAt) {
      throw new BadRequestError("Cannot vote a song that has already played");
    }

    // check membership
    const membership = await this.app.prisma.spaceMember.findUnique({
      where: {
        userId_spaceId: {
          userId,
          spaceId: song.spaceId,
        },
      },
    });

    // allow vote if space is public or user is memeber
    if (!song.space.isPublic && !membership) {
      throw new BadRequestError("You must be a member to vote");
    }

    let vote;
    if (value === 0) {
      try {
        vote = await this.app.prisma.votes.delete({
          where: {
            songId_userId: {
              songId,
              userId,
            },
          },
        });
      } catch (error) {
        vote = null;
      }
    } else {
      vote = await this.app.prisma.votes.upsert({
        where: {
          songId_userId: {
            songId,
            userId,
          },
        },
        update: {
          value,
          updatedAt: new Date(),
        },
        create: {
          songId,
          userId,
          value,
        },
      });
    }

    const updatedSong = await this.app.prisma.songs.findUnique({
      where: { id: songId },
      include: {
        votes: true,
      },
    });

    const score = updatedSong!.votes.reduce((sum, v) => sum + v.value, 0);

    // reorder queeu
    const queue = await this.getQueue(song.spaceId);
    const position = queue.findIndex((s) => s.id == songId) + 1;

    // update cache
    await this.app.redis.del(CACHE_KEYS.QUEUE(song.spaceId));

    await this.app.redis.publish(
      REDIS_CHANNELS.VOTE_EVENTS,
      JSON.stringify({
        type: "song_voted",
        spaceId: song.spaceId,
        data: {
          songId,
          userId,
          value,
          score,
          position,
        },
      }),
    );

    return {
      vote: vote || {
        id: "",
        value: 0,
        songId,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };
  }

  async removeVote(songId: string, userId: string) {
    return this.vote(songId, userId, 0);
  }

  async getUserVote(spaceId: string, userId: string) {
    const space = await this.app.prisma.space.findUnique({
      where: { id: spaceId },
    });

    if (!space) {
      throw new NotFoundError("Space not found");
    }

    const votes = await this.app.prisma.votes.findMany({
      where: {
        userId,
        song: {
          spaceId,
          playedAt: null,
        },
      },
      include: {
        song: {
          include: {
            addedBy: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    return votes.map((vote) => ({
      voteId: vote.id,
      value: vote.value,
      song: {
        id: vote.song.id,
        title: vote.song.title,
        artist: vote.song.artist,
        thumbnail: vote.song.thumbnailUrl,
        addedBy: vote.song.addedBy,
      },
    }));
  }

  async getSongVotes(songId: string) {
    const song = await this.app.prisma.songs.findUnique({
      where: { id: songId },
    });

    if (!song) {
      throw new NotFoundError("Song not found");
    }

    const votes = await this.app.prisma.votes.findMany({
      where: { songId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const upvotes = votes.filter((v) => v.value === 1).length;
    const downvotes = votes.filter((v) => v.value === -1).length;
    const score = votes.reduce((sum, v) => sum + v.value, 0);

    return {
      songId,
      score,
      voteCount: {
        upvotes,
        downvotes,
        total: votes.length,
      },
      votes: votes.map((vote) => ({
        userId: vote.user.id,
        userName: vote.user.name,
        userAvatar: vote.user.avatarUrl,
        votedAt: vote.createdAt,
      })),
    };
  }

  async getLeaderboard(spaceId: string, limit = 10) {
    const space = await this.app.prisma.space.findUnique({
      where: { id: spaceId },
    });
    if (!space) {
      throw new NotFoundError("Space not found");
    }

    const songs = await this.app.prisma.songs.findMany({
      where: {
        spaceId,
        playedAt: null,
      },
      include: {
        votes: true,
        addedBy: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            email: true,
          },
        },
      },
    });

    const songsWithScore = songs.map((song) => ({
      id: song.id,
      title: song.title,
      artist: song.artist,
      thumbnail: song.thumbnailUrl,
      addedBy: song.addedBy,
      score: song.votes.reduce((sum, v) => sum + v.value, 0),
      upvotes: song.votes.filter((v) => v.value === 1).length,
      downvotes: song.votes.filter((v) => v.value === -1).length,
    }));

    songsWithScore.sort((a, b) => b.score - a.score);

    return songsWithScore.slice(0, limit);
  }

  private async getQueue(spaceId: string) {
    const songs = await this.app.prisma.songs.findMany({
      where: {
        spaceId,
        playedAt: null,
      },
      include: {
        votes: true,
      },
    });

    const songsWithScore = songs.map((song) => ({
      ...song,
      score: song.votes.reduce((sum, v) => sum + v.value, 0),
    }));

    songsWithScore.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      return new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime();
    });

    return songsWithScore;
  }

  async getSpaceVoteStats(spaceId: string) {
    const space = await this.app.prisma.space.findUnique({
      where: { id: spaceId },
    });

    if (!space) {
      throw new NotFoundError("Space not found");
    }

    const votes = await this.app.prisma.votes.findMany({
      where: {
        song: {
          spaceId,
          playedAt: null,
        },
      },
    });

    const totalUpvotes = votes.filter((v) => v.value === 1).length;
    const totalDownvotes = votes.filter((v) => v.value === -1).length;
    const totalVotes = votes.length;

    // most active voter
    const voterCounts = votes.reduce(
      (acc, vote) => {
        acc[vote.userId] = (acc[vote.userId] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const topVoterIds = Object.entries(voterCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([userId]) => userId);

    const topVoters = await this.app.prisma.user.findMany({
      where: {
        id: { in: topVoterIds },
      },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
      },
    });

    return {
      totalVotes,
      totalUpvotes,
      totalDownvotes,
      topVoters: topVoters.map((user) => ({
        ...user,
        votecount: voterCounts[user.id],
      })),
    };
  }
}
