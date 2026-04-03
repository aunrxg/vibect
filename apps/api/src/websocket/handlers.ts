import { FastifyInstance, FastifyRequest } from "fastify";
import { jwtVerify } from "jose";
import { ConnectionManager } from "./connection-manager";
import {
  AuthenticatedWebSocket,
  JoinSpacePayload,
  TimeSyncPayload,
  WSEvents,
} from "./types";
import { CACHE_KEYS } from "../config/constants";
import { NTPService } from "../modules/playback/ntp.service";
import { config } from "../config";
import { PlaybackService } from "../modules/playback/playback.service";

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
        if (token.startsWith("anon_")) {
          socket.isAnonymous = true;
        } else {
          try {
            const secret = new TextEncoder().encode(config.supabase.jwtSecret);
            const { payload } = await jwtVerify(token, secret);
            const userId = payload.sub as string;

            if (userId) {
              const dbUser = await this.app.prisma.user.findUnique({
                where: { id: userId },
                select: {
                  id: true,
                  name: true,
                  avatarUrl: true,
                  email: true,
                },
              });

              if (dbUser) {
                socket.userId = dbUser.id;
                socket.name =
                  dbUser.name || dbUser.email.split("@")[0] || "Viber";
                socket.avatarUrl = dbUser.avatarUrl || undefined;
                socket.isAnonymous = false;
                this.app.log.info(
                  { userId: dbUser.id, name: socket.name },
                  "Websocket user authenticated via JWT",
                );
              }
            }
          } catch (error) {
            this.app.log.warn({ error }, "Failed to verify JWT for websocket");
          }
        }
      }

      if (!socket.userId) {
        socket.isAnonymous = true;
        socket.name = `Guest ${socket.clientId.slice(0, 4)}`;
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
      const playbackService = new PlaybackService(this.app);
      const queue = await playbackService.getQueue(spaceId);

      this.sendMessage(socket, WSEvents.QUEUE_UPDATED, {
        queue,
      });

      // notify everyone in space (including joining user)
      const members = this.connectionManager.getSpaceMembers(spaceId);
      this.connectionManager.broadcastToSpace(
        spaceId,
        JSON.stringify({
          type: WSEvents.USER_JOINED,
          data: {
            clientId: socket.clientId,
            userId: socket.userId,
            memberCount: members.length,
            members: members,
          },
        }),
      );

      this.app.log.info(`Client ${socket.clientId} joined space ${spaceId}`);

      // set up drift correction sync periodically
      if (!(socket as any).syncInterval) {
        (socket as any).syncInterval = setInterval(() => {
          this.sendMessage(socket, "TIME_SYNC_REQUIRED" as any);
        }, 60000);
      }
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
    const members = this.connectionManager.getSpaceMembers(spaceId);

    if ((socket as any).syncInterval) {
      clearInterval((socket as any).syncInterval);
      delete (socket as any).syncInterval;
    }

    // notify other socket
    this.connectionManager.broadcastToSpace(
      spaceId,
      JSON.stringify({
        type: WSEvents.LEAVE_SPACE,
        data: {
          clientId: socket.clientId,
          userId: socket.userId,
          memberCount: members.length,
          members: members,
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
    const serverReceiveTime = Date.now();
    const { clientTimeStamp } = payload;
    const ntpService = new NTPService(request.server);

    const response = ntpService.processTimeSyncRequest(
      clientTimeStamp,
      serverReceiveTime,
    );

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
