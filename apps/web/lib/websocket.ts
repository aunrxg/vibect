import { queryClient } from "./queryClient";
import { ConnectionState } from "./types";
import { useAuthStore } from "@/store/use-auth-store";
import { useSpaceStore } from "@/store/use-space-store";

export enum WSEvents {
  // Client -> Server
  JOIN_SPACE = "join_space",
  LEAVE_SPACE = "leave_space",
  TIME_SYNC = "time_sync",
  PING = "ping",

  // Server -> Client
  SPACE_STATE = "space_state",
  SONG_ADDED = "song_added",
  SONG_VOTED = "song_voted",
  QUEUE_UPDATED = "queue_updated",
  PLAYBACK_UPDATED = "playback_updated",
  USER_JOINED = "user_joined",
  TIME_SYNC_RESPONSE = "time_sync_response",
  TIME_SYNC_REQUIRED = "TIME_SYNC_REQUIRED",
  PONG = "pong",
  ERROR = "error",
}

interface WSMessage<T = any> {
  type: WSEvents;
  data?: T;
}

interface JoinSpacePayload {
  spaceId: string;
  token?: string;
}

interface PlaybackState {
  spaceId: string;
  currentSongId: string | null;
  startedAt: number | null;
  isPaused: boolean;
  playbackRate: number;
}

class WebSocketClient {
  // record clock drift
  private syncSamples: { offset: number; rtt: number; timestamp: number }[] =
    [];
  private maxSample = 10;

  private ws: WebSocket | null = null;
  private currentSpaceId: string | null = null;
  private token: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private pingInterval: NodeJS.Timeout | null = null;
  private connectionState: ConnectionState = "disconnected";
  private eventListeners: Map<string, Set<Function>> = new Map();
  private messageQueue: WSMessage[] = [];

  constructor(
    private url: string = process.env.NEXT_PUBLIC_WS_URL ||
      "ws://localhost:4000/ws",
  ) {}

  connect(token?: string): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN) {
      if (token !== this.token) {
        console.log("Token changed, reconnecting...");
        this.disconnect();
      } else {
        console.log("Already connected!");
        return Promise.resolve();
      }
    }

    if (this.connectionState === "connecting") {
      console.log("Connection already in progress");
      return Promise.resolve();
    }

    this.token = token || null;
    this.connectionState = "connecting";

    return new Promise((resolve, reject) => {
      try {
        console.log(`Connecting to ${this.url}`);
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log("Websocket connected!");
          this.connectionState = "connected";
          this.reconnectAttempts = 0;
          this.startPingInterval();
          this.flushMessageQueue();
          this.emit("connect");
          resolve();
        };

        this.ws.onerror = (err) => {
          console.error("Websocket error: ", err);
          this.emit("error", err);
          reject(err);
        };

        this.ws.onclose = (event) => {
          console.log(`Websocket closed:`, event.code, event.reason);
          this.connectionState = "disconnected";
          this.cleanup();
          this.emit("disconnect");

          if (
            event.code !== 1000 &&
            this.reconnectAttempts < this.maxReconnectAttempts
          ) {
            this.scheduleReconnect();
          }
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };
      } catch (error) {
        console.error("Failed to create websocket:", error);
        this.connectionState = "disconnected";
        reject(error);
      }
    });
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.currentSpaceId) {
      this.leaveSpace();
    }

    this.cleanup();

    if (this.ws) {
      this.ws.close(1000, "Client disconnecting...");
      this.ws = null;
    }

    this.connectionState = "disconnected";
    console.log("Disconnected!!");
  }

  joinSpace(spaceId: string) {
    if (!spaceId) {
      console.error("Invalid spaceId");
      return;
    }

    if (this.currentSpaceId && this.currentSpaceId !== spaceId) {
      this.leaveSpace();
    }

    this.currentSpaceId = spaceId;

    const payload: JoinSpacePayload = {
      spaceId,
      ...(this.token && { token: this.token }),
    };

    this.send(WSEvents.JOIN_SPACE, payload);
    console.log("joining space: ", spaceId);

    // Trigger initial time calibration metrics
    setTimeout(() => this.requestTimeSync(), 100);
  }

  leaveSpace() {
    if (!this.currentSpaceId) return;

    this.send(WSEvents.LEAVE_SPACE);
    console.log("leaving space: ", this.currentSpaceId);
    this.currentSpaceId = null;
  }

  private send(type: WSEvents, data?: any) {
    const message: WSMessage = { type, data };

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.log("Queuing message", type);
      this.messageQueue.push(message);
    }
  }

  private flushMessageQueue() {
    if (this.messageQueue.length === 0) return;

    console.log(`Flushing ${this.messageQueue.length} queued message`);

    while (this.messageQueue.length > 0) {
      const msg = this.messageQueue.shift()!;
      this.ws?.send(JSON.stringify(msg));
    }
  }

  private handleMessage(raw: string) {
    try {
      const message: WSMessage = JSON.parse(raw);
      const { type, data: payload } = message;

      switch (type) {
        case WSEvents.QUEUE_UPDATED:
          this.handleQueueUpdated(payload);
          break;
        case WSEvents.SONG_ADDED:
          this.handleSongAdded(payload);
          break;
        case WSEvents.SONG_VOTED:
          this.handleSongVote(payload);
          break;
        case WSEvents.PLAYBACK_UPDATED:
          this.handlePlaybackUpdate(payload);
          break;
        case WSEvents.USER_JOINED:
        case WSEvents.LEAVE_SPACE:
          this.handleUserJoined(payload);
          break;
        case WSEvents.SPACE_STATE:
          this.handleSpaceState(payload);
          break;
        case WSEvents.TIME_SYNC_RESPONSE:
          this.handleTimeSyncResponse(payload);
          break;
        case WSEvents.TIME_SYNC_REQUIRED:
          this.requestTimeSync();
          break;
        case WSEvents.PONG:
          console.log("Pong Received");
          break;
        case WSEvents.ERROR:
          console.error("Server error: ", payload);
          this.emit("error", payload);
          break;
        default:
          console.warn(`Unknown event type: ${type}`);
      }

      this.emit(type, payload);
    } catch (err) {
      console.error("Invalid WS message: ", err);
    }
  }

  private handleQueueUpdated(data: { queue: any[] }) {
    if (!this.currentSpaceId) return;
    const identityKey = useAuthStore.getState().identityKey();
    console.log("Queue updated: ", data.queue.length, "songs");
    queryClient.invalidateQueries({
      queryKey: ["queue", this.currentSpaceId, identityKey],
    });
  }

  private handleSongAdded(data: any) {
    if (!this.currentSpaceId) return;
    const identityKey = useAuthStore.getState().identityKey();
    console.log("Song added: ", data.song?.title);
    queryClient.invalidateQueries({
      queryKey: ["queue", this.currentSpaceId, identityKey],
    });
  }

  private handleSongVote(data: any) {
    if (!this.currentSpaceId) return;
    const identityKey = useAuthStore.getState().identityKey();
    console.log("Song voted: ", data.songId);

    queryClient.setQueryData(
      ["queue", this.currentSpaceId, identityKey],
      (oldQueue: any) => {
        if (!oldQueue) return oldQueue;
        return {
          ...oldQueue,
          songs: (oldQueue.songs || [])
            .map((song: any) =>
              song.id === data.songId
                ? { ...song, voteCount: data.voteCount || song.voteCount }
                : song,
            )
            .sort((a: any, b: any) => (b.voteCount || 0) - (a.voteCount || 0)),
        };
      },
    );
  }

  private handlePlaybackUpdate(data: PlaybackState) {
    const identityKey = useAuthStore.getState().identityKey();
    console.log("Playback updated:", data);
    if (!data.spaceId) return;

    queryClient.setQueryData(["currentSong", data.spaceId, identityKey], {
      songId: data.currentSongId,
      startedAt: data.startedAt,
      isPaused: data.isPaused,
      playbackRate: data.playbackRate,
    });

    queryClient.invalidateQueries({
      queryKey: ["queue", data.spaceId, identityKey],
    });

    queryClient.invalidateQueries({
      queryKey: ["playback", data.spaceId, identityKey],
    });
  }

  private handleUserJoined(data: {
    clientId: string;
    userId?: string;
    memberCount: number;
    members: any[];
  }) {
    if (!this.currentSpaceId) return;
    const identityKey = useAuthStore.getState().identityKey();
    console.log(
      "User Joined/Left: ",
      data.userId || data.clientId,
      "- Total: ",
      data.memberCount,
    );

    queryClient.setQueryData(
      ["spaces", this.currentSpaceId, identityKey],
      (oldSpace: any) =>
        oldSpace
          ? {
              ...oldSpace,
              memberCount: data.memberCount,
              members: data.members,
            }
          : oldSpace,
    );

    this.emit("user:joined", data);
  }

  private handleSpaceState(data: any) {
    const identityKey = useAuthStore.getState().identityKey();
    console.log("space state: ", data);

    if (data.spaceId) {
      queryClient.invalidateQueries({
        queryKey: ["queue", data.spaceId, identityKey],
      });
    }
    if (data.playback) {
      queryClient.setQueryData(
        ["currentSong", data.spaceId, identityKey],
        data.playback,
      );
    }
  }

  private handleTimeSyncResponse(data: {
    clientTimestamp: number;
    serverTimestamp: number;
  }) {
    const t4 = Date.now();
    const roundTripTime = t4 - data.clientTimestamp;
    const serverTime = data.serverTimestamp + roundTripTime / 2;
    const offset = serverTime - t4;

    // record sample
    this.syncSamples.push({
      offset,
      rtt: roundTripTime,
      timestamp: t4,
    });

    // keep only N samples
    if (this.syncSamples.length > this.maxSample) {
      this.syncSamples.shift();
    }

    // log stats
    if (this.syncSamples.length >= 5) {
      this.logDriftStats();
    }
    console.log(`Time sync - RTT: ${roundTripTime}ms, Offset: ${offset}ms`);
    useSpaceStore.getState().setMetrics({ rtt: roundTripTime, offset });
    this.emit("time:sync", { roundTripTime, offset });
  }

  getDriftStats() {
    if (this.handleTimeSyncResponse.length === 0) return null;
    const offsets = this.syncSamples.map((s) => Math.abs(s.offset));
    const rtts = this.syncSamples.map((s) => s.rtt);

    const avg = (arr: number[]) => arr.reduce((a, b) => a + b) / arr.length;
    const max = (arr: number[]) => Math.max(...arr);

    return {
      avgOffsetMs: avg(offsets).toFixed(2),
      maxOffsetMs: max(offsets).toFixed(2),
      avgRttMs: avg(rtts).toFixed(2),
      sampleCount: this.syncSamples.length,
    };
  }

  private logDriftStats() {
    const stats = this.getDriftStats();
    if (!stats) return;
    console.log(
      `[SYNC STATS] Avg Offset: ${stats.avgOffsetMs}ms | ` +
        `Max Offset: ${stats.maxOffsetMs}ms | ` +
        `Avg RTT: ${stats.avgRttMs}ms | ` +
        `Samples: ${stats.sampleCount}`,
    );
  }

  async measureDrift(round = 10, intervalMs = 300) {
    this.syncSamples = [];
    for (let i = 0; i < round; i++) {
      this.requestTimeSync();
      await new Promise((res) => setTimeout(res, intervalMs));
    }

    console.table(this.getDriftStats());
  }

  private startPingInterval() {
    this.pingInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send(WSEvents.PING);
      }
    }, 25000);
  }

  private cleanup() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimeout) return;

    this.reconnectAttempts++;
    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
      30000,
    );

    console.log(
      `Reconnecting is ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`,
    );
    this.connectionState = "reconnecting";

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
      this.connect(this.token || undefined).catch((err) => {
        console.error("Reconnection failed:", err);
      });
    }, delay);
  }

  requestTimeSync() {
    this.send(WSEvents.TIME_SYNC, {
      clientTimeStamp: Date.now(),
    });
  }

  on(event: string, callback: Function) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);
  }

  off(event: string, callback: Function) {
    this.eventListeners.get(event)?.delete(callback);
  }

  private emit(event: string, data?: any) {
    this.eventListeners.get(event)?.forEach((callback) => callback(data));
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  get state(): ConnectionState {
    return this.connectionState;
  }

  get activeSpaceId(): string | null {
    return this.currentSpaceId;
  }
}

export const wsClient = new WebSocketClient();
