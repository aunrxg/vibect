import {
  ChevronDown,
  ChevronUp,
  Clock,
  Lock,
  Music2,
  Play,
  Trash2,
} from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";
import Image from "next/image";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Song } from "@/lib/types";
import { useAuthStore } from "@/store/use-auth-store";
import { useRemoveVote, useVote } from "@/hooks/use-vote";
import { useDeleteSong } from "@/hooks/use-song";
import { usePlayerStore } from "@/store/use-player-store";

export default function SongQueue({
  queueSongs,
  creator,
  spaceId,
}: {
  queueSongs: Song[];
  creator: string;
  spaceId: string;
}) {
  const { mutate: vote } = useVote();
  const { mutate: removeVote } = useRemoveVote();
  const { mutate: deleteSong } = useDeleteSong();

  const { id } = useAuthStore((s) => s.identity);
  const { setCurrentSong, play } = usePlayerStore();

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

  if (queueSongs.length === 0) {
    return (
      <Card className="rounded-none border-0">
        <CardContent>
          <div className="text-center py-8">
            <Music2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No songs in queue</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add a song to get started!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="rounded-none border-0">
      <CardContent className="p-0">
        <ScrollArea className="h-full">
          <div className="space-y-2 p-4">
            {queueSongs.map((song, index) => (
              <div
                key={song.id}
                className="group relative border rounded-lg p-3 transition-all hover:bg-muted/50"
              >
                <div className="absolute -left-2 -top-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </div>

                <div className="flex items-start gap-3">
                  <div className="relative shrink-0">
                    <Image
                      src={song.thumbnail || "/placeholder.svg"}
                      alt={song.title}
                      width={64}
                      height={48}
                      className="w-16 h-12 object-cover rounded bg-muted"
                    />
                    {userRole === "creator" && (
                      <div className="absolute inset-0rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-6 w-6 p-0"
                          onClick={() => handlePlaySong(song)}
                        >
                          <Play className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                    {userRole === "viewer" && (
                      <div className="absolute inset-0 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <Lock className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-sm truncate">
                          {song.title.length > 35
                            ? song.title.slice(0, 35) + "..."
                            : song.title}
                        </h4>
                        <p className="text-xs text-muted-foreground truncate">
                          {song.artist.length > 35
                            ? song.artist.slice(0, 35) + "..."
                            : song.artist}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant="outline"
                            className="text-xs px-1 py-0"
                          >
                            {/* {getPlatformIcon(song.platform)} {song.platform} */}
                            🎥
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDuration(song.duration)}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-center gap-1">
                        <Button
                          size="sm"
                          variant={song.userVote === 1 ? "default" : "outline"}
                          className="h-6 w-6 p-0 cursor-pointer"
                          onClick={() => handleVote(song.id, 1, song.userVote)}
                        >
                          <ChevronUp className="h-3 w-3" />
                        </Button>
                        {/* <span className="text-xs font-medium min-w-[20px] text-center">{song.votes}</span> */}
                        <Button
                          size="sm"
                          variant={
                            song.userVote === -1 ? "destructive" : "outline"
                          }
                          className="h-6 w-6 p-0 cursor-pointer"
                          onClick={() => handleVote(song.id, -1, song.userVote)}
                        >
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                        {(id === (song.addedById || song.addedByAnon) ||
                          userRole === "creator") && (
                          <Button
                            size="sm"
                            onClick={() => handleDelete(song.id)}
                            className="h-6 w-6 p-0 cursor-pointer"
                            variant="destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">
                        Added by {song.addedById ?? song.addedByAnon}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(song.addedAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
