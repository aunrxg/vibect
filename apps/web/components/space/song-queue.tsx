import {
  ChevronDown,
  ChevronUp,
  Clock,
  Lock,
  Music2,
  Play,
  Plus,
  Search,
  Share2,
  Trash2,
  Volume2,
  X,
} from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";
import Image from "next/image";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Song } from "@/lib/types";
import { useAuthStore } from "@/store/use-auth-store";
import { useRemoveVote, useVote } from "@/hooks/use-vote";
import { useAddSong, useDeleteSong, useYoutubeSearch } from "@/hooks/use-song";
import { usePlayerStore } from "@/store/use-player-store";
import { Switch } from "../ui/switch";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

export default function SongQueue({
  queueSongs,
  creator,
  spaceId,
  currentSongId,
  spaceName,
}: {
  queueSongs: Song[];
  creator: string;
  spaceId: string;
  currentSongId?: string;
  spaceName?: string;
}) {
  const { mutate: vote } = useVote();
  const { mutate: removeVote } = useRemoveVote();
  const { mutate: deleteSong } = useDeleteSong();
  const { mutate: addSong } = useAddSong();

  const { id } = useAuthStore((s) => s.identity);
  const { setCurrentSong, play } = usePlayerStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: searchResults, isLoading: isSearching } =
    useYoutubeSearch(debouncedQuery);

  function getUserRole(id: string, creator: string) {
    if (id === creator) return "creator";
    else return "viewer";
  }
  const userRole = getUserRole(id, creator);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleVote = (songId: string, value: -1 | 1, currentVote: number) => {
    if (currentVote === value) {
      removeVote({ songId, spaceId });
    } else {
      vote({ songId, value, spaceId });
    }
  };

  const handleDelete = (songId: string) => {
    if (confirm("Remove this song from queue?")) {
      deleteSong({ songId, spaceId });
    }
  };

  const handlePlaySong = (song: Song) => {
    if (userRole !== "creator") return;
    setCurrentSong(song);
    play();
  };

  const handleAddFromSearch = (result: any) => {
    addSong({
      spaceId,
      youtubeId: result.id,
      title: result.title,
      thumbnail: result.thumbnail,
      duration: result.duration,
    });
    setSearchQuery("");
    setShowResults(false);
  };

  const currentSong = queueSongs.find((s) => s.id === currentSongId);
  const upcomingSongs = queueSongs.filter((s) => s.id !== currentSongId);

  if (queueSongs.length === 0) {
    return (
      <Card className="rounded-none border-0 bg-transparent">
        <CardContent>
          <div className="text-center py-12">
            <Music2 className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">
              No songs in queue
            </p>
            <p className="text-sm text-muted-foreground/60 mt-2">
              Add a song to get the party started!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#030303] text-white overflow-hidden">
      {/* Search Bar Section */}
      <div className="px-6 py-4 border-b border-white/10 space-y-4">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-white transition-colors" />
          <Input
            placeholder="Search songs on YouTube..."
            className="pl-10 pr-10 py-5 bg-white/5 border-white/10 focus:bg-white/10 rounded-xl text-sm"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setShowResults(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="h-4 w-4 text-slate-400" />
            </button>
          )}
        </div>

        {/* Search Results Overlay-like Section */}
        {showResults && searchQuery && (
          <div className="absolute left-0 right-0 top-[140px] bottom-0 z-50 bg-[#030303] overflow-y-auto px-6 pb-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4 mt-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Search Results
              </h4>
              <button
                onClick={() => setShowResults(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>

            {isSearching ? (
              <div className="flex flex-col gap-4">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="flex gap-4 items-center animate-pulse"
                  >
                    <div className="w-14 h-10 bg-white/5 rounded" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-white/5 rounded w-3/4" />
                      <div className="h-2 bg-white/5 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : searchResults && searchResults.length > 0 ? (
              <div className="space-y-2">
                {searchResults.map((result) => (
                  <div
                    key={result.id}
                    className="group flex items-center gap-4 p-2 -mx-2 hover:bg-white/5 rounded-lg transition-colors border-b border-white/5 last:border-0"
                  >
                    <div className="relative shrink-0">
                      <Image
                        src={result.thumbnail || "/placeholder.svg"}
                        alt={result.title}
                        width={56}
                        height={42}
                        className="w-14 h-10 object-cover rounded shadow-md"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">
                        {result.title}
                      </h4>
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {result.channelTitle}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-white/10"
                      onClick={() => handleAddFromSearch(result)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">
                No results found for "{searchQuery}"
              </div>
            )}
          </div>
        )}
      </div>
      <ScrollArea className="flex-1">
        <div className="px-6 py-6 space-y-8">
          {/* Playing From Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Playing from
                </p>
                <h3 className="text-lg font-bold">
                  {spaceName || "Vitect Space"}
                </h3>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full border-white/20 bg-white/10 hover:bg-white/20 text-xs px-4"
              >
                Save
              </Button>
            </div>

            {/* Currently Playing Song */}
            {currentSong && (
              <div className="group relative flex items-center gap-4 p-2 -mx-2 bg-white/10 rounded-lg">
                <div className="relative shrink-0 w-12 h-12 flex items-center justify-center">
                  <Volume2 className="h-5 w-5 text-white animate-pulse" />
                </div>
                <div className="relative shrink-0">
                  <Image
                    src={currentSong.thumbnail || "/placeholder.svg"}
                    alt={currentSong.title}
                    width={56}
                    height={42}
                    className="w-14 h-10 object-cover rounded shadow-lg"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm truncate">
                    {currentSong.title}
                  </h4>
                  <p className="text-xs text-slate-400 truncate mt-0.5">
                    {currentSong.artist || "Unknown Artist"}
                  </p>
                </div>
                <div className="text-xs text-slate-400 font-medium whitespace-nowrap px-2">
                  {formatDuration(currentSong.duration)}
                </div>
              </div>
            )}
          </div>

          {/* Autoplay Section */}
          <div className="space-y-4 pt-2 w-full border-t border-white/5">
            {/* Upcoming Songs */}
            <div className="space-y-1">
              {upcomingSongs.map((song, index) => (
                <div
                  key={song.id}
                  className="group flex items-center gap-4 p-2 -mx-2 hover:bg-white/5 rounded-lg transition-colors border-b border-white/5"
                >
                  <div className="relative shrink-0">
                    <Image
                      src={song.thumbnail || "/placeholder.svg"}
                      alt={song.title}
                      width={56}
                      height={42}
                      className="w-14 h-10 object-cover rounded"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-white hover:bg-transparent"
                        onClick={() => handlePlaySong(song)}
                      >
                        <Play className="h-4 w-4 fill-white" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate group-hover:text-white transition-colors">
                      {song.title}
                    </h4>
                    <p className="text-xs text-slate-400 truncate mt-0.5 group-hover:text-slate-300">
                      {song.artist || "Unknown Artist"}
                    </p>
                  </div>

                  <div className="flex items-center justify-end w-[130px] shrink-0">
                    <div
                      className={cn(
                        "flex items-center gap-1 transition-opacity",
                        song.userVote !== 0
                          ? "opacity-100"
                          : "opacity-0 group-hover:opacity-100",
                      )}
                    >
                      <Button
                        size="sm"
                        variant="ghost"
                        className={cn(
                          "h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-white/10",
                          song.userVote === 1 &&
                            "text-green-500 bg-green-500/10 hover:bg-green-500/20 hover:text-green-400",
                        )}
                        onClick={() => handleVote(song.id, 1, song.userVote)}
                      >
                        <ChevronUp className="h-5 w-5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className={cn(
                          "h-8 w-8 p-0 text-slate-400 hover:text-red-400 hover:bg-white/10",
                          song.userVote === -1 &&
                            "text-red-500 bg-red-500/10 hover:bg-red-500/20 hover:text-red-400",
                        )}
                        onClick={() => handleVote(song.id, -1, song.userVote)}
                      >
                        <ChevronDown className="h-5 w-5" />
                      </Button>
                      {(id === (song.addedById || song.addedByAnon) ||
                        userRole === "creator") && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(song.id)}
                          className="h-8 w-8 p-0 text-slate-400 hover:text-red-500 hover:bg-white/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div
                      className={cn(
                        "text-xs text-slate-500 font-medium whitespace-nowrap px-2 flex-none",
                        song.userVote !== 0 ? "hidden" : "group-hover:hidden",
                      )}
                    >
                      {formatDuration(song.duration)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
