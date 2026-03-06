"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export function HomeHero() {
  return (
    <div className="relative py-24 md:py-32 overflow-hidden flex flex-col items-center text-center">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute -top-40 right-0 w-[500px] h-[500px] bg-purple-500/5 blur-[100px] rounded-full pointer-events-none -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="px-4"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold tracking-widest uppercase mb-8">
          <Sparkles className="h-3.5 w-3.5" />
          The Ultimate Music Social Experience
        </div>

        <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter mb-6 leading-[0.9]">
          Vibe with <br />
          <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-500 via-purple-500 to-indigo-500 animate-gradient">
            Friends.
          </span>
        </h1>

        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Create personalized music spaces, invite your squad, and listen to
          synchronized beats in real-time. No delays, just pure vibes.
        </p>
      </motion.div>
    </div>
  );
}
