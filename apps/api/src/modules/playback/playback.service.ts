import { FastifyInstance } from "fastify";
import { NTPService } from "./ntp.service";
import { CACHE_KEYS, REDIS_CHANNELS } from "../../config/constants";
import { NotFoundError } from "../../utils/error";

export interface PlaybackState {
  spaceId: string;
  currentSongId: string | null;
  startedAt: number; // absolute timestamp in ms
  pausedAt: number; // elapsed position when paused in ms
  isPaused: boolean;
  playbackRate: number;
}

export class PlaybackService {
  private ntpService: NTPService;

  constructor(private app: FastifyInstance) {
    this.ntpService = new NTPService(app);
  }

  private async readState(spaceId: string): Promise<PlaybackState | null> {
    try {
      const data = await this.app.redis.get(CACHE_KEYS.PLAYBACK(spaceId));
      return data ? JSON.parse(data) : null;
    } catch (error) {
      this.app.log.error({ error }, "Corrupted playback Redis state:");
      return null;
    }
  }

  private async writeState(spaceId: string, state: PlaybackState) {
    await this.app.redis.set(
      CACHE_KEYS.PLAYBACK(spaceId),
      JSON.stringify(state),
    );
  }

  private async publishState(
    spaceId: string,
    type: string,
    data: PlaybackState,
  ) {
    await this.app.redis.publish(
      REDIS_CHANNELS.PLAYBACK_EVENTS,
      JSON.stringify({ type, spaceId, data }),
    );
  }

  async getPlaybackState(spaceId: string): Promise<PlaybackState | null> {
    try {
      const cached = await this.app.redis.get(CACHE_KEYS.PLAYBACK(spaceId));
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      console.error("Could not get redis data: ", error);
    }

    return null;
  }

  async startPlayback(spaceId: string, songId: string): Promise<PlaybackState> {
    const startedAt = this.ntpService.getCurrentTime();

    const state: PlaybackState = {
      spaceId,
      currentSongId: songId,
      isPaused: false,
      pausedAt: 0,
      startedAt,
      playbackRate: 1.0,
    };

    // cache it
    await this.writeState(spaceId, state);

    // publish event
    await this.publishState(spaceId, "playback_started", state);

    // mark song as played in db
    await this.app.prisma.songs.update({
      where: { id: songId, spaceId },
      data: { playedAt: new Date() },
    });

    return state;
  }

  async pausePlayback(spaceId: string): Promise<PlaybackState> {
    const state = await this.readState(spaceId);

    if (!state) {
      throw new NotFoundError("No active playback");
    }

    if (state.isPaused) return state;

    const now = this.ntpService.getCurrentTime();
    const elapsed = (now - state.startedAt) * state.playbackRate;

    const updatedState: PlaybackState = {
      ...state,
      isPaused: true,
      pausedAt: elapsed, // in ms
    };

    await this.writeState(spaceId, updatedState);

    await this.publishState(spaceId, "playback_paused", updatedState);

    return updatedState;
  }

  async resumePlayback(spaceId: string): Promise<PlaybackState> {
    const state = await this.readState(spaceId);

    if (!state) throw new NotFoundError("No active playback");
    if (!state.isPaused) return state;

    const currentTime = this.ntpService.getCurrentTime();
    const newStartedAt = currentTime - state.pausedAt! / state.playbackRate;

    const updatedState: PlaybackState = {
      ...state,
      startedAt: newStartedAt,
      isPaused: false,
      pausedAt: 0,
    };

    await this.writeState(spaceId, updatedState);
    await this.publishState(spaceId, "playback_resumed", updatedState);

    return updatedState;
  }

  async getQueue(spaceId: string) {
    const songs = await this.app.prisma.songs.findMany({
      where: {
        spaceId,
        playedAt: null,
      },
      include: {
        votes: true,
        addedBy: {
          select: { id: true, email: true, name: true },
        },
      },
    });

    return songs
      .map((song) => ({
        ...song,
        score: song.votes.reduce((sum, v) => sum + v.value, 0),
      }))
      .sort((a, b) => b.score - a.score);
  }

  async skipToNext(spaceId: string): Promise<PlaybackState | null> {
    // get queue
    const queue = await this.getQueue(spaceId);

    if (queue.length === 0) {
      // no songs, clear playback
      await this.app.redis.del(CACHE_KEYS.PLAYBACK(spaceId));
      return null;
    }

    const nextSong = queue[0];

    if (!nextSong) {
      return null;
    }

    // mark skipped song as played
    await this.app.prisma.songs.update({
      where: { id: nextSong.id },
      data: { playedAt: new Date() },
    });

    // start next song
    return this.startPlayback(spaceId, nextSong.id);
  }
}
