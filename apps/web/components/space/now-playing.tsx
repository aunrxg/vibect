"use client";

import { usePlayerStore } from "@/store/use-player-store";
import { Music2 } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import YoutubePlayer from "./youtube-player";

export default function NowPlaying() {
  const { currentSong } = usePlayerStore();

  if (!currentSong) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-gradient-to-br from-indigo-900/20 to-black p-8 text-center sm:p-12">
        <YoutubePlayer />
        <div className="relative mb-8 flex h-48 w-48 items-center justify-center rounded-2xl bg-white/5 shadow-2xl backdrop-blur-sm sm:h-64 sm:w-64">
          <Music2 className="h-20 w-20 text-indigo-500/30 sm:h-24 sm:w-24" />
          <div className="absolute inset-x-0 -bottom-4 flex justify-center">
            <div className="h-1 w-32 rounded-full bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent blur-sm" />
          </div>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          No song playing
        </h2>
        <p className="mt-2 max-w-xs text-sm text-slate-400 sm:text-base">
          The party is just getting started. Add some tunes to the queue!
        </p>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center justify-center h-full w-full overflow-hidden bg-black p-4 sm:p-8">
      <YoutubePlayer />
      {/* Dynamic Background Glow */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-indigo-600/20 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        {/* Poster Wrapper */}
        <div className="group relative aspect-square overflow-hidden rounded-2xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] transition-all duration-500 hover:scale-[1.02] hover:shadow-indigo-500/10">
          <Image
            src={currentSong.thumbnail || "/placeholder.svg"}
            alt={currentSong.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        </div>

        {/* Text Metadata (Optional here, as they are in the player bar) */}
        <div className="mt-8 flex flex-col items-center text-center">
          <h2 className="line-clamp-2 text-2xl font-black tracking-tight text-white sm:text-4xl">
            {currentSong.title}
          </h2>
          <p className="mt-2 text-lg font-medium text-indigo-400 sm:text-xl">
            {currentSong.artist || "Unknown Artist"}
          </p>
        </div>
      </div>
    </div>
  );
}
