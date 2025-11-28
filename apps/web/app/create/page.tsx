"use client";

import { AuthGuard } from "@/components/auth-guard";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { ArrowLeft, Music } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function CreateSpacePage() {
  const router = useRouter();
  const [spaceName, setSpaceName] = useState("");
  const [description, setDescription] = useState("");
  const [allowAnonymous, setAllowAnonymous] = useState(true);
  const [allowInteractions, setAllowInteractions] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const { user, loading } = useAuth();

  const handleCreateSpace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!spaceName) return; //toast

    setIsCreating(true);

    // check if spaceCode already exist
    const { data, error } = await supabase
      .from("spaces")
      .insert([
        {
          name: spaceName,
          allow_anonymous: allowAnonymous,
          allow_interactions: allowInteractions,
          created_by: user.id,
        },
      ])
      .select("id")
      .single();

    if (error) {
      console.error("Error making new entry: ", error);
    } else {
      router.push(`/space/${data.id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-500"></div>
      </div>
    );
  }

  return (
    <AuthGuard>
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

        {/* Create Space Form */}
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">
                Create Your Music Space
              </h2>
              <p className="text-muted-foreground text-lg">
                Set up a collaborative music space where your community can add
                and vote on songs
              </p>
            </div>

            <Card className="bg-muted/40 border rounded-xl">
              <CardHeader>
                <CardTitle>Space Configuration</CardTitle>
                <CardDescription>
                  Configure your music space settings. You can always change
                  these later.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateSpace} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="spaceName">Space Name *</Label>
                    <Input
                      id="spaceName"
                      placeholder="My Awesome Music Space"
                      value={spaceName}
                      onChange={(e) => setSpaceName(e.target.value)}
                      required
                    />
                    <p className="text-sm text-muted-foreground">
                      Choose a memorable name for your music space
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe what kind of music or vibe you're going for..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="space-y-1">
                      <Label htmlFor="requireAuth">Allow Anonymous</Label>
                      <p className="text-sm text-muted-foreground">
                        Anonymous users can add songs and vote
                      </p>
                    </div>
                    <Switch
                      id="requireAuth"
                      checked={allowAnonymous}
                      onCheckedChange={setAllowAnonymous}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="space-y-1">
                      <Label htmlFor="allowInteractions">
                        Allow Interactions
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Users can switch songs and toggle playback
                      </p>
                    </div>
                    <Switch
                      id="allowInteractions"
                      checked={allowInteractions}
                      onCheckedChange={setAllowInteractions}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={!spaceName.trim() || isCreating || !user}
                    >
                      {isCreating ? "Creating Space..." : "Create Space"}
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

            <div className="mt-8 text-center">
              <p className="text-muted-foreground">
                Already have a space ID?{" "}
                <Link href="/join" className="text-primary hover:underline">
                  Join an existing space
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </AuthGuard>
  );
}
