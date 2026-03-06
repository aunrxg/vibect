"use client";

import { HomeHeader } from "@/components/home/home-header";
import {
  MoveLeft,
  Search,
  Music,
  Link as LinkIcon,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { AuthGuard } from "@/components/auth-guard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import extractSpaceId, { ExtractedSpace } from "@/lib/extractSpaceId";
import { supabase } from "@/lib/supabaseClient";
import { useAuthStore } from "@/store/use-auth-store";

export default function JoinSpacePage() {
  const router = useRouter();
  const [inputValues, setInputValues] = useState("");
  const [extracted, setExtracted] = useState<ExtractedSpace | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const { session, identity } = useAuthStore();
  const isAuthenticated = !!session && !identity?.isAnonymous;

  useEffect(() => {
    const result = extractSpaceId(inputValues);
    setExtracted(result);
    setSearchError(null);
  }, [inputValues]);

  const handleJoinSpace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!extracted) return;

    setIsSearching(true);
    setSearchError(null);

    try {
      let spaceData = null;

      if (extracted.type === "uuid") {
        const { data, error } = await supabase
          .from("spaces")
          .select("id, isPublic")
          .eq("id", extracted.id)
          .single();
        if (error) throw error;
        spaceData = data;
      } else if (extracted.type === "invite_code") {
        // We added a backend endpoint for this, but let's use the API via fetch
        // because we don't have a direct hook for "getSpaceByCode" in the frontend yet
        // and using supabase directly on invite code is also possible if it's indexed.
        const { data, error } = await supabase
          .from("spaces")
          .select("id, isPublic")
          .eq("inviteCode", extracted.id)
          .single();
        if (error) throw error;
        spaceData = data;
      } else if (extracted.type === "url") {
        // First try as UUID if it matches UUID format
        const uuidRegex =
          /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
        if (uuidRegex.test(extracted.id)) {
          const { data, error } = await supabase
            .from("spaces")
            .select("id, isPublic")
            .eq("id", extracted.id)
            .single();
          if (!error) spaceData = data;
        }

        // If not found, try as invite code
        if (!spaceData) {
          const { data, error } = await supabase
            .from("spaces")
            .select("id, isPublic")
            .eq("inviteCode", extracted.id)
            .single();
          if (error) throw error;
          spaceData = data;
        }
      }

      if (!spaceData) {
        throw new Error("Space not found. Please check your code or link.");
      }

      router.push(`/spaces/${spaceData.id}`);
      toast.success("Joining space...");
    } catch (err: any) {
      console.error("Join error:", err);
      setSearchError(err.message || "Could not find this space.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col text-slate-200">
      <HomeHeader />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
        {/* Background Decor */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[160px] -z-10" />

        <div className="w-full max-w-xl relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 text-center"
          >
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-6">
              <Music className="h-8 w-8 text-indigo-400" />
            </div>
            <h1 className="text-4xl font-black tracking-tight text-white mb-3">
              Join a Space
            </h1>
            <p className="text-slate-400 text-lg max-w-md mx-auto">
              Enter a space ID, invite code, or paste a shared link to start
              vibing with others.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-white/5 bg-white/5 backdrop-blur-3xl rounded-[32px] overflow-hidden shadow-2xl">
              <CardContent className="p-8">
                <form onSubmit={handleJoinSpace} className="space-y-6">
                  <div className="space-y-3 relative">
                    <Label
                      htmlFor="spaceInput"
                      className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1"
                    >
                      Space identifier
                    </Label>
                    <div className="relative group">
                      <Input
                        id="spaceInput"
                        placeholder="Paste link or code here..."
                        value={inputValues}
                        onChange={(e) => setInputValues(e.target.value)}
                        autoFocus
                        className="bg-white/5 border-white/10 h-16 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-lg placeholder:text-slate-600 transition-all font-semibold pl-14 pr-12 shadow-inner"
                      />
                      <div className="absolute left-5 top-1/2 -translate-y-1/2">
                        <LinkIcon
                          className={`h-6 w-6 transition-colors ${inputValues ? "text-indigo-400" : "text-slate-600"}`}
                        />
                      </div>

                      <AnimatePresence>
                        {extracted && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="absolute right-4 top-1/2 -translate-y-1/2"
                          >
                            <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Validation Feedback */}
                  <AnimatePresence mode="wait">
                    {extracted ? (
                      <motion.div
                        key="valid"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-start gap-3 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20"
                      >
                        <Sparkles className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-bold text-slate-200">
                            Identifier detected!
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            We found a{" "}
                            {extracted.type === "invite_code"
                              ? "Invite Code"
                              : extracted.type === "uuid"
                                ? "Space ID"
                                : "Link"}
                            :
                            <span className="text-indigo-300 font-mono ml-1">
                              {extracted.id}
                            </span>
                          </p>
                        </div>
                      </motion.div>
                    ) : (
                      inputValues && (
                        <motion.div
                          key="invalid"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20"
                        >
                          <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                          <p className="text-xs text-amber-200/80 font-medium">
                            Invalid code or link format. Please check and try
                            again.
                          </p>
                        </motion.div>
                      )
                    )}
                  </AnimatePresence>

                  {searchError && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3"
                    >
                      <AlertCircle className="h-5 w-5 text-rose-500" />
                      <p className="text-xs font-bold text-rose-200">
                        {searchError}
                      </p>
                    </motion.div>
                  )}

                  <div className="pt-2">
                    <Button
                      type="submit"
                      disabled={!extracted || isSearching}
                      className="w-full h-16 bg-white text-black hover:bg-slate-200 font-black text-xl rounded-2xl shadow-xl transition-all active:scale-[0.98] disabled:opacity-30 disabled:grayscale border-none cursor-pointer flex items-center justify-center gap-3 overflow-hidden"
                    >
                      {isSearching ? (
                        <>
                          <div className="h-5 w-5 border-3 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                          Entering...
                        </>
                      ) : (
                        <>
                          <Search className="h-6 w-6" />
                          Join Space
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          <div className="mt-8 flex items-center justify-center gap-6">
            <Button
              variant="link"
              onClick={() => router.back()}
              className="text-slate-500 hover:text-slate-300 flex items-center gap-2"
            >
              <MoveLeft className="h-4 w-4" />
              Go Back
            </Button>
            <div className="w-1 h-1 rounded-full bg-slate-800" />
            <Button
              variant="link"
              onClick={() => router.push("/create")}
              className="text-indigo-400 hover:text-indigo-300 font-bold"
            >
              Start Your Own Space
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
