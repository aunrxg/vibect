import { create } from "zustand";

interface SpaceState {
  currentSpaceId: string | null;
  setCurrentSpace: (spaceId: string | null) => void;
  clearCurrentSpace: () => void;
}
export const useSpaceStore = create<SpaceState>((set) => ({
  currentSpaceId: null,
  setCurrentSpace: (id) => set({ currentSpaceId: id }),
  clearCurrentSpace: () => set({ currentSpaceId: null }),
}));
