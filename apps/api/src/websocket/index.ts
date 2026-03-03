import { FastifyInstance, FastifyRequest } from "fastify";
import fastifyWebSocket from "@fastify/websocket";
import { ConnectionManager } from "./connection-manager";
import { WebSocketHandlers } from "./handlers";
import { RedisSubscriber } from "./redis-subscriber";
import {
  AuthenticatedWebSocket,
  JoinSpacePayload,
  TimeSyncPayload,
  WSEvents,
  WSMessage,
} from "./types";
import { randomBytes } from "crypto";

const HEARTBEAT_INTERVAL = 30_000;

export async function setupWebSocket(fastify: FastifyInstance) {
  // register ws plugin
  await fastify.register(fastifyWebSocket, {
    options: {
      maxPayload: 1048576,
      clientTracking: true,
    },
  });

  // init managers
  const connectionManager = new ConnectionManager();
  const handlers = new WebSocketHandlers(fastify, connectionManager);
  const redisSubscriber = new RedisSubscriber(fastify, connectionManager);

  // sub to channels
  await redisSubscriber.subscribe();

  // ws routes
  fastify.get("/ws", { websocket: true }, (s, request) => {
    const socket = initializeSocket(s as AuthenticatedWebSocket);

    fastify.log.info(`Websocket client connected: ${socket.clientId}`);

    // heart beat
    const heatbeat = setupHeatbeat(socket);

    // const heartbeatInterval = setInterval(() => {
    //   if (!socket.isAlive) {
    //     clearInterval(heartbeatInterval);
    //     if (socket.readyState === socket.OPEN) {
    //       socket.terminate();
    //     }
    //     return;
    //   }

    //   socket.isAlive = false;
    //   socket.ping();
    // }, 30000);

    // pong
    socket.on("pong", () => {
      socket.isAlive = true;
    });

    // message
    socket.on("message", async (data: Buffer) => {
      handleMessage(fastify, socket, data, request, handlers);
    });

    socket.on("close", () =>
      cleanupSocket(fastify, socket, heatbeat, connectionManager),
    );
    socket.on("error", () =>
      cleanupSocket(fastify, socket, heatbeat, connectionManager),
    );
  });

  fastify.addHook("onClose", async () => {
    await redisSubscriber.unsubscribe();
    fastify.log.info("Websocket server closed");
  });

  fastify.log.info("Websocket server configured at /ws");
}

function initializeSocket(
  socket: AuthenticatedWebSocket,
): AuthenticatedWebSocket {
  socket.clientId = randomBytes(16).toString("hex");
  socket.isAlive = true;

  socket.on("pong", () => {
    socket.isAlive = true;
  });

  return socket;
}

function cleanupSocket(
  app: FastifyInstance,
  socket: AuthenticatedWebSocket,
  headbeat: NodeJS.Timeout,
  manager: ConnectionManager,
) {
  clearInterval(headbeat);

  const spaceId = socket.spaceId;
  manager.removeConnection(socket);

  if (spaceId) {
    const members = manager.getSpaceMembers(spaceId);
    manager.broadcastToSpace(
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
    );
  }

  app.log.info(`WS disconnected: ${socket.clientId}`);
}

function setupHeatbeat(socket: AuthenticatedWebSocket): NodeJS.Timeout {
  return setInterval(() => {
    if (!socket.isAlive) {
      if (socket.readyState === socket.OPEN) {
        socket.terminate();
      }
      return;
    }

    socket.isAlive = false;
    socket.ping();
  }, HEARTBEAT_INTERVAL);
}

function handleMessage(
  app: FastifyInstance,
  socket: AuthenticatedWebSocket,
  buffer: Buffer,
  request: FastifyRequest,
  handlers: WebSocketHandlers,
) {
  let message: WSMessage;

  try {
    message = JSON.parse(buffer.toString());
  } catch (error) {
    app.log.error({ error }, "Error processing messages");
    return sendError(socket, "Invalid JSON payload");
  }

  const { type, data } = message;

  app.log.debug(`WS ${type} from ${socket.clientId}`);

  try {
    switch (type) {
      case WSEvents.JOIN_SPACE:
        handlers.handleJoinSpace(socket, data as JoinSpacePayload); // should change later
        break;

      case WSEvents.LEAVE_SPACE:
        handlers.handleLeaveSpace(socket);
        break;

      case WSEvents.TIME_SYNC:
        handlers.handleTimeSync(socket, data as TimeSyncPayload, request);
        break;

      case WSEvents.PING:
        handlers.handlePing(socket);
        break;

      default:
        sendError(socket, `Unknown event: ${type}`);
    }
  } catch (error) {
    app.log.error({ error }, "WS handler error");
    sendError(socket, "Internal websocket error");
  }
}

function sendError(socket: AuthenticatedWebSocket, message: string) {
  if (socket.readyState === socket.OPEN) {
    socket.send(
      JSON.stringify({
        type: WSEvents.ERROR,
        data: { message },
      }),
    );
  }
}
