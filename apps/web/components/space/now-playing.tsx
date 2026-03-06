"use client";

import { usePlayerStore } from "@/store/use-player-store";
import {
  Music2,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Heart,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import YoutubePlayer from "./youtube-player";
import { Slider } from "../ui/slider";

export default function NowPlaying() {
  const { currentSong, isPlaying, progress, duration, togglePlay } =
    usePlayerStore();

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!currentSong) {
    return (
      <div className="flex flex-col items-center justify-center h-[91vh] w-full bg-black p-8 text-center">
        <YoutubePlayer />
        <div className="relative mb-8 flex h-48 w-48 items-center justify-center rounded-3xl bg-white/5 shadow-2xl backdrop-blur-sm">
          <Music2 className="h-20 w-20 text-indigo-500/30" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white">
          No song playing
        </h2>
        <p className="mt-2 max-w-xs text-sm text-slate-400">
          The party is just getting started. Add some tunes to the queue!
        </p>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center justify-center h-full w-full bg-black p-6 overflow-hidden">
      <YoutubePlayer />

      {/* Dynamic Background Glow */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-white/10 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md flex flex-col items-center">
        {/* Poster Wrapper */}
        <div className="w-full aspect-square relative mb-8 rounded-3xl overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)]">
          <Image
            src={currentSong.thumbnail || "/placeholder.svg"}
            alt={currentSong.title}
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Text Metadata */}
        <div className="w-full mb-8 text-left md:text-center">
          <h2 className="text-2xl font-bold text-white mb-2 line-clamp-2">
            {currentSong.title}
          </h2>
          <p className="text-lg font-medium text-slate-400">
            {currentSong.artist || "Unknown Artist"}
          </p>
        </div>

        {/* Mobile-only Controls & Progress */}
        <div className="w-full flex flex-col items-center md:hidden">
          {/* Progress Slider */}
          <div className="w-full mb-8">
            <Slider
              value={[progress]}
              max={100}
              step={0.1}
              disabled
              className="mb-2"
            />
            <div className="flex justify-between text-xs font-medium text-slate-500 tabular-nums">
              <span>{formatTime((progress / 100) * duration)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="w-full flex items-center justify-evenly max-w-sm mb-12">
            {/* Added By instead of Shuffle */}
            <div className="flex flex-col items-start min-w-0 max-w-[80px]">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider truncate">
                Added By
              </span>
              <span className="text-xs font-medium text-white truncate">
                {currentSong.addedByUser?.name || "Anonymous"}
              </span>
            </div>

            <div className="flex items-center gap-8 mx-auto">
              <button className="p-2 text-white hover:bg-white/10 rounded-full transition-colors">
                <SkipBack className="h-8 w-8 fill-current" />
              </button>
              <button
                onClick={togglePlay}
                className="h-20 w-20 flex items-center justify-center bg-white rounded-full text-black hover:scale-105 active:scale-95 transition-all shadow-xl"
              >
                {isPlaying ? (
                  <Pause className="h-10 w-10 fill-current ml-0" />
                ) : (
                  <Play className="h-10 w-10 fill-current ml-1" />
                )}
              </button>
              <button className="p-2 text-white hover:bg-white/10 rounded-full transition-colors">
                <SkipForward className="h-8 w-8 fill-current" />
              </button>
            </div>

            {/* Upvotes instead of Repeat */}
            <div className="flex flex-col items-end min-w-[60px]">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/5">
                <Heart className="h-3.5 w-3.5 text-primary fill-primary/10" />
                <span className="text-xs font-semibold text-slate-300">
                  {currentSong.voteCount || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Mobile: Tabs Label Placeholder */}
          {/* <div className="w-full flex justify-between px-4 text-xs font-bold tracking-widest text-slate-500 uppercase">
            <span>Up next</span>
            <span>Lyrics</span>
            <span>Related</span>
          </div> */}
        </div>
      </div>
    </div>
  );
}
