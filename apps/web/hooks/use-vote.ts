import api from "@/lib/api";
import { Song, Vote, VoteInput } from "@/lib/types";
import { useAuthStore } from "@/store/use-auth-store";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useUserVotes = (spaceId: string) => {
  const identityKey = useAuthStore((s) => s.identityKey());

  return useQuery({
    queryKey: ["votes", "user", spaceId, identityKey],
    queryFn: async (): Promise<Record<string, -1 | 1>> => {
      const { data: votes } = await api.get<Vote[]>(`/votes/user/${spaceId}`);
      // convert array into map
      return votes.reduce((acc, vote: Vote) => {
        acc[vote.song.id] = vote.value;
        return acc;
      }, {});
    },
    enabled: !!spaceId,
  });
};

export const useSongVotes = (songId: string | null) => {
  const identityKey = useAuthStore((s) => s.identityKey());

  return useQuery({
    queryKey: ["votes", "song", songId, identityKey],
    queryFn: async (): Promise<Vote[]> => {
      const res = await api.get(`/votes/song/${songId}`);
      return res.data;
    },
    enabled: !!songId,
  });
};

export const useLeaderboard = (spaceId: string | null) => {
  const identityKey = useAuthStore((s) => s.identityKey());

  return useQuery({
    queryKey: ["votes", "leaderboard", spaceId, identityKey],
    queryFn: async () => {
      const res = await api.get(`/votes/leaderboard/${spaceId}`);
      return res.data;
    },
    enabled: !!spaceId,
  });
};

export const useSpaceStat = (spaceId: string | null) => {
  const identityKey = useAuthStore((s) => s.identityKey());

  return useQuery({
    queryKey: ["votes", "stats", spaceId, identityKey],
    queryFn: async () => {
      const res = await api.get(`/votes/stats/${spaceId}`);
      return res.data;
    },
    enabled: !!spaceId,
  });
};

export const useVote = () => {
  const queryClient = useQueryClient();
  const identityKey = useAuthStore((s) => s.identityKey());

  return useMutation({
    mutationFn: async ({
      songId,
      value,
    }: VoteInput & { spaceId: string }): Promise<Vote> => {
      const res = await api.post(`/votes`, { songId, value });
      return res.data;
    },

    onMutate: async ({ songId, value, spaceId }) => {
      // cancel outgoing fetches
      await queryClient.cancelQueries({
        queryKey: ["queue", spaceId, identityKey],
      });
      await queryClient.cancelQueries({
        queryKey: ["votes", "user", spaceId, identityKey],
      });

      // prev value snapshot
      const previousQueue = queryClient.getQueryData([
        "queue",
        spaceId,
        identityKey,
      ]);
      const previousUserVotes = queryClient.getQueryData([
        "votes",
        "user",
        spaceId,
        identityKey,
      ]);

      // optimic update
      queryClient.setQueryData(
        ["queue", spaceId, identityKey],
        (old: Song[] = []) => {
          return old
            .map((song) => {
              if (song.id === songId) {
                const currentUserVote = song.userVote || 0;
                const voteDiff = value - currentUserVote;
                return {
                  ...song,
                  voteCount: song.voteCount + voteDiff,
                  userVote: value,
                };
              }
              return song;
            })
            .sort((a, b) => b.voteCount - a.voteCount);
        },
      );

      //optimistic update user votes
      queryClient.setQueryData(
        ["votes", "user", spaceId],
        (old: Record<string, -1 | 1> = {}) => ({
          ...old,
          [songId]: value,
        }),
      );
      return { previousQueue, previousUserVotes };
    },
    onError: (_err, variables, context) => {
      // rollback if error
      if (context?.previousQueue) {
        queryClient.setQueryData(
          ["queue", variables.spaceId, identityKey],
          context.previousQueue,
        );
      }

      if (context?.previousUserVotes) {
        queryClient.setQueryData(
          ["votes", "user", variables.spaceId, identityKey],
          context.previousUserVotes,
        );
      }
    },
    onSettled: (_d, _e, variables) => {
      // websocket will handel real time updates, but invalidate backups
      queryClient.invalidateQueries({
        queryKey: ["queue", variables.spaceId, identityKey],
      });
    },
  });
};

export const useRemoveVote = () => {
  const queryClient = useQueryClient();
  const identityKey = useAuthStore((s) => s.identityKey());

  return useMutation({
    mutationFn: async ({
      songId,
    }: {
      songId: string;
      spaceId: string;
    }): Promise<void> => {
      const res = await api.post(`/votes/${songId}`, { value: 0 });
      return res.data;
    },
    onMutate: async ({ songId, spaceId }) => {
      // cancel outgoing fetches
      await queryClient.cancelQueries({
        queryKey: ["queue", spaceId, identityKey],
      });
      await queryClient.cancelQueries({
        queryKey: ["votes", "user", spaceId, identityKey],
      });

      // prev value snapshot
      const previousQueue = queryClient.getQueryData([
        "queue",
        spaceId,
        identityKey,
      ]);
      const previousUserVotes = queryClient.getQueryData([
        "votes",
        "user",
        spaceId,
        identityKey,
      ]);

      queryClient.setQueryData(
        ["queue", spaceId, identityKey],
        (old: Song[] = []) => {
          return old
            .map((song) => {
              if (song.id === songId) {
                const currentUserVote = song.userVote || 0;
                return {
                  ...song,
                  voteCount: song.voteCount - currentUserVote,
                  userVote: 0,
                };
              }
              return song;
            })
            .sort((a, b) => b.voteCount - a.voteCount);
        },
      );

      queryClient.setQueryData(
        ["votes", "user", spaceId, identityKey],
        (old: Record<string, -1 | 1> = {}) => {
          const { [songId]: _, ...rest } = old;
          return rest;
        },
      );
      return { previousQueue, previousUserVotes };
    },
    onError: (_err, variables, context) => {
      // rollback if error
      if (context?.previousQueue) {
        queryClient.setQueryData(
          ["queue", variables.spaceId, identityKey],
          context.previousQueue,
        );
      }

      if (context?.previousUserVotes) {
        queryClient.setQueryData(
          ["votes", "user", variables.spaceId, identityKey],
          context.previousUserVotes,
        );
      }
    },
    onSettled: (_d, _e, variables) => {
      // websocket will handel real time updates, but invalidate backups
      queryClient.invalidateQueries({
        queryKey: ["queue", variables.spaceId],
      });
    },
  });
};
