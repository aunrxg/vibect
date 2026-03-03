export interface Space {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  currentSongId?: string;
  memberCount?: number;
  members?: any[];
}

export interface Song {
  id: string;
  spaceId: string;
  youtubeId: string;
  title: string;
  thumbnail: string;
  duration: number;
  addedById?: string;
  addedByAnon?: string;
  addedAt: string;
  voteCount: number;
  position: number;
  userVote?: -1 | 0 | 1; // Current user's vote
  artist?: string;
  addedByUser?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
}

export interface Vote {
  id: string;
  song: {
    id: string;
    addedBy: {
      id: string;
      name: string;
    };
  };
  value: -1 | 1;
  createdAt: string;
}

export interface YTSearchResult {
  id: string;
  title: string;
  thumbnail: string;
  duration: number;
  channelTitle: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
}

export interface CreateSpaceInput {
  name: string;
  description?: string;
  isPublic: boolean;
}

export interface AddSongInput {
  spaceId: string;
  youtubeId: string;
  title: string;
  thumbnail: string;
  duration: number;
}

export type ConnectionState =
  | "connecting"
  | "connected"
  | "disconnected"
  | "reconnecting"
  | "error";

export interface VoteInput {
  songId: string;
  value: -1 | 1;
}

type AnonymousUser = {
  id: string; // anon_XXX
  name: string; // generate random names one piece edition
  isAnonymous: true;
};

type AuthenticatedUser = {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  isAnonymous: false;
};

export type Identity = AuthenticatedUser | AnonymousUser;

export interface Queue {
  meta: {
    hasNext: boolean;
    hasPrev: boolean;
    limit: number;
    page: number;
    total: number;
    totalPages: number;
  };
  songs: Song[];
}
