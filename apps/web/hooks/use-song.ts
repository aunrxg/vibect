import api from "@/lib/api";
import { AddSongInput, Queue, Song, YTSearchResult } from "@/lib/types";
import { useAuthStore } from "@/store/use-auth-store";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// search songs
export const useYoutubeSearch = (query: string, maxResults: number = 10) => {
  const identityKey = useAuthStore((s) => s.identityKey());

  return useQuery({
    queryKey: ["youtube", "search", query, identityKey, maxResults],
    queryFn: async (): Promise<YTSearchResult[]> => {
      const res = await api.get("/songs/search", {
        params: { query, maxResults },
      });
      return res.data;
    },
    enabled: query.length > 0,
    staleTime: 300000,
  });
};

// history of space: played songs
export const useHistory = (
  spaceId: string,
  page: number = 1,
  limit: number = 20,
) => {
  const identityKey = useAuthStore((s) => s.identityKey());

  return useQuery({
    queryKey: ["history", spaceId, identityKey, limit],
    queryFn: async (): Promise<Song[]> => {
      const res = await api.get(`/songs/history/${spaceId}`, {
        params: { page, limit },
      });
      return res.data;
    },
    enabled: !!spaceId,
  });
};

// queue for a song
export const useQueue = (spaceId: string | null) => {
  const identityKey = useAuthStore((s) => s.identityKey());
  const { id } = useAuthStore((s) => s.identity);
  return useQuery({
    queryKey: ["queue", spaceId, identityKey],
    queryFn: async (): Promise<Queue> => {
      const res = await api.get(`/songs/queue/${spaceId}`);
      // extract songs from nested response
      const songs = res.data?.songs;

      return songs
        .map((song: any) => {
          // find current user vote in the votes array
          const userVote = song.votes?.find((v: any) => v.userId === id);
          const anonymousVote = song.anonymousVotes?.find(
            (v: any) => v.anonymousId === id,
          );

          return {
            id: song.id,
            spaceId: song.spaceId,
            youtubeId: song.youtubeId,
            title: song.title,
            thumbnail: song.thumbnail,
            duration: song.duration,
            addedById: song.addedById,
            addedByAnon: song.addedByAnonymous,
            addedAt: song.addedAt,
            voteCount: song.score || 0,
            position: 0, // will be set by sort order
            userVote: userVote?.value || anonymousVote?.value || 0,
            artist: song.artist,
            addedByUser: song.addedBy,
          };
        })
        .sort((a: any, b: any) => b.voteCount - a.voteCount);
    },
    enabled: !!spaceId,
    refetchInterval: 10000, // falling as backup every 10s (ws is primary)
  });
};

export const useAddSong = () => {
  const queryClient = useQueryClient();
  const identityKey = useAuthStore((s) => s.identityKey());

  return useMutation({
    mutationFn: async (data: AddSongInput): Promise<Song> => {
      const res = await api.post("/songs", data);
      return res.data;
    },
    onMutate: async (newSong) => {
      // cancle outgoing fetches
      await queryClient.cancelQueries({
        queryKey: ["queue", newSong.spaceId, identityKey],
      });

      // snapshot prev value
      const prevQueue = queryClient.getQueryData([
        "queue",
        newSong.spaceId,
        identityKey,
      ]);

      //optimistic update
      queryClient.setQueryData(
        ["queue", newSong.spaceId, identityKey],
        (old: Song[] = []) => [
          ...old,
          {
            id: `temp-${Date.now()}`,
            ...newSong,
            voteCount: 0,
            position: old.length,
            addedAt: new Date().toISOString(),
          },
        ],
      );

      return { prevQueue };
    },
    onError: (_err, variables, context) => {
      if (context?.prevQueue) {
        queryClient.setQueryData(
          ["queue", variables.spaceId, identityKey],
          context.prevQueue,
        );
      }
    },
    onSuccess: (_newSong, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["queue", variables.spaceId, identityKey],
      });
    },
  });
};

export const useDeleteSong = () => {
  const queryClient = useQueryClient();
  const identityKey = useAuthStore((s) => s.identityKey());

  return useMutation({
    mutationFn: async ({
      songId,
      spaceId,
    }: {
      songId: string;
      spaceId: string;
    }): Promise<void> => {
      const res = await api.delete(`/songs/${songId}`);
      return res.data;
    },
    onMutate: async ({ songId, spaceId }) => {
      await queryClient.cancelQueries({
        queryKey: ["queue", spaceId, identityKey],
      });

      const prevQueue = queryClient.getQueryData([
        "queue",
        spaceId,
        identityKey,
      ]);

      queryClient.setQueryData(
        ["queue", spaceId, identityKey],
        (old: Song[] = []) => old.filter((song) => song.id !== songId),
      );

      return { prevQueue };
    },
    onError: (err, variables, context) => {
      if (context.prevQueue) {
        queryClient.setQueryData(
          ["queue", variables.spaceId, identityKey],
          context.prevQueue,
        );
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["queue", variables.spaceId, identityKey],
      });
    },
  });
};
