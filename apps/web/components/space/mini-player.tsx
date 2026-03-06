"use client";

import { usePlayerStore } from "@/store/use-player-store";
import { Pause, Play, SkipForward } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

export default function MiniPlayer() {
  const { currentSong, isPlaying, togglePlay } = usePlayerStore();

  if (!currentSong) return null;

  return (
    <div className="flex items-center justify-between w-full h-full px-8 bg-black/40 backdrop-blur-lg">
      <div className="flex h-20 items-center gap-4 min-w-0">
        <div className="relative h-12 w-12 shrink-0 rounded-lg overflow-hidden shadow-2xl border border-white/10">
          <Image
            src={currentSong.thumbnail || "/placeholder.svg"}
            alt={currentSong.title}
            fill
            className="object-cover"
          />
        </div>
        <div className="min-w-0 flex flex-col">
          <h4 className="text-sm font-bold text-white truncate max-w-[200px]">
            {currentSong.title}
          </h4>
          <p className="text-[11px] font-medium text-slate-400 truncate">
            {currentSong.artist || "Unknown Artist"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            togglePlay();
          }}
          className="p-2.5 text-white hover:bg-white/10 rounded-full transition-colors active:scale-90"
        >
          {isPlaying ? (
            <Pause className="h-6 w-6 fill-current" />
          ) : (
            <Play className="h-6 w-6 fill-current" />
          )}
        </button>
        <button className="p-2.5 text-white hover:bg-white/10 rounded-full transition-colors active:scale-90">
          <SkipForward className="h-6 w-6 fill-current" />
        </button>
      </div>
    </div>
  );
}
