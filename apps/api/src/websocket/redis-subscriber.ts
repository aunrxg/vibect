import { FastifyInstance } from "fastify";
import { ConnectionManager } from "./connection-manager";
import { REDIS_CHANNELS } from "../config/constants";

export class RedisSubscriber {
  constructor(
    private app: FastifyInstance,
    private connectionManager: ConnectionManager,
  ) {}

  async subscribe(): Promise<void> {
    const channels = [
      REDIS_CHANNELS.PLAYBACK_EVENTS,
      REDIS_CHANNELS.SPACE_EVENTS,
      REDIS_CHANNELS.VOTE_EVENTS,
    ];

    await this.app.redisSub.subscribe(...channels);

    this.app.redisSub.on("message", (channel, message) => {
      this.handleRedisMessage(channel, message);
    });

    this.app.log.info(`Subscribed to Redis channel ${channels.join(", ")}`);
  }

  private handleRedisMessage(channel: string, message: string): void {
    try {
      const event = JSON.parse(message);
      const { spaceId, type, data } = event;

      if (!spaceId) {
        this.app.log.warn("Redis message missing spaceId");
        return;
      }

      this.connectionManager.broadcastToSpace(
        spaceId,
        JSON.stringify({ type, data }),
      );

      this.app.log.debug(`Broadcasted ${type} to space ${spaceId}`);
    } catch (error) {
      this.app.log.error("Error handling Redis message");
      console.error(error);
    }
  }

  async unsubscribe(): Promise<void> {
    await this.app.redisSub.unsubscribe();
    this.app.log.info(`Unsubscribed from Redis channels`);
  }
}
