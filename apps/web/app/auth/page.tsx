"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Music } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";

export default function AuthPage() {
  const router = useRouter();

  const { user, loading } = useAuth();
  // const [user, setUser] = useState<User | null>(null);
  // const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState<string>("");
  const [isSubmiting, setIsSubmiting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.push("/create");
    }
  }, [user, loading, router]);

  const redirectUrl =
    process.env.NEXT_PUBLIC_REDIRECT_URL || "http://localhost:3000";

  const signInWithProvider = async (
    provider: "google" | "discord" | "github",
  ) => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectUrl,
      },
    });

    if (error) {
      console.error("Error signing in:", error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-500"></div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmiting(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) console.error("Error signing-in: ", error.message);

    setIsSubmiting(false);
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
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

      <section className="container mx-auto px-4 py-12 flex">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Welcome to MusicSpace</h2>
            <p className="text-muted-foreground text-lg">
              Sign in to create spaces and collaborate on playlists
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Email + Social Authentication</CardTitle>
              <CardDescription>
                Signin with your email or social media to create spaces
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="spaceName">Email</Label>
                  <Input
                    id="spaceName"
                    type="email"
                    placeholder="abc@something.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="spaceName">Password</Label>
                  <Input
                    id="spaceName"
                    type="password"
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Button
                    type="submit"
                    variant="default"
                    className="flex-1 w-full"
                    disabled={isSubmiting}
                  >
                    {isSubmiting ? "submitting..." : "submit"}
                  </Button>
                </div>
                <div className="gap-3 flex justify-center p-1">
                  <Button
                    className="w-1/2"
                    variant="outline"
                    onClick={() => signInWithProvider("google")}
                  >
                    Google
                  </Button>
                  <Button
                    className="w-1/2"
                    variant="outline"
                    onClick={() => signInWithProvider("github")}
                  >
                    Github
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
