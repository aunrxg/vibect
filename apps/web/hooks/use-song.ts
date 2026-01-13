import api from "@/lib/api";
import { AddSongInput, Song, YTSearchResult } from "@/lib/types";
import { useAuthStore } from "@/store/use-auth-store";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useYoutubeSearch = (query: string) => {
  const identityKey = useAuthStore((s) => s.identityKey());

  return useQuery({
    queryKey: ["youtube", "search", query, identityKey],
    queryFn: async (): Promise<YTSearchResult[]> => {
      const res = await api.get("/songs/search", { params: { q: query } });
      return res.data;
    },
    enabled: query.length > 0,
    staleTime: 300000,
  });
};

export const useHistory = (spaceId: string) => {
  const identityKey = useAuthStore((s) => s.identityKey());

  return useQuery({
    queryKey: ["history", spaceId, identityKey],
    queryFn: async (): Promise<Song[]> => {
      const res = await api.get(`/songs/history/${spaceId}`);
      return res.data;
    },
    enabled: !!spaceId,
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
