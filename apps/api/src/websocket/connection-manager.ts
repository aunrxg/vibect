import { AuthenticatedWebSocket } from "./types";

export class ConnectionManager {
  // Map of spaceId -> Set of WebSocket connections
  private spaceConnections = new Map<string, Set<AuthenticatedWebSocket>>();

  // Map of clientId -> WebSocket connection
  private clientConnections = new Map<string, AuthenticatedWebSocket>();

  // add connection to spce
  addToSpace(spaceId: string, socket: AuthenticatedWebSocket): void {
    if (!this.spaceConnections.has(spaceId)) {
      this.spaceConnections.set(spaceId, new Set());
    }

    this.spaceConnections.get(spaceId)!.add(socket);
    this.clientConnections.set(socket.clientId, socket);
    socket.spaceId = spaceId;

    console.log(`Client ${socket.clientId} joined space ${spaceId}`);
  }

  removeFromSpace(spaceId: string, socket: AuthenticatedWebSocket): void {
    const connections = this.spaceConnections.get(spaceId);

    if (connections) {
      connections.delete(socket);

      if (connections.size === 0) {
        this.spaceConnections.delete(spaceId);
      }
    }

    socket.spaceId = undefined;
    console.log(`Client ${socket.clientId} left space ${spaceId}`);
  }

  removeConnection(socket: AuthenticatedWebSocket): void {
    if (socket.spaceId) {
      this.removeFromSpace(socket.spaceId, socket);
    }

    this.clientConnections.delete(socket.clientId);
    console.log(`Client ${socket.clientId} disconnected`);
  }

  getSpaceConnections(spaceId: string): Set<AuthenticatedWebSocket> {
    return this.spaceConnections.get(spaceId) || new Set();
  }

  getConnection(clientId: string): AuthenticatedWebSocket | undefined {
    return this.clientConnections.get(clientId);
  }

  broadcastToSpace(
    spaceId: string,
    message: string,
    excludeSocket?: AuthenticatedWebSocket,
  ): void {
    const connections = this.getSpaceConnections(spaceId);

    connections.forEach((socket) => {
      if (socket !== excludeSocket && socket.readyState === socket.OPEN) {
        socket.send(message);
      }
    });
  }

  sendToClient(clientId: string, message: string): boolean {
    const socket = this.getConnection(clientId);

    if (socket && socket.readyState === socket.OPEN) {
      socket.send(message);
      return true;
    }

    return false;
  }

  getConnectionCount(): number {
    return this.clientConnections.size;
  }

  getSpaceMemberCount(spaceId: string): number {
    return this.getSpaceConnections(spaceId).size;
  }

  getActivespaces(): string[] {
    return Array.from(this.spaceConnections.keys());
  }
}
