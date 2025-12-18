"use client";

import Testimonials from "@/components/testimonial";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import extractSpaceId from "@/lib/extractSpaceId";
import { supabase } from "@/lib/supabaseClient";
import { ArrowLeft, ExternalLink, Music } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function JoinSpacePage() {
  const router = useRouter();
  const [spaceInput, setSpaceInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);

  const { user } = useAuth();

  const handleJoinSpace = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("SpaceID before: ", spaceInput);
    const spaceId = extractSpaceId(spaceInput);
    console.log("spaceID after: ", spaceId);
    if (!spaceId) {
      setError("Please enter a space ID or URL");
      return;
    }
    setIsJoining(true);
    setError(null);
    const { data: space, error } = await supabase
      .from("spaces")
      .select("*")
      .eq(`id`, spaceId)
      .single();

    if (error || !space) {
      setError(error?.message ?? "something went wrong");
      console.error(error);
      setIsJoining(false);
      return;
    }

    if (!space.allow_anonymous) {
      if (!user) {
        setError("You must be logged in to join this space.");
        setIsJoining(false);
        return;
      }
    }
    setIsJoining(false);
    router.push(`/space/${space.id}`);
  };

  return (
    <div className="min-h-screen bg-black/96 text-foreground">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="h-5 w-5" />
            <Music className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">MusicSpace</h1>
          </Link>
        </div>
      </header>

      {/* Join Space Form */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Join a Music Space</h2>
            <p className="text-muted-foreground text-lg">
              Enter a space ID or paste a shared link to join the musical fun
            </p>
          </div>

          <Card className="bg-muted/20 mb-6">
            <CardHeader>
              <CardTitle>Enter Space Details</CardTitle>
              <CardDescription>
                You can join using either a space ID or a full share link
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleJoinSpace} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="spaceInput">Space ID or Share Link *</Label>
                  <Input
                    id="spaceInput"
                    placeholder="ABC123 or https://musicspace.app/space/ABC123"
                    value={spaceInput}
                    onChange={(e) => setSpaceInput(e.target.value)}
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Paste the link someone shared with you, or enter the space
                    ID directly
                  </p>
                </div>

                {error && (
                  <div className="p-3 border border-destructive/20 bg-destructive/10 rounded-lg">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={!spaceInput.trim() || isJoining}
                  >
                    {isJoining ? "Joining Space..." : "Join Space"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={() => router.back()}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="mt-8 space-y-4">
            <div className="text-center">
              <p className="text-muted-foreground">
                Don&apos;t have a space to join?{" "}
                <Link href="/create" className="text-primary hover:underline">
                  Create your own space
                </Link>
              </p>
            </div>

            <Card className="bg-muted/20">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <ExternalLink className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium mb-1">
                      How to get a space link
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Ask the space creator to share the link with you, or look
                      for the &quot;Share Link&quot; button in any active music
                      space.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
