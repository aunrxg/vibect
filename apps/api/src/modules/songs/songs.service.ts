import { FastifyInstance } from "fastify";
import { YoutubeService } from "../../lib/youtube";
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "../../utils/error";
import { CACHE_KEYS, REDIS_CHANNELS } from "../../config/constants";
import { calculatePagination } from "../../utils/response";

export class SongService {
  private youtubeService: YoutubeService;

  constructor(private app: FastifyInstance) {
    this.youtubeService = new YoutubeService();
  }

  async search(query: string, maxResult: number = 10) {
    try {
      const result = await this.youtubeService.search(query, maxResult);
      return result;
    } catch (error) {
      this.app.log.error({ error }, "Youtube search Error: ");
      throw new BadRequestError("Faild to search Youtube", error);
    }
  }

  async addSong(
    spaceId: string,
    youtubeUrl: string,
    isAnonymous: boolean = false,
    userId: string,
  ) {
    // extract video id from youtube url
    const videoId = YoutubeService.extractVideoId(youtubeUrl);
    if (!videoId) {
      throw new BadRequestError("Invalid Youtube URL");
    }

    // check space in db
    const space = await this.app.prisma.space.findUnique({
      where: { id: spaceId },
    });
    if (!space) {
      throw new NotFoundError("Space not found");
    }

    // check video details first (before checking duplicates)
    let videoDetails;
    try {
      videoDetails = await this.youtubeService.getVideoById(videoId);
    } catch (error) {
      this.app.log.error({ error }, "Failed to fetch video details: ");
      throw new BadRequestError(
        "Could not fetch video details. video may be unavailable",
      );
    }

    //validate video is embeddable
    const isValid = await this.youtubeService.validateVideo(videoId);
    if (!isValid) {
      throw new BadRequestError("This video connot be played");
    }

    // for anonymous users, we need a way to track who added it
    // we can store it in a JSON field or create a separate tracking mechanism

    try {
      const song = await this.app.prisma.songs.create({
        data: {
          youtubeId: videoId,
          title: videoDetails.title,
          artist: videoDetails.artist,
          duration: videoDetails.duration,
          thumbnailUrl: videoDetails.thumbnail,
          spaceId,
          // if anon user store in addedByAnon field else in addedById
          addedById: isAnonymous ? null : userId,
          addedByAnonymous: isAnonymous ? userId : null,
        },
        include: {
          addedBy: {
            select: {
              id: true,
              email: true,
              name: true,
              avatarUrl: true,
            },
          },
          votes: true,
          anonymousVotes: true,
        },
      });

      const score =
        song.votes.reduce((sum, v) => sum + v.value, 0) +
        song.anonymousVotes.reduce((sum, v) => sum + v.value, 0);

      // update cache
      await this.app.redis.del(CACHE_KEYS.QUEUE(spaceId));

      // pub event
      await this.app.redis.publish(
        REDIS_CHANNELS.SPACE_EVENTS,
        JSON.stringify({
          type: "song_added",
          spaceId,
          data: {
            ...song,
            score,
            addedBy: isAnonymous
              ? {
                  id: userId,
                  name: this.generateAnonymousName(userId), //TODO get name from frontend or generate
                  isAnonymous: true,
                }
              : song.addedById,
          },
        }),
      );

      return {
        ...song,
        score,
        addedBy: isAnonymous
          ? {
              id: userId,
              name: this.generateAnonymousName(userId),
              isAnonymous: true,
            }
          : song.addedBy,
      };
    } catch (error: any) {
      // handle unique contraint error
      if (error.code === "P2002") {
        // prisma unique contraint error
        this.app.log.info(
          `Duplicate song attemp: ${videoId} in space ${spaceId}`,
        );
        throw new ConflictError("This song is already in queue");
      }
      throw error;
    }
  }

  private generateAnonymousName(anonymousId: string): string {
    const shortId = anonymousId.slice(-6);
    return `Guest ${shortId}`;
  }

  async getQueue(spaceId: string, page = 1, limit = 20) {
    const space = await this.app.prisma.space.findUnique({
      where: { id: spaceId },
    });
    if (!space) {
      throw new NotFoundError("space not found");
    }

    const [songs, total] = await Promise.all([
      this.app.prisma.songs.findMany({
        where: {
          spaceId,
          playedAt: null,
        },
        include: {
          votes: true,
          anonymousVotes: true,
          addedBy: true,
        },
      }),
      this.app.prisma.songs.count({
        where: {
          spaceId,
          playedAt: null,
        },
      }),
    ]);

    // vote score calculation
    const songWithScores = songs.map((song) => {
      const score =
        song.votes.reduce((sum, vote) => sum + vote.value, 0) +
        song.anonymousVotes.reduce((sum, v) => sum + v.value, 0);

      // who added
      let addedBy;
      if (song.addedBy) {
        // registered user
        addedBy = song.addedBy;
      } else if (song.addedByAnonymous) {
        // anonymous user
        addedBy = {
          id: song.addedByAnonymous,
          name: this.generateAnonymousName(song.addedByAnonymous),
          email: `${song.addedByAnonymous}@anonymous.local`,
          avatarUrl: null,
          isAnonymous: true,
        };
      }
      return {
        ...song,
        score,
        addedBy,
        userVoteCount: song.votes.length,
        anonymousVoteCount: song.anonymousVotes.length,
      };
    });

    // sort for queue
    songWithScores.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime();
    });

    const startIndex = (page - 1) * limit;
    const paginatedSongs = songWithScores.slice(startIndex, startIndex + limit);

    const meta = calculatePagination(page, limit, total);

    return {
      songs: paginatedSongs,
      meta,
    };
  }

  async deleteSong(
    songId: string,
    userId: string,
    isAnonymous: boolean = false,
  ) {
    const song = await this.app.prisma.songs.findUnique({
      where: { id: songId },
      include: {
        space: true,
      },
    });
    if (!song) {
      throw new NotFoundError("Song not found");
    }

    if (song.playedAt) {
      throw new BadRequestError("Cannot delete a song that has already played");
    }

    const canDelete =
      (isAnonymous && song.addedByAnonymous === userId) ||
      (!isAnonymous && song.addedById === userId) ||
      song.space.ownerId === userId;

    if (!canDelete) {
      throw new ForbiddenError(
        "You can only delete songs you added or if you own the space",
      );
    }
    await this.app.prisma.songs.delete({
      where: { id: songId },
    });

    await this.app.redis.del(CACHE_KEYS.QUEUE(song.spaceId));

    await this.app.redis.publish(
      REDIS_CHANNELS.SPACE_EVENTS,
      JSON.stringify({
        type: "song_deleted",
        spaceId: song.spaceId,
        data: { songId },
      }),
    );

    return { success: true };
  }

  async getHistory(spaceId: string, page = 1, limit = 20) {
    const space = await this.app.prisma.space.findUnique({
      where: { id: spaceId },
    });
    if (!space) {
      throw new NotFoundError("Space not found");
    }

    const [songs, total] = await Promise.all([
      this.app.prisma.songs.findMany({
        where: {
          spaceId,
          playedAt: { not: null },
        },
        include: {
          addedBy: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
          votes: true,
        },
        orderBy: {
          playedAt: "desc",
        },
        skip: (page - 1) * limit,
        take: limit,
      }),

      this.app.prisma.songs.count({
        where: {
          spaceId,
          playedAt: { not: null },
        },
      }),
    ]);

    const meta = calculatePagination(page, limit, total);

    return {
      songs: songs.map((song) => ({
        ...song,
        score: song.votes.reduce((sum, vote) => sum + vote.value, 0),
      })),
      meta,
    };
  }
}
