import { FastifyInstance, FastifyRequest } from "fastify";
import { ConnectionManager } from "./connection-manager";
import {
  AuthenticatedWebSocket,
  JoinSpacePayload,
  TimeSyncPayload,
  WSEvents,
} from "./types";
import { CACHE_KEYS } from "../config/constants";
import { NTPService } from "../modules/playback/ntp.service";

export class WebSocketHandlers {
  constructor(
    private app: FastifyInstance,
    private connectionManager: ConnectionManager,
  ) {}

  async handleJoinSpace(
    socket: AuthenticatedWebSocket,
    payload: JoinSpacePayload,
  ): Promise<void> {
    const { spaceId, token } = payload;

    try {
      const space = await this.app.prisma.space.findUnique({
        where: { id: spaceId },
      });

      if (!space) {
        this.sendError(socket, "Space not found");
        return;
      }

      // authenticate user from token
      if (token) {
        try {
          const {
            data: { user },
          } = await this.app.supabase.auth.getUser(token);
          if (user) {
            socket.userId = user.id;
          }
        } catch (error) {
          this.app.log.warn({ error }, "Failed to authenticate websocket user"); // anon user
        }
      }

      // add to space
      this.connectionManager.addToSpace(spaceId, socket);

      // send current playback state
      const playbackState = await this.app.redis.get(
        CACHE_KEYS.PLAYBACK(spaceId),
      );

      if (playbackState) {
        try {
          this.sendMessage(
            socket,
            WSEvents.PLAYBACK_UPDATED,
            JSON.parse(playbackState),
          );
        } catch (error) {
          this.app.log.warn({ error }, "Invalid playback cache");
        }
      }

      //send current queue EXPENSIVE OPERARION SHOULD MOVE TO REDIS LATER
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
            },
          },
        },
      });

      const songsWithScores = songs.map((song) => ({
        ...song,
        score: song.votes.reduce((sum, v) => sum + v.value, 0),
      }));

      songsWithScores.sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        return new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime();
      });

      this.sendMessage(socket, WSEvents.QUEUE_UPDATED, {
        queue: songsWithScores,
      });

      // notify others in space
      this.connectionManager.broadcastToSpace(
        spaceId,
        JSON.stringify({
          type: WSEvents.USER_JOINED,
          data: {
            clientId: socket.clientId,
            userId: socket.userId,
            memberCount: this.connectionManager.getSpaceMemberCount(spaceId),
          },
        }),
        socket,
      );

      this.app.log.info(`Client ${socket.clientId} joined space ${spaceId}`);
    } catch (error) {
      this.app.log.error({ error }, "Error handling JOIN_SPACE");
      this.sendError(socket, "Failed to join space");
    }
  }

  handleLeaveSpace(socket: AuthenticatedWebSocket): void {
    // get space
    const spaceId = socket.spaceId;

    if (!spaceId) {
      this.sendError(socket, "space not found");
      return;
    }

    // leave
    this.connectionManager.removeFromSpace(spaceId, socket);
    const count = this.connectionManager.getSpaceMemberCount(spaceId);

    // notify other socket
    this.connectionManager.broadcastToSpace(
      spaceId,
      JSON.stringify({
        type: WSEvents.LEAVE_SPACE,
        data: {
          clientId: socket.clientId,
          userId: socket.userId,
          memberCount: count,
        },
      }),
      socket,
    );
  }

  handleTimeSync(
    socket: AuthenticatedWebSocket,
    payload: TimeSyncPayload,
    request: FastifyRequest,
  ): void {
    const { clientTimeStamp } = payload;
    const ntpService = new NTPService(request.server);

    const response = ntpService.processTimeSyncRequest(clientTimeStamp);

    this.sendMessage(socket, WSEvents.TIME_SYNC_RESPONSE, response);
  }

  handlePing(socket: AuthenticatedWebSocket): void {
    socket.isAlive = true;
    this.sendMessage(socket, WSEvents.PONG, { timeStamp: Date.now() });
  }

  private sendMessage(
    socket: AuthenticatedWebSocket,
    type: string,
    data?: unknown,
  ): void {
    if (socket.readyState !== socket.OPEN) return;

    try {
      socket.send(JSON.stringify({ type, data }));
    } catch (error) {
      this.app.log.warn({ error, clientId: socket.clientId }, "WS Send Failed");
      this.connectionManager.removeConnection(socket);
    }
  }

  private sendError(socket: AuthenticatedWebSocket, message: string): void {
    this.sendMessage(socket, WSEvents.ERROR, { message });
  }
}
