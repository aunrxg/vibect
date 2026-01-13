import { create } from "zustand";
import { Song } from "@/lib/types";

interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  volume: number;
  progress: number;
  duration: number;

  setCurrentSong: (song: Song | null) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  setVolume: (volume: number) => void;
  setProgress: (progress: number) => void;
  setDuration: (duration: number) => void;
  reset: () => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  currentSong: null,
  isPlaying: false,
  volume: 80,
  progress: 0,
  duration: 0,

  setCurrentSong: (song) => set({ currentSong: song, progress: 0 }),
  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setVolume: (volume) => set({ volume: Math.max(0, Math.min(100, volume)) }),
  setProgress: (progress) =>
    set({ progress: Math.max(0, Math.min(100, progress)) }),
  setDuration: (duration) => set({ duration }),
  reset: () =>
    set({ currentSong: null, isPlaying: false, progress: 0, duration: 0 }),
}));
