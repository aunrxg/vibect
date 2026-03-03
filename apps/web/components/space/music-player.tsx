"use client";

import { usePlayerStore } from "@/store/use-player-store";
import { useAuthStore } from "@/store/use-auth-store";
import {
  Play,
  Pause,
  SkipForward,
  Volume2,
  VolumeX,
  ChevronUp,
  User,
  Heart,
} from "lucide-react";
import { Button } from "../ui/button";
import { Slider } from "../ui/slider";
import { usePlayback } from "@/hooks/use-playback";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import Image from "next/image";

const formatTime = (seconds: number) => {
  if (isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export default function MusicPlayer() {
  const { id: spaceId } = useParams<{ id: string }>();
  const {
    currentSong,
    isPlaying,
    volume,
    setVolume,
    togglePlay,
    progress,
    duration,
  } = usePlayerStore();
  const {
    playbackState,
    pause,
    resume,
    next,
    play: startPlayback,
  } = usePlayback(spaceId);
  const { identity } = useAuthStore();

  if (!currentSong) return null;

  const handleTogglePlay = () => {
    if (isPlaying) {
      pause();
    } else {
      if (!playbackState) {
        startPlayback(currentSong.id);
      } else {
        resume();
      }
    }
    togglePlay();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 transition-all duration-300 animate-in fade-in slide-in-from-bottom-5">
      <div className="mx-auto flex h-24 max-w-7xl items-center gap-4 rounded-2xl border border-white/10 bg-black/60 px-6 backdrop-blur-2xl sm:h-20 sm:gap-8">
        {/* Mobile: Mini Poster & Basic Info */}
        <div className="flex flex-1 items-center gap-4 min-w-0">
          <div className="relative group overflow-hidden rounded-lg h-12 w-12 shrink-0 shadow-lg sm:h-14 sm:w-14">
            <Image
              src={currentSong.thumbnail || "/placeholder.svg"}
              alt={currentSong.title}
              fill
              className="object-cover transition-transform group-hover:scale-110"
            />
          </div>
          <div className="flex flex-col min-w-0 overflow-hidden">
            <h3 className="truncate text-sm font-bold text-white sm:text-base">
              {currentSong.title}
            </h3>
            <p className="truncate text-xs text-slate-400">
              {currentSong.artist || "Unknown Artist"}
            </p>
          </div>
        </div>

        {/* Desktop & Tablet: Center Controls */}
        <div className="hidden sm:flex flex-col items-center gap-1.5 flex-1 max-w-md">
          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 text-slate-400 hover:text-white hover:bg-white/10"
              onClick={() => next()}
            >
              <SkipForward className="h-5 w-5" />
            </Button>
            <Button
              onClick={handleTogglePlay}
              className="h-12 w-12 rounded-full bg-white text-black hover:bg-white/90 shadow-xl transition-all hover:scale-105 active:scale-95"
            >
              {isPlaying ? (
                <Pause className="h-6 w-6 fill-current" />
              ) : (
                <Play className="h-6 w-6 fill-current" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 text-slate-400 hover:text-white hover:bg-white/10"
              onClick={() => {}}
            >
              <ChevronUp className="h-5 w-5" />
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="flex w-full items-center gap-3 px-2">
            <span className="text-[10px] tabular-nums text-slate-500 min-w-[32px] text-right">
              {formatTime((progress / 100) * duration)}
            </span>
            <div className="relative h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[10px] tabular-nums text-slate-500 min-w-[32px]">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Stats & Added By (Responsive) */}
        <div className="flex items-center gap-6 sm:flex-1 justify-end">
          {/* Votes */}
          <div className="hidden lg:flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/5">
              <Heart className="h-3.5 w-3.5 text-indigo-500 fill-indigo-500/10" />
              <span className="text-sm font-semibold text-slate-300">
                {currentSong.voteCount || 0}
              </span>
            </div>
          </div>

          {/* Added By */}
          <div className="hidden md:flex items-center gap-2 max-w-[140px]">
            <div className="flex flex-col items-end min-w-0">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                Added By
              </span>
              <span className="text-xs font-medium text-slate-300 truncate">
                {currentSong.addedByUser?.name || "Anonymous"}
              </span>
            </div>
          </div>

          {/* Volume Control */}
          <div className="hidden sm:flex items-center gap-3 min-w-[120px]">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-400"
            >
              {volume === 0 ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
            <Slider
              value={[volume]}
              max={100}
              step={1}
              onValueChange={(val) => setVolume(val[0])}
              className="w-24"
            />
          </div>

          {/* Mobile Only: Play Button */}
          <button
            onClick={handleTogglePlay}
            className="sm:hidden h-10 w-10 rounded-full bg-white text-black flex items-center justify-center shrink-0 shadow-lg"
          >
            {isPlaying ? (
              <Pause className="h-5 w-5 fill-current" />
            ) : (
              <Play className="h-5 w-5 fill-current" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
