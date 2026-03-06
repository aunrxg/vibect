"use client";

import { HomeHeader } from "@/components/home/home-header";
import { MoveLeft, Sparkles, Globe, Lock, Share2 } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";
import { AuthGuard } from "@/components/auth-guard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useCreateSpace } from "@/hooks/use-space";
import { useAuthStore } from "@/store/use-auth-store";

export default function CreateSpacePage() {
  const router = useRouter();
  const [spaceName, setSpaceName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  const { session, identity } = useAuthStore();
  const isAuthenticated = !!session && !identity?.isAnonymous;

  const { mutate: createSpace, isPending } = useCreateSpace();

  const handleCreateSpace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!spaceName) {
      toast.error("Space Name is required");
      return;
    }
    createSpace(
      { name: spaceName, isPublic, description },
      {
        onSuccess: (newSpace) => {
          toast.success("Space created successfully!");
          router.push(`/spaces/${newSpace.id}`);
        },
        onError: (err: any) => {
          console.error("Failed to create space: ", err);
          toast.error(
            err.response?.data?.message ||
              "Failed to create space. Please try again.",
          );
        },
      },
    );
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col text-slate-200">
        <HomeHeader />

        <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
          {/* Background Decor */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] -z-10 animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] -z-10 animate-pulse delay-700" />

          <div className="w-full max-w-xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="text-slate-400 hover:text-white mb-6 -ml-4 group px-4 bg-transparent hover:bg-white/5"
              >
                <MoveLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Dashboard
              </Button>

              <div className="flex items-center gap-4 mb-2">
                <div className="h-12 w-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-indigo-400" />
                </div>
                <h1 className="text-3xl font-black tracking-tight text-white">
                  Create a Space
                </h1>
              </div>
              <p className="text-slate-400 text-lg">
                Launch your own music room and invite the world or keep it
                private with friends.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-white/5 bg-white/5 backdrop-blur-2xl rounded-[32px] overflow-hidden shadow-2xl">
                <CardContent className="p-8">
                  <form onSubmit={handleCreateSpace} className="space-y-8">
                    <div className="space-y-3">
                      <Label
                        htmlFor="spaceName"
                        className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1"
                      >
                        Space Name
                      </Label>
                      <Input
                        id="spaceName"
                        placeholder="e.g. Midnight Vibez Only"
                        value={spaceName}
                        onChange={(e) => setSpaceName(e.target.value)}
                        required
                        className="bg-white/5 border-white/10 h-14 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-lg placeholder:text-slate-600 transition-all font-semibold px-4"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label
                        htmlFor="description"
                        className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1"
                      >
                        Vibe Description
                      </Label>
                      <Textarea
                        id="description"
                        placeholder="Tell use about the music, the mood, or the rules..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                        className="bg-white/5 border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-base placeholder:text-slate-600 transition-all resize-none font-medium p-4"
                      />
                    </div>

                    <div className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div
                            className={`p-3 rounded-xl ${isPublic ? "bg-indigo-500/20 border border-indigo-500/30" : "bg-slate-700/20 border border-slate-700/30"}`}
                          >
                            {isPublic ? (
                              <Globe className="h-5 w-5 text-indigo-400" />
                            ) : (
                              <Lock className="h-5 w-5 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <Label
                              htmlFor="public-toggle"
                              className="text-base font-bold text-white leading-none"
                            >
                              Public Space
                            </Label>
                            <p className="text-xs text-slate-400 mt-1.5">
                              Appear in discovery and let anyone join.
                            </p>
                          </div>
                        </div>
                        <Switch
                          id="public-toggle"
                          checked={isPublic}
                          onCheckedChange={setIsPublic}
                          className="data-[state=checked]:bg-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="pt-4 space-y-4">
                      <Button
                        type="submit"
                        disabled={
                          !spaceName.trim() || isPending || !isAuthenticated
                        }
                        className="w-full h-16 bg-linear-to-br from-indigo-600 to-purple-700 hover:from-indigo-500 hover:to-purple-600 text-white font-black text-xl rounded-2xl shadow-2xl shadow-indigo-500/20 transition-all active:scale-[0.98] disabled:opacity-50 border-none cursor-pointer"
                      >
                        {isPending ? (
                          <div className="flex items-center gap-2">
                            <div className="h-5 w-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                            Launching...
                          </div>
                        ) : (
                          "Launch Space"
                        )}
                      </Button>

                      <div className="flex items-center justify-center gap-2 py-2">
                        <div className="h-px bg-slate-800 flex-1" />
                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest flex items-center gap-2 px-2">
                          <Share2 className="h-3 w-3" />
                          Shareable link after launch
                        </p>
                        <div className="h-px bg-slate-800 flex-1" />
                      </div>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
