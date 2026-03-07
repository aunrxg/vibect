"use client";

import { HomeHeader } from "@/components/home/home-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/store/use-auth-store";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings,
  LayoutGrid,
  History,
  User as UserIcon,
  ShieldCheck,
  Bell,
  CreditCard,
  Plus,
  ExternalLink,
  Music,
  Users,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useUserSpaces } from "@/hooks/use-space";

export default function ProfilePage() {
  const { identity, session } = useAuthStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "spaces" | "activity" | "settings"
  >("spaces");

  const { data: spaces, isLoading } = useUserSpaces();

  useEffect(() => {
    if (!session && !identity?.isAnonymous) {
      // Not logged in and not an anon user? (though store usually handles this)
      // router.push("/auth");
    }
  }, [session, identity, router]);

  const user = {
    name: identity?.name || "Anonymous Vibe",
    email: identity?.email || "No email linked",
    avatar: identity?.avatarUrl || "/avatars/default.jpg",
    isPro: true, // Mocking for UI
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col text-slate-200">
      <HomeHeader />

      <main className="max-w-7xl mx-auto w-full px-6 py-12 flex-1">
        {/* Profile Header */}
        <section className="relative mb-12">
          <div className="absolute inset-0 bg-linear-to-r from-indigo-500/10 to-purple-500/10 blur-[100px] -z-10 rounded-full" />

          <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative group"
            >
              <div className="absolute -inset-2 bg-linear-to-tr from-indigo-500 to-purple-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-500" />
              <Avatar className="h-40 w-40 border-4 border-white/5 relative bg-zinc-900">
                <AvatarImage src={user.avatar} className="object-cover" />
                <AvatarFallback className="text-4xl bg-indigo-600 text-white font-black">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <button className="absolute bottom-2 right-2 p-2 bg-indigo-600 rounded-xl border border-white/10 shadow-lg hover:bg-indigo-500 transition-colors">
                <Settings className="h-5 w-5 text-white" />
              </button>
            </motion.div>

            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                <h1 className="text-4xl font-black tracking-tight text-white">
                  {user.name}
                </h1>
                {user.isPro && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-widest w-fit mx-auto md:mx-0">
                    Pro Member
                  </span>
                )}
              </div>
              <p className="text-slate-400 font-medium mb-6">{user.email}</p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                <div className="px-5 py-2.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-sm font-bold text-slate-300">
                    Active Now
                  </span>
                </div>
                <div className="px-5 py-2.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                  <Users className="h-4 w-4 text-indigo-400" />
                  <span className="text-sm font-bold text-slate-300">
                    {spaces?.length || 0} Spaces Created
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                asChild
                className="bg-white text-black hover:bg-slate-200 font-black rounded-2xl px-8 h-12 shadow-xl shadow-white/5 transition-all active:scale-95"
              >
                <Link href="/create">
                  <Plus className="h-5 w-5 mr-2" />
                  New Space
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Dynamic Tabs */}
        <div className="flex items-center gap-2 mb-8 bg-white/5 p-1 rounded-2xl w-fit border border-white/5">
          <button
            onClick={() => setActiveTab("spaces")}
            className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${activeTab === "spaces" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-slate-400 hover:text-white"}`}
          >
            <LayoutGrid className="h-4 w-4" />
            MY SPACES
          </button>
          <button
            onClick={() => setActiveTab("activity")}
            className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${activeTab === "activity" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-slate-400 hover:text-white"}`}
          >
            <History className="h-4 w-4" />
            ACTIVITY
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${activeTab === "settings" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-slate-400 hover:text-white"}`}
          >
            <UserIcon className="h-4 w-4" />
            SETTINGS
          </button>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence mode="wait">
              {activeTab === "spaces" && (
                <motion.div
                  key="spaces"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  {isLoading ? (
                    Array(4)
                      .fill(0)
                      .map((_, i) => (
                        <div
                          key={i}
                          className="h-48 rounded-3xl bg-white/5 animate-pulse border border-white/5"
                        />
                      ))
                  ) : spaces && spaces.length > 0 ? (
                    spaces.map((space: any) => (
                      <Link
                        href={`/spaces/${space.id}`}
                        key={space.id}
                        className="group"
                      >
                        <Card className="bg-white/5 border-white/5 rounded-[32px] overflow-hidden hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] border-none">
                          <CardContent className="p-6 flex flex-col h-full justify-between min-h-[180px]">
                            <div className="flex justify-between items-start">
                              <div className="h-12 w-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center">
                                <Music className="h-6 w-6 text-indigo-400" />
                              </div>
                              <div className="p-2 rounded-xl bg-black/40 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
                                <ExternalLink className="h-4 w-4 text-white" />
                              </div>
                            </div>
                            <div>
                              <h3 className="text-xl font-black text-white mb-1 group-hover:text-indigo-400 transition-colors">
                                {space.name}
                              </h3>
                              <p className="text-slate-500 text-sm font-medium line-clamp-1">
                                {space.description || "Musical community space"}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))
                  ) : (
                    <div className="col-span-full py-20 text-center">
                      <div className="h-20 w-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <Music className="h-10 w-10 text-slate-700" />
                      </div>
                      <h3 className="text-2xl font-black text-white mb-2">
                        No Spaces Yet
                      </h3>
                      <p className="text-slate-500 max-w-xs mx-auto mb-8">
                        Launch your first room and start sharing your vibe with
                        the world.
                      </p>
                      <Button
                        asChild
                        className="bg-indigo-600 hover:bg-indigo-500 rounded-2xl px-8"
                      >
                        <Link href="/create">Let's Go</Link>
                      </Button>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "activity" && (
                <motion.div
                  key="activity"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4"
                >
                  {[
                    {
                      type: "join",
                      target: "Lofi Chill Vibes",
                      time: "2 hours ago",
                    },
                    {
                      type: "add",
                      target: "Midnight City - M83",
                      time: "5 hours ago",
                    },
                    {
                      type: "create",
                      target: "Techno Pulse",
                      time: "Yesterday",
                    },
                  ].map((act, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 p-5 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
                    >
                      <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0">
                        {act.type === "join" ? (
                          <Users className="h-5 w-5 text-emerald-400" />
                        ) : act.type === "add" ? (
                          <Plus className="h-5 w-5 text-indigo-400" />
                        ) : (
                          <Music className="h-5 w-5 text-purple-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-slate-400 text-sm font-bold uppercase tracking-wider">
                          {act.type === "join"
                            ? "Joined Space"
                            : act.type === "add"
                              ? "Added Song"
                              : "Created Space"}
                        </p>
                        <h4 className="text-white font-black truncate">
                          {act.target}
                        </h4>
                      </div>
                      <span className="text-xs text-slate-600 font-bold uppercase tracking-widest">
                        {act.time}
                      </span>
                    </div>
                  ))}
                </motion.div>
              )}

              {activeTab === "settings" && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  {[
                    {
                      icon: ShieldCheck,
                      title: "Security",
                      desc: "Two-factor auth & sessions",
                      color: "text-emerald-400",
                    },
                    {
                      icon: Bell,
                      title: "Notifications",
                      desc: "Push & email alerts",
                      color: "text-amber-400",
                    },
                    {
                      icon: CreditCard,
                      title: "Billing",
                      desc: "Manage subscription & payment",
                      color: "text-indigo-400",
                    },
                    {
                      icon: UserIcon,
                      title: "Profile Info",
                      desc: "Name, email & avatar",
                      color: "text-purple-400",
                    },
                  ].map((set, i) => (
                    <button
                      key={i}
                      className="flex flex-col items-start gap-4 p-8 rounded-[32px] bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 transition-all text-left"
                    >
                      <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center">
                        <set.icon className={`h-6 w-6 ${set.color}`} />
                      </div>
                      <div>
                        <h4 className="text-lg font-black text-white">
                          {set.title}
                        </h4>
                        <p className="text-sm text-slate-500 font-medium">
                          {set.desc}
                        </p>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <Card className="bg-linear-to-br from-indigo-600 to-purple-800 border-none rounded-[32px] overflow-hidden shadow-2xl shadow-indigo-500/20">
              <CardContent className="p-8">
                <Sparkles className="h-10 w-10 text-white/50 mb-4" />
                <h3 className="text-2xl font-black text-white mb-2">
                  Vibect Pro
                </h3>
                <p className="text-white/80 font-medium mb-6">
                  Enjoy unlimited spaces, custom themes, and HD streaming
                  quality.
                </p>
                <Button className="w-full bg-white text-indigo-700 hover:bg-slate-100 font-black rounded-2xl h-14 shadow-xl active:scale-95 transition-all">
                  Manage Plan
                </Button>
              </CardContent>
            </Card>

            <div className="p-8 rounded-[32px] bg-white/5 border border-white/5">
              <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6">
                Global Statistics
              </h4>
              <div className="space-y-6">
                {[
                  { label: "Total Vibe Hours", value: "124 hrs" },
                  { label: "Songs Contributed", value: "2,482" },
                  { label: "Global Ranking", value: "#1,204" },
                ].map((stat, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <span className="text-slate-400 font-bold text-sm tracking-wide">
                      {stat.label}
                    </span>
                    <span className="text-white font-black">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
