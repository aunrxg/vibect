"use client";

import { motion } from "framer-motion";
import { IconInnerShadowTop } from "@tabler/icons-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Profile from "../header/profile";

import { useAuthStore } from "@/store/use-auth-store";

export function HomeHeader() {
  const { session, identity, signOut } = useAuthStore();
  const isAuthenticated = !!session && !identity?.isAnonymous;

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 w-full border-b border-white/5 bg-black/40 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 group-hover:scale-110 transition-transform duration-300">
            <IconInnerShadowTop className="h-6 w-6 text-indigo-400" />
          </div>
          <span className="text-xl font-black tracking-tighter text-white uppercase italic">
            Vibect
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {["Explore", "Library", "About"].map((item) => (
            <Link
              key={item}
              href="#"
              className="text-sm font-bold text-slate-400 hover:text-white transition-colors tracking-wide uppercase"
            >
              {item}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-5">
          {isAuthenticated ? (
            <>
              <Button
                asChild
                className="hidden sm:flex bg-white/5 hover:bg-white/10 text-white border-white/10 rounded-xl px-5 h-11 font-bold transition-all active:scale-95"
              >
                <Link href="/create" className="flex items-center gap-2">
                  <Plus className="h-4.5 w-4.5" />
                  Create Space
                </Link>
              </Button>

              <div className="h-8 w-px bg-white/10 hidden sm:block" />

              <div className="flex items-center gap-3">
                <div className="hidden lg:flex flex-col items-end mr-1">
                  <span className="text-xs font-bold text-white leading-none truncate max-w-[100px]">
                    {identity?.name || "User"}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    Pro Plan
                  </span>
                </div>
                <div className="cursor-pointer hover:scale-105 transition-transform">
                  <Profile
                    user={{
                      name: identity?.name || "User",
                      email: identity?.email || "",
                      avatar: identity?.avatarUrl || "/avatars/default.jpg", // Assuming identity has image or default
                    }}
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <Button
                asChild
                variant="ghost"
                className="text-slate-300 hover:text-white hover:bg-white/5 font-bold rounded-xl h-11 px-6"
              >
                <Link href="/auth">Sign In</Link>
              </Button>
              <Button
                asChild
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl h-11 px-6 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
              >
                <Link href="/auth">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </motion.header>
  );
}
