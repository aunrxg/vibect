import Chat from "@/components/space/chat";
import SongQueue from "@/components/space/song-queue";
import UserPresence from "@/components/space/user-presence";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AspectRatio } from "@radix-ui/react-aspect-ratio";
import Image from "next/image";

export default function SpacePage() {
  return (
    <main className="h-screen w-full">
      <header className="bg-red-400 h-1/12">Space Info</header>
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
            <Tabs className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="queue">
                  Queue
                  <Badge variant="secondary">5</Badge>
                </TabsTrigger>
                <TabsTrigger value="people">
                  People
                  <Badge variant="secondary">5</Badge>
                </TabsTrigger>
                <TabsTrigger value="chat">Chat</TabsTrigger>
              </TabsList>
              <TabsContent value="queue">
                <SongQueue />
              </TabsContent>
              <TabsContent value="people">
                <UserPresence />
              </TabsContent>
              <TabsContent value="chat">
                <Chat />
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </div>
    </main>
  );
}
