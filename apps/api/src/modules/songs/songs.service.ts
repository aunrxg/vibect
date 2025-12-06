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

  async addSong(spaceId: string, youtubeUrl: string, userId: string) {
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

    // check if song already in space
    const existingSong = await this.app.prisma.songs.findFirst({
      where: {
        spaceId,
        youtubeId: videoId,
        playedAt: null, // check if unplayed...
      },
    });
    if (existingSong) {
      throw new ConflictError("This is song is already in queue");
    }

    // fetch video details
    let videoDetails;
    try {
      videoDetails = await this.youtubeService.getVideoById(videoId);
    } catch (error) {
      this.app.log.error({ error }, "Failed to fetch video details: ");
      throw new BadRequestError(
        "Could not fetch video details. video may be unavailable",
        error,
      );
    }

    const song = await this.app.prisma.songs.create({
      data: {
        youtubeId: videoId,
        title: videoDetails.title,
        artist: videoDetails.artist,
        duration: videoDetails.duration,
        thumbnailUrl: videoDetails.thumbnail,
        spaceId,
        addedById: userId,
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
    });

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
          score: 0,
        },
      }),
    );

    return song;
  }

  async getQueue(spaceId: string, page = 1, limit = 50) {
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
          addedBy: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
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
    const songWithScores = songs.map((song) => ({
      ...song,
      score: song.votes.reduce((sum, vote) => sum + vote.value, 0),
    }));

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

  async deleteSong(songId: string, userId: string) {
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
    if (song.addedById !== userId) {
      throw new ForbiddenError("Only song adder or creator can delete a song");
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

  async getHistory(spaceId: string, page = 1, limit = 50) {
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
