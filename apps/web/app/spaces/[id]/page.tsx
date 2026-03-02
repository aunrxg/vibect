"use client";

// ui components
import Chat from "@/components/space/chat";
import { ConnectionStatus } from "@/components/space/connection-status";
import SongQueue from "@/components/space/song-queue";
import UserPresence from "@/components/space/user-presence";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Music, Share2 } from "lucide-react";
// zustand state stores
import { useAuthStore } from "@/store/use-auth-store";
import { useSpaceStore } from "@/store/use-space-store";
// next
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
// hooks
import { useSpace } from "@/hooks/use-space";
import { useSpaceWebSocket } from "@/hooks/use-space-ws";
import { useQueue } from "@/hooks/use-song";

export default function SpacePage() {
  const { id: spaceId } = useParams<{ id: string }>();
  const router = useRouter();

  // local state
  const [linkCopied, setLinkCopied] = useState(false);

  // zustand states
  const { identity } = useAuthStore();
  const id = identity.id;
  const setCurrentSpace = useSpaceStore((s) => s.setCurrentSpace);

  // fetch base data
  const {
    data: space,
    isLoading: spaceLoading,
    error: spaceError,
  } = useSpace(spaceId);
  const { data: queue, isLoading: queueLoading } = useQueue(spaceId);
  // ws connection
  const { connectionState } = useSpaceWebSocket(spaceId);

  // set current space in global state
  useEffect(() => {
    setCurrentSpace(spaceId);
    return () => setCurrentSpace(null);
  }, [spaceId, setCurrentSpace]);

  // loading state
  if (spaceLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-xl text-white">Loading space...</div>
      </div>
    );
  }
  if (queueLoading) {
    return <h1>Queue Loading...</h1>;
  }
  if (!space || spaceError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-xl text-red-500">
          Space not found
          <Button
            onClick={() => router.push("/join")}
            // className="ml-4 px-4 py-2 bg-blue-500 rounded"
          >
            Back to Spaces
          </Button>
        </div>
      </div>
    );
  }

  const handleShareLink = async () => {
    const shareUrl = `${window.location.origin}/space/${spaceId}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const tabs = [
    {
      name: "Queue",
      value: "queue",
      count: queue?.meta.total,
      content: (
        <SongQueue
          queueSongs={queue?.songs}
          creator={space.ownerId}
          spaceId={spaceId}
          currentSongId={space.currentSongId}
          spaceName={space.name}
        />
      ),
    },
    // {
    //   name: "People",
    //   value: "people",
    //   count: 5,
    //   content: <UserPresence creator={space.ownerId} />,
    // },
    {
      name: "Chat",
      value: "chat",
      count: 9,
      content: <Chat />,
    },
  ];
  return (
    <main className="h-screen w-full bg-[#030303] text-white">
      <header className="border-b border-white/10 backdrop-blur-sm sticky top-0 z-50 bg-[#030303]/80">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <Music className="h-8 w-8 text-white" />
                <span className="text-lg font-bold">Vitect</span>
              </Link>
              <div className="hidden sm:block w-px h-6 bg-border" />
              <div className="flex flex-col">
                <div className="hidden sm:block">
                  <h1 className="text-lg font-semibold leading-tight tracking-tight">
                    {space.name}
                  </h1>
                  {space.description && (
                    <p className="text-sm text-muted-foreground">
                      {space.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {space.memberCount || 0}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ConnectionStatus
                key={spaceId}
                connectionState={connectionState}
              />
              <Badge variant={id === space.ownerId ? "default" : "secondary"}>
                {id === space.ownerId ? "Creator" : "Viewer"}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShareLink}
                className="flex items-center gap-2 bg-transparent"
              >
                {linkCopied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Share2 className="h-4 w-4" />
                    Share Link
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Mobile space info */}
          <div className="sm:hidden mt-3 pt-3 border-t border-border">
            <h1 className="text-lg font-semibold">{space.name}</h1>
            {space.description && (
              <p className="text-sm text-muted-foreground">
                {space.description}
              </p>
            )}
          </div>
        </div>
      </header>
      <div className="flex h-11/12 flex-col md:flex-row">
        <section className="bg-green-400 h-full w-full md:w-3/5 overflow-hidden">
          {/* <AspectRatio ratio={1 / 1} className="relative flex items-center justify-center">
             <Image src="https://img.freepik.com/free-psd/neon-void-cd-cover-template_23-2152015422.jpg?semt=ais_hybrid&w=740&q=80" alt="album" fill
            sizes="(max-width: 768px) 100vw, 33vw" className="object-cover object-center"
            priority={false} />
          </AspectRatio> */}
        </section>
        <section className="h-full w-full md:w-2/5">
          <div className="w-full h-full flex flex-col gap-6 items-center">
            <Tabs defaultValue="queue" className="w-full gap-4">
              <TabsList className="w-full">
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="flex items-center gap-1 px-2.5 sm:px-3"
                  >
                    {tab.name}
                    <Badge className="h-5 min-w-5 px-1 tabular-nums">
                      {tab.count}
                    </Badge>
                  </TabsTrigger>
                ))}
              </TabsList>
              {tabs.map((tab) => (
                <TabsContent key={tab.value} value={tab.value}>
                  {tab.content}
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </section>
      </div>
    </main>
  );
}
