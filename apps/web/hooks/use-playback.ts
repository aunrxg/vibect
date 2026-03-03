"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuthStore } from "@/store/use-auth-store";
import { usePlayerStore } from "@/store/use-player-store";
import { useEffect } from "react";
import { wsClient, WSEvents } from "@/lib/websocket";

export const usePlayback = (spaceId: string) => {
  const queryClient = useQueryClient();
  const identityKey = useAuthStore((s) => s.identityKey());
  const { setCurrentSong, play, pause, setProgress, setDuration } =
    usePlayerStore();

  // Fetch initial playback state
  const { data: playbackState } = useQuery({
    queryKey: ["playback", spaceId, identityKey],
    queryFn: async () => {
      const res = await api.get(`/playback/${spaceId}`);
      return res.data;
    },
    enabled: !!spaceId,
  });

  // Sync with store when data changes
  useEffect(() => {
    if (playbackState && playbackState.song) {
      const song = playbackState.song;
      setCurrentSong({
        id: song.id,
        spaceId: song.spaceId,
        youtubeId: song.youtubeId,
        title: song.title,
        thumbnail: song.thumbnailUrl,
        duration: song.duration,
        addedById: song.addedById,
        addedByAnon: song.addedByAnonymous,
        addedAt: song.addedAt,
        voteCount:
          song.votes?.reduce((sum: number, v: any) => sum + v.value, 0) || 0,
        artist: song.artist,
        addedByUser: song.addedBy,
        position: 0,
      });
      if (playbackState.isPaused) pause();
      else play();
    }
  }, [playbackState, setCurrentSong, play, pause]);

  // WebSocket Listeners
  useEffect(() => {
    const handlePlaybackUpdate = () => {
      queryClient.invalidateQueries({
        queryKey: ["playback", spaceId, identityKey],
      });
    };

    wsClient.on(WSEvents.PLAYBACK_UPDATED, handlePlaybackUpdate);
    wsClient.on(WSEvents.SPACE_STATE, handlePlaybackUpdate);

    return () => {
      wsClient.off(WSEvents.PLAYBACK_UPDATED, handlePlaybackUpdate);
      wsClient.off(WSEvents.SPACE_STATE, handlePlaybackUpdate);
    };
  }, [queryClient, spaceId, identityKey]);

  // Mutations for controls
  const playMutation = useMutation({
    mutationFn: (songId: string) =>
      api.post("/playback/play", { spaceId, songId }),
  });

  const pauseMutation = useMutation({
    mutationFn: () => api.post(`/playback/${spaceId}/pause`),
  });

  const resumeMutation = useMutation({
    mutationFn: () => api.post(`/playback/${spaceId}/resume`),
  });

  const nextMutation = useMutation({
    mutationFn: () => api.post(`/playback/${spaceId}/next`),
  });

  return {
    playbackState,
    play: (songId: string) => playMutation.mutate(songId),
    pause: () => pauseMutation.mutate(),
    resume: () => resumeMutation.mutate(),
    next: () => nextMutation.mutate(),
  };
};
