import { FastifyInstance } from "fastify";
import fastifyWebSocket from "@fastify/websocket";
import { ConnectionManager } from "./connection-manager";
import { WebSocketHandlers } from "./handlers";
import { RedisSubscriber } from "./redis-subscriber";
import { AuthenticatedWebSocket, WSEvents, WSMessage } from "./types";
import { randomBytes } from "crypto";

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
  fastify.get("/ws", { websocket: true }, (connection, _) => {
    const socket = (connection as any).socket as AuthenticatedWebSocket;

    socket.clientId = randomBytes(16).toString("hex");
    socket.isAlive = true;

    fastify.log.info(`Websocket client connected: ${socket.clientId}`);

    // heart beat
    const heartbeatInterval = setInterval(() => {
      if (!socket.isAlive) {
        clearInterval(heartbeatInterval);
        if (socket.readyState === socket.OPEN) {
          socket.terminate();
        }
        return;
      }

      socket.isAlive = false;
      socket.ping();
    }, 30000);

    // pong
    socket.on("pong", () => {
      socket.isAlive = true;
    });

    // message
    socket.on("message", async (data: Buffer) => {
      try {
        const message: WSMessage = JSON.parse(data.toString());
        const { type, data: payload } = message;

        fastify.log.debug(`Receive ${type} from ${socket.clientId}`);

        // route to handlers
        switch (type) {
          case WSEvents.JOIN_SPACE:
            await handlers.handleJoinSpace(socket, payload);
            break;

          case WSEvents.LEAVE_SPACE:
            await handlers.handleLeaveSpace(socket);
            break;

          case WSEvents.TIME_SYNC:
            await handlers.handleTimeSync(socket, payload);
            break;

          case WSEvents.PING:
            handlers.handlePing(socket);
            break;

          default:
            socket.send(
              JSON.stringify({
                type: WSEvents.ERROR,
                data: { message: `Unknown event type: ${type}` },
              }),
            );
        }
      } catch (error) {
        fastify.log.error("Error processing websocket message: ");
        console.error(error);
        socket.send(
          JSON.stringify({
            type: WSEvents.ERROR,
            data: { message: "Invalid message format" },
          }),
        );
      }
    });

    socket.on("error", () => {
      clearInterval(heartbeatInterval);
    });

    socket.on("close", () => {
      clearInterval(heartbeatInterval);
      connectionManager.removeConnection(socket);
      fastify.log.info(`WebSocket client disconnected: ${socket.clientId}`);
    });
  });

  fastify.addHook("onClose", async () => {
    await redisSubscriber.unsubscribe();
    fastify.log.info("Websocket server closed");
  });

  fastify.log.info("Websocket server configured at /ws");
}
