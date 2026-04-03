import { FastifyInstance } from "fastify";

export class NTPService {
  constructor(private app: FastifyInstance) {}

  // process time sync requests from client
  // return server timestamp for client to calculate offset

  processTimeSyncRequest(
    clientTimestamp: number,
    serverReceiveTime?: number,
  ): {
    clientTimestamp: number;
    serverReceiveTime: number;
    serverTransmitTime: number;
    serverTimestamp: number;
  } {
    const current = this.getCurrentTime();
    return {
      clientTimestamp,
      serverReceiveTime: serverReceiveTime || current,
      serverTransmitTime: current,
      serverTimestamp: current,
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
