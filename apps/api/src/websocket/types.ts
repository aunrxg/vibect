import type WebSocket from "ws";

export interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
  spaceId?: string;
  clientId: string;
  isAlive: boolean;
  name?: string;
  avatarUrl?: string;
  isAnonymous?: boolean;
}

// export interface WSMessage {
//   type: string;
//   data?: any;
// }

export enum WSEvents {
  // client --> server
  JOIN_SPACE = "join_space",
  LEAVE_SPACE = "leave_space",
  TIME_SYNC = "time_sync",
  PING = "ping",

  // server --> client
  SPACE_STATE = "space_state",
  SONG_ADDED = "song_added",
  SONG_VOTED = "song_voted",
  QUEUE_UPDATED = "queue_updated",
  PLAYBACK_UPDATED = "playback_updated",
  USER_JOINED = "user_joined",
  TIME_SYNC_RESPONSE = "time_sync_response",
  PONG = "pong",
  ERROR = "error",
}

export interface JoinSpacePayload {
  spaceId: string;
  token?: string;
}

export interface TimeSyncPayload {
  clientTimeStamp: number;
}

export interface PlaybackState {
  spaceId: string;
  currentSongId: string | null;
  startedAt: number | null;
  isPaused: boolean;
  playbackRate: number;
}

export interface ClientToServerEvents {
  [WSEvents.JOIN_SPACE]: JoinSpacePayload;
  [WSEvents.LEAVE_SPACE]: undefined;
  [WSEvents.TIME_SYNC]: TimeSyncPayload;
  [WSEvents.PING]: undefined;
}

export interface ServerToClientEvents {
  [WSEvents.QUEUE_UPDATED]: { queue: any[] };
  [WSEvents.PLAYBACK_UPDATED]: any;
  [WSEvents.USER_JOINED]: {
    clientId: string;
    userId?: string;
    memberCount: number;
    members: any[];
  };
  [WSEvents.TIME_SYNC_RESPONSE]: {
    clientTimestamp: number;
    ServerTimestamp: number;
  };
  [WSEvents.ERROR]: { message: string };
}

export type WSMessage<T extends WSEvents = WSEvents> = {
  type: T;
  data: T extends keyof ClientToServerEvents
    ? ClientToServerEvents[T]
    : unknown;
};

export interface RedisEvent<T = unknown> {
  spaceId: string;
  type: WSEvents;
  data: T;
}
