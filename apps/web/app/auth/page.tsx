"use client";

import { HomeHeader } from "@/components/home/home-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  IconBrandDiscord,
  IconBrandGithub,
  IconBrandGoogle,
} from "@tabler/icons-react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { toast } from "sonner";
import Input51 from "@/components/input51";
import { useAuthStore } from "@/store/use-auth-store";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";

  const {
    isAuthenticated,
    loading,
    signInWithProvider,
    signUpWithEmail,
    signInWithEmail,
    error,
  } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState<string>("");
  const [isSubmiting, setIsSubmiting] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, router, redirectTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmiting(true);

    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
        toast.success("Account created! Please check your email to verify.");
      } else {
        await signInWithEmail(email, password);
        toast.success("Welcome back!");
      }
    } catch (err: any) {
      toast.error(err.message || "Authentication failed. Please try again.");
    } finally {
      setIsSubmiting(false);
    }
  };

  const handleProviderAuth = async (
    provider: "google" | "github" | "discord",
  ) => {
    try {
      await signInWithProvider(provider);
    } catch (err: any) {
      toast.error(`Failed to sign in with ${provider}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col text-slate-200">
      <HomeHeader />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
        {/* Background Decor */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-[160px] -z-10 animate-pulse" />
        <div className="absolute top-20 right-20 w-96 h-96 bg-purple-500/5 rounded-full blur-[120px] -z-10" />

        <div className="w-full max-w-md relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <Link
              href="/"
              className="inline-flex items-center gap-2 mb-6 group"
            >
              <div className="h-12 w-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                {/* <Music className="h-6 w-6 text-indigo-400" /> */}
                <Image
                  src="/logo.svg"
                  alt="Logo"
                  width={80}
                  height={80}
                  className=" text-indigo-400"
                />
              </div>
              <span className="text-2xl font-black tracking-tighter text-white">
                Vibect
              </span>
            </Link>
            <h1 className="text-3xl font-black tracking-tight text-white mb-2">
              {isSignUp ? "Join the movement" : "Welcome back"}
            </h1>
            <p className="text-slate-400">
              {isSignUp
                ? "Create an account to start hosting your own spaces."
                : "Sign in to continue your musical journey."}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-white/5 bg-white/5 backdrop-blur-3xl rounded-[32px] overflow-hidden shadow-2xl">
              <CardContent className="p-8">
                {/* Social Auth */}
                <div className="grid grid-cols-3 gap-3 mb-8">
                  <Button
                    variant="outline"
                    onClick={() => handleProviderAuth("google")}
                    className="h-14 bg-white/5 border-white/10 hover:bg-white/10 rounded-2xl transition-all"
                  >
                    <IconBrandGoogle className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleProviderAuth("discord")}
                    className="h-14 bg-white/5 border-white/10 hover:bg-white/10 rounded-2xl transition-all"
                  >
                    <IconBrandDiscord className="h-5 w-5 text-[#5865F2]" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleProviderAuth("github")}
                    className="h-14 bg-white/5 border-white/10 hover:bg-white/10 rounded-2xl transition-all"
                  >
                    <IconBrandGithub className="h-5 w-5" />
                  </Button>
                </div>

                <div className="relative mb-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/5"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-[#0a0a0a] px-4 text-slate-500 font-bold tracking-widest">
                      Or with email
                    </span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1"
                    >
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-white/5 border-white/10 h-14 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-lg placeholder:text-slate-700 transition-all font-semibold"
                    />
                  </div>

                  <div className="space-y-2 relative">
                    <Input51 value={password} onChange={setPassword} />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmiting || loading}
                    className="w-full h-16 bg-white text-black hover:bg-slate-200 font-black text-lg rounded-2xl shadow-xl transition-all active:scale-[0.98] disabled:opacity-50 border-none cursor-pointer group"
                  >
                    {isSubmiting || loading ? (
                      <div className="flex items-center gap-2">
                        <div className="h-5 w-5 border-3 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                        Processing...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        {isSignUp ? "Create Account" : "Sign In"}
                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    )}
                  </Button>
                </form>

                <div className="mt-8 text-center">
                  <button
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-slate-400 hover:text-white text-sm font-bold transition-colors"
                  >
                    {isSignUp
                      ? "Already have an account? Sign in"
                      : "Don't have an account? Sign up"}
                  </button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <p className="mt-8 text-center text-slate-500 text-xs px-8">
            By clicking continue, you agree to our{" "}
            <Link
              href="/terms"
              className="text-slate-400 hover:text-white underline"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="text-slate-400 hover:text-white underline"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </main>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
          <div className="h-12 w-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      }
    >
      <AuthContent />
    </Suspense>
  );
}
