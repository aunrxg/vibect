import { WebSocket } from "ws";

export interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
  spaceId?: string;
  clientId: string;
  isAlive: boolean;
}

export interface WSMessage {
  type: string;
  data?: any;
}

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
  statedAt: number | null;
  isPaused: boolean;
  playbackRate: number;
}
