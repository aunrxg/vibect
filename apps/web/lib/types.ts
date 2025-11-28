export interface Song {
  id: string;
  space_id: string;
  platform: "youtube" | "spotify";
  url: string;
  video_id: string | null;
  title: string;
  author: string;
  thumbnail: string | null;
  duration_seconds: number;
  votes_cached: number;
  created_by: string | null;
  created_at: string;
  profiles?: {
    display_name?: string;
    username?: string;
  };
}

export interface Profile {
  id: string;
  name?: string;
  email?: string;
  avatar?: string;
  username?: string;
  isAnonymous?: boolean;
}

export interface Vote {
  id: string;
  song_id: string;
  voter_user_id: string | null;
  voter_anon_id: string | null;
  value: 1 | -1;
  created_at: string;
}

export interface Space {
  id: string;
  name: string;
  created_at: string;
  created_by: string;
  allow_anonymous: boolean;
  allow_interactions: boolean;
  isActive: boolean;
}

export interface SpacePlayback {
  space_id: string;
  current_song_id: string | null;
  isPlaying: boolean;
  position_seconds: number;
  updated_by: string | null;
  updated_at: string;
}

export interface UserPresenceType {
  id: string;
  space_id: string;
  user_id: string | null;
  anon_id: string | null;
  username: string | null;
  display_name: string | null;
  last_seen: string;
  presence_ref?: string;
  created_at: string;
}

export type UserRole = "creator" | "viewer";

export type ConnectionState =
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";

export interface PlaybackState {
  current_song_id: string | null;
  is_playing: boolean;
  position_seconds: number;
  updated_at?: string;
}
