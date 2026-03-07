"use client";

// ui components
import Chat from "@/components/space/chat";
import { ConnectionStatus } from "@/components/space/connection-status";
import SongQueue from "@/components/space/song-queue";
import UserPresence from "@/components/space/user-presence";
import NowPlaying from "@/components/space/now-playing";
import MusicPlayer from "@/components/space/music-player";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DraggableCard from "@/components/space/draggable-card";
import SpaceInfo from "@/components/space/space-info";
import YoutubePlayer from "@/components/space/youtube-player";
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

import { SpaceSkeleton } from "@/components/loading-skeletons";

export default function SpacePage() {
  const { id: spaceId } = useParams<{ id: string }>();
  const router = useRouter();

  // local state
  const [linkCopied, setLinkCopied] = useState(false);
  const [isSheetExpanded, setIsSheetExpanded] = useState(false);

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
  if (spaceLoading || queueLoading) {
    return <SpaceSkeleton />;
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
      name: "Up next",
      value: "queue",
      count: queue?.meta?.total || 0,
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
    {
      name: "People",
      value: "people",
      count: space.memberCount || 0,
      content: <UserPresence creator={space.ownerId} />,
    },
    {
      name: "Space",
      value: "space",
      count: 1,
      content: (
        <SpaceInfo
          space={space}
          connectionState={connectionState}
          isOwner={id === space.ownerId}
        />
      ),
    },
  ];
  return (
    <main className="h-screen w-full text-white bg-black">
      <YoutubePlayer />
      <div className="flex flex-1 h-full flex-col md:flex-row min-h-0 relative">
        {/* Main Content Area: NowPlaying takes full space on mobile */}
        <section className="flex-1 h-full overflow-hidden">
          <div className="flex items-center gap-1.5 mt-0.5 justify-end px-5">
            <span className="text-xs text-slate-400 font-medium">
              {space.memberCount ?? 0} listening now
            </span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
          </div>
          <NowPlaying />
        </section>

        {/* Desktop Sidebar */}
        <section className="hidden md:flex h-full w-[450px] border-l border-white/5 flex-col">
          <div className="p-4 h-full">
            <Tabs defaultValue="queue" className="h-full flex flex-col">
              <TabsList className="w-full mb-6">
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="flex-1 flex items-center gap-2"
                  >
                    {tab.name}
                    {tab.count > 0 && (
                      <Badge className="h-5 min-w-5 px-1 tabular-nums">
                        {tab.count}
                      </Badge>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
              <div className="flex-1 overflow-hidden">
                {tabs.map((tab) => (
                  <TabsContent
                    key={tab.value}
                    value={tab.value}
                    className="h-full mt-0"
                  >
                    <div className="h-full overflow-y-auto">{tab.content}</div>
                  </TabsContent>
                ))}
              </div>
            </Tabs>
          </div>
        </section>

        {/* Mobile Draggable Card */}
        <div className="md:hidden">
          <DraggableCard isOpen={isSheetExpanded} onToggle={setIsSheetExpanded}>
            <Tabs defaultValue="queue" className="w-full">
              <TabsList className="w-full mb-8 flex justify-around bg-transparent border-0 h-auto p-0 pt-2 px-2">
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    onClick={() => setIsSheetExpanded(true)}
                    className="flex-1 flex flex-col items-center gap-1.5 data-[state=active]:bg-white/15 bg-white/5 rounded-2xl mx-1.5 py-3 data-[state=active]:text-white text-slate-300 capitalize text-[13px] font-semibold transition-all shadow-lg active:scale-95"
                  >
                    {tab.name}
                  </TabsTrigger>
                ))}
              </TabsList>
              {tabs.map((tab) => (
                <TabsContent key={tab.value} value={tab.value} className="mt-0">
                  {tab.content}
                </TabsContent>
              ))}
            </Tabs>
          </DraggableCard>
        </div>
      </div>

      {/* Desktop Music Player Bar */}
      <div className="hidden md:block">
        <MusicPlayer />
      </div>
    </main>
  );
}
