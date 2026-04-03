import { create } from "zustand";

interface MetricState {
  rtt: number;
  offset: number;
}

interface SpaceState {
  currentSpaceId: string | null;
  metrics: MetricState;
  setCurrentSpace: (spaceId: string | null) => void;
  clearCurrentSpace: () => void;
  setMetrics: (metrics: Partial<MetricState>) => void;
}
export const useSpaceStore = create<SpaceState>((set) => ({
  currentSpaceId: null,
  metrics: { rtt: 0, offset: 0 },
  setCurrentSpace: (id) => set({ currentSpaceId: id }),
  clearCurrentSpace: () =>
    set({ currentSpaceId: null, metrics: { rtt: 0, offset: 0 } }),
  setMetrics: (metrics) =>
    set((state) => ({ metrics: { ...state.metrics, ...metrics } })),
}));
