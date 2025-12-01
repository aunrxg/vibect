import { FastifyInstance } from "fastify";

export class NTPService {
  constructor(private app: FastifyInstance) {}

  // process time sync requests from client
  // return server timestamp for client to calculate offset

  processTimeSyncRequest(clientTimestamp: number): {
    clientTimestamp: number;
    serverTimestamp: number;
  } {
    const serverTimestamp = this.getCurrentTime();

    return {
      clientTimestamp,
      serverTimestamp,
    };
  }

  // get current server time
  getCurrentTime(): number {
    return Date.now();
  }

  // calculate playback position based on server time
  calculatePlaybackPosition(args: {
    startedAt: number;
    isPaused: boolean;
    pausedAt: number | null;
    playbackRate: number;
  }): number {
    const { startedAt, isPaused, pausedAt, playbackRate } = args;
    if (isPaused && pausedAt !== null) {
      return pausedAt;
    }

    const elapsedMs = this.getCurrentTime() - startedAt;
    const elapsedSeconds = (elapsedMs / 1000) * playbackRate;

    return Math.max(0, elapsedSeconds);
  }
}
