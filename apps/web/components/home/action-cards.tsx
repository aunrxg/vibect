"use client";

import { Plus, Users, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";

import { useAuthStore } from "@/store/use-auth-store";

export function ActionCards() {
  const { session, identity } = useAuthStore();
  const isAuthenticated = !!session && !identity?.isAnonymous;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl mx-auto px-4">
      {/* Create Space Card */}
      <motion.div
        whileHover={{ y: -5 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <Card className="relative overflow-hidden group border-white/5 bg-linear-to-br from-indigo-500/10 to-purple-500/10 backdrop-blur-sm p-8 h-full flex flex-col justify-between hover:border-indigo-500/30 transition-colors duration-500">
          <div className="absolute top-0 right-0 p-12 -mr-8 -mt-8 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-colors" />

          <div>
            <div className="h-14 w-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
              <Plus className="h-8 w-8 text-indigo-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Create a Space
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              Start your own music room, invite friends, and take control of the
              queue. Be the DJ of your own party.
            </p>
          </div>

          <Button
            asChild
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-6 rounded-xl shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all"
          >
            <Link
              href={isAuthenticated ? "/create" : "/auth"}
              className="flex items-center justify-center gap-2 text-base"
            >
              {isAuthenticated ? "Get Started" : "Sign in to Create"}{" "}
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
        </Card>
      </motion.div>

      {/* Join Space Card */}
      <motion.div
        whileHover={{ y: -5 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <Card className="relative overflow-hidden group border-white/5 bg-linear-to-br from-emerald-500/10 to-teal-500/10 backdrop-blur-sm p-8 h-full flex flex-col justify-between hover:border-emerald-500/30 transition-colors duration-500">
          <div className="absolute top-0 right-0 p-12 -mr-8 -mt-8 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors" />

          <div>
            <div className="h-14 w-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
              <Users className="h-8 w-8 text-emerald-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Join a Space</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              Have a code? Jump into an existing room and start vibing with
              others in real-time.
            </p>
          </div>

          <Button
            asChild
            variant="outline"
            className="w-full border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500 py-6 rounded-xl transition-all"
          >
            <Link
              href="/join"
              className="flex items-center justify-center gap-2 text-base"
            >
              Enter Code <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
        </Card>
      </motion.div>
    </div>
  );
}
