"use client";

import { usePublicSpace } from "@/hooks/use-space";
import { Users, Music2, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function PublicSpaces() {
  const { data: spaces, isLoading } = usePublicSpace();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto px-4 py-20">
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48 bg-white/5" />
            <Skeleton className="h-4 w-64 bg-white/5" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-48 rounded-2xl bg-white/5" />
          ))}
        </div>
      </div>
    );
  }

  if (!spaces || spaces.length === 0) return null;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-20">
      <div className="flex items-center justify-between mb-10 px-2">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">
            Public Spaces
          </h2>
          <p className="text-slate-400 mt-2 text-lg">
            Jump into a trending room and share the vibe
          </p>
        </div>
        <Link
          href="/join"
          className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 group"
        >
          Browse All{" "}
          <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        {spaces.map((space) => (
          <motion.div key={space.id} variants={item}>
            <Link href={`/spaces/${space.id}`}>
              <Card className="group relative overflow-hidden border-white/5 bg-white/3 hover:bg-white/[0.07] backdrop-blur-sm p-5 rounded-2xl transition-all duration-300 hover:border-indigo-500/20 shadow-xl shadow-black/20">
                <div className="flex items-start justify-between mb-4">
                  <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Music2 className="h-6 w-6 text-indigo-400" />
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/5">
                    <Users className="h-3.5 w-3.5 text-indigo-400" />
                    <span className="text-[11px] font-bold text-slate-300 tracking-wider">
                      {space.memberCount || 0}
                    </span>
                  </div>
                </div>

                <h4 className="text-lg font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors truncate">
                  {space.name}
                </h4>
                <p className="text-sm text-slate-500 line-clamp-2 min-h-[40px] mb-4">
                  {space.description || "No description provided."}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
                    Live Now
                  </span>
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
                </div>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
