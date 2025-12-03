// redis channels
export const REDIS_CHANNELS = {
  SPACE_EVENTS: "space:events",
  PLAYBACK_EVENTS: "playback:events",
  VOTE_EVENTS: "vote:events",
};

// redis cache keys
export const CACHE_KEYS = {
  SPACE: (id: string) => `space:${id}`,
  QUEUE: (spaceId: string) => `queue:${spaceId}`,
  PLAYBACK: (spaceId: string) => `playback:${spaceId}`,
  USER: (id: string) => `user:${id}`,
};

// time to live (setex)
export const CACHE_TTL = {
  SHORT: 60,
  MEDIUM: 300,
  LONG: 3600,
};

export const WS_EVENTS = {
  // client --> server
  JOIN_SPACE: "join_space",
  LEAVE_SPACE: "leave_space",
  TIME_SYNC: "time_sync",
  PLAYBACK_ACTION: "playback_action",

  // server --> client
  SPACE_STATE: "space_state",
  SONG_ADDED: "song_added",
  SONG_VOTED: "song_voted",
  QUEUE_UPDATED: "queue_updated",
  PLAYBACK_UPDATED: "playback_updated",
  USER_JOINED: "user_joined",
  USER_LEFT: "user_left",
  TIME_SYNC_RESPONSE: "time_sync_response",
  ERROR: "error",
};
