"use client";

import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import {
  IconBrandDiscord,
  IconBrandGithub,
  IconBrandGoogle,
  IconEye,
  IconEyeOff,
} from "@tabler/icons-react";
import Image from "next/image";

export default function AuthPage() {
  const router = useRouter();

  const { user, loading } = useAuth();
  // const [user, setUser] = useState<User | null>(null);
  // const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState<string>("");
  const [isSubmiting, setIsSubmiting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [signUp, setSignUp] = useState(false);

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
    // <div className="min-h-screen bg-background text-foreground">
    //   <header className="border-b border-border">
    //     <div className="container mx-auto px-4 py-4 flex items-center justify-between">
    //       <Link
    //         href="/"
    //         className="flex items-center gap-2 hover:opacity-80 transition-opacity"
    //       >
    //         <ArrowLeft className="h-5 w-5" />
    //         <Music className="h-8 w-8 text-primary" />
    //         <h1 className="text-2xl font-bold">MusicSpace</h1>
    //       </Link>
    //     </div>
    //   </header>

    //   <section className="container mx-auto px-4 py-12 flex">
    //     <div className="max-w-2xl mx-auto">
    //       <div className="text-center mb-8">
    //         <h2 className="text-3xl font-bold mb-4">Welcome to MusicSpace</h2>
    //         <p className="text-muted-foreground text-lg">
    //           Sign in to create spaces and collaborate on playlists
    //         </p>
    //       </div>

    //       <Card>
    //         <CardHeader>
    //           <CardTitle>Email + Social Authentication</CardTitle>
    //           <CardDescription>
    //             Signin with your email or social media to create spaces
    //           </CardDescription>
    //         </CardHeader>
    //         <CardContent>
    //           <form onSubmit={handleSubmit} className="space-y-6">
    //             <div className="space-y-2">
    //               <Label htmlFor="spaceName">Email</Label>
    //               <Input
    //                 id="spaceName"
    //                 type="email"
    //                 placeholder="abc@something.com"
    //                 value={email}
    //                 onChange={(e) => setEmail(e.target.value)}
    //                 required
    //               />
    //             </div>
    //             <div className="space-y-2">
    //               <Label htmlFor="spaceName">Password</Label>
    //               <Input
    //                 id="spaceName"
    //                 type="password"
    //                 placeholder="********"
    //                 value={password}
    //                 onChange={(e) => setPassword(e.target.value)}
    //                 required
    //               />
    //             </div>
    //             <div className="space-y-2">
    //               <Button
    //                 type="submit"
    //                 variant="default"
    //                 className="flex-1 w-full"
    //                 disabled={isSubmiting}
    //               >
    //                 {isSubmiting ? "submitting..." : "submit"}
    //               </Button>
    //             </div>
    //             <div className="gap-3 flex justify-center p-1">
    //               <Button
    //                 className="w-1/2"
    //                 variant="outline"
    //                 onClick={() => signInWithProvider("google")}
    //               >
    //                 Google
    //               </Button>
    //               <Button
    //                 className="w-1/2"
    //                 variant="outline"
    //                 onClick={() => signInWithProvider("github")}
    //               >
    //                 Github
    //               </Button>
    //             </div>
    //           </form>
    //         </CardContent>
    //       </Card>
    //     </div>
    //   </section>
    // </div>
    <main className="bg-background flex min-h-screen w-full flex-col items-center justify-center sm:px-4">
      <div className="w-full space-y-4 sm:max-w-md">
        <div className="text-center">
          <Image
            src="/logo.svg"
            alt="MVPBlocks Logo"
            width={80}
            height={80}
            className="mx-auto"
          />
          <div className="mt-5 space-y-2">
            {signUp ? (
              <h3 className="text-2xl font-bold sm:text-3xl">
                Oopsies Still here ;)
              </h3>
            ) : (
              <h3 className="text-2xl font-bold sm:text-3xl">
                Log in to your account
              </h3>
            )}
            {signUp ? (
              <p className="">
                I Do have an account?{" "}
                <Link
                  href=""
                  onClick={() => setSignUp(!signUp)}
                  className="font-medium text-primary hover:text-primary/90"
                >
                  Login
                </Link>
              </p>
            ) : (
              <p className="">
                Don&apos;t have an account?{" "}
                <Link
                  href=""
                  onClick={() => setSignUp(!signUp)}
                  className="font-medium text-primary hover:text-primary/90"
                >
                  Sign up
                </Link>
              </p>
            )}
          </div>
        </div>
        <div className="space-y-6 p-4 py-6 shadow sm:rounded-lg sm:p-6">
          <div className="grid grid-cols-3 gap-x-3">
            <Button
              variant="outline"
              aria-label="Sign in with Google"
              onClick={() => signInWithProvider("google")}
              className="flex items-center justify-center rounded-lg border py-5 duration-150 cursor-pointer"
            >
              {/* <svg
                className="h-10 w-10"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#clip0_17_40)">
                  <path
                    d="M47.532 24.5528C47.532 22.9214 47.3997 21.2811 47.1175 19.6761H24.48V28.9181H37.4434C36.9055 31.8988 35.177 34.5356 32.6461 36.2111V42.2078H40.3801C44.9217 38.0278 47.532 31.8547 47.532 24.5528Z"
                    fill="#4285F4"
                  />
                  <path
                    d="M24.48 48.0016C30.9529 48.0016 36.4116 45.8764 40.3888 42.2078L32.6549 36.2111C30.5031 37.675 27.7252 38.5039 24.4888 38.5039C18.2275 38.5039 12.9187 34.2798 11.0139 28.6006H3.03296V34.7825C7.10718 42.8868 15.4056 48.0016 24.48 48.0016Z"
                    fill="#34A853"
                  />
                  <path
                    d="M11.0051 28.6006C9.99973 25.6199 9.99973 22.3922 11.0051 19.4115V13.2296H3.03298C-0.371021 20.0112 -0.371021 28.0009 3.03298 34.7825L11.0051 28.6006Z"
                    fill="#FBBC04"
                  />
                  <path
                    d="M24.48 9.49932C27.9016 9.44641 31.2086 10.7339 33.6866 13.0973L40.5387 6.24523C36.2 2.17101 30.4414 -0.068932 24.48 0.00161733C15.4055 0.00161733 7.10718 5.11644 3.03296 13.2296L11.005 19.4115C12.901 13.7235 18.2187 9.49932 24.48 9.49932Z"
                    fill="#EA4335"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_17_40">
                    <rect width="48" height="48" fill="white" />
                  </clipPath>
                </defs>
              </svg> */}
              <IconBrandGoogle size={24} />
            </Button>
            <Button
              variant="outline"
              aria-label="Sign in with Discord"
              onClick={() => signInWithProvider("discord")}
              className="flex items-center justify-center rounded-lg border py-5 duration-150 cursor-pointer"
            >
              {/* <svg
                className="h-5 w-5"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15.095 43.5014C33.2083 43.5014 43.1155 28.4946 43.1155 15.4809C43.1155 15.0546 43.1155 14.6303 43.0867 14.2079C45.0141 12.8138 46.6778 11.0877 48 9.11033C46.2028 9.90713 44.2961 10.4294 42.3437 10.6598C44.3996 9.42915 45.9383 7.49333 46.6733 5.21273C44.7402 6.35994 42.6253 7.16838 40.4198 7.60313C38.935 6.02428 36.9712 4.97881 34.8324 4.6285C32.6935 4.27818 30.4988 4.64256 28.5879 5.66523C26.677 6.68791 25.1564 8.31187 24.2615 10.2858C23.3665 12.2598 23.1471 14.4737 23.6371 16.5849C19.7218 16.3885 15.8915 15.371 12.3949 13.5983C8.89831 11.8257 5.81353 9.33765 3.3408 6.29561C2.08146 8.4636 1.69574 11.0301 2.2622 13.4725C2.82865 15.9148 4.30468 18.0495 6.38976 19.4418C4.82246 19.3959 3.2893 18.9731 1.92 18.2092V18.334C1.92062 20.6077 2.7077 22.8112 4.14774 24.5707C5.58778 26.3303 7.59212 27.5375 9.8208 27.9878C8.37096 28.3832 6.84975 28.441 5.37408 28.1567C6.00363 30.1134 7.22886 31.8244 8.87848 33.0506C10.5281 34.2768 12.5197 34.9569 14.5747 34.9958C12.5329 36.6007 10.1946 37.7873 7.69375 38.4878C5.19287 39.1882 2.57843 39.3886 0 39.0777C4.50367 41.9677 9.74385 43.5007 15.095 43.4937"
                  fill="#1DA1F2"
                />
              </svg> */}
              <IconBrandDiscord size={24} />
            </Button>
            <Button
              variant="outline"
              aria-label="Sign in with GitHub"
              onClick={() => signInWithProvider("github")}
              className="flex items-center justify-center rounded-lg border py-5 duration-150 cursor-pointer"
            >
              <IconBrandGithub size={24} />
            </Button>
          </div>
          <div className="relative">
            <span className="bg-secondary block h-px w-full"></span>
            <p className="absolute inset-x-0 -top-2 mx-auto inline-block w-fit px-2 text-sm">
              Or continue with
            </p>
          </div>
          {/* OnSubmit declare yourself */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="email-input" className="font-medium">
                Email
              </Label>
              <Input
                id="email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-2 w-full rounded-lg border bg-transparent px-3 py-5 shadow-sm outline-none focus:border-primary"
              />
            </div>
            <div className="relative">
              <Label htmlFor="pass-input" className="font-medium">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="pass-input"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-2 w-full rounded-lg border bg-transparent px-3 py-5 shadow-sm outline-none focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 mt-2 mr-3 flex items-center"
                >
                  {showPassword ? (
                    <IconEyeOff size={20} className="text-secondary" />
                  ) : (
                    <IconEye size={20} className="text-secondary" />
                  )}
                </button>
              </div>
            </div>
            <Button className="w-full rounded-lg px-4 py-5 font-medium  duration-150">
              {signUp ? "SignUp" : "SignIn"}
            </Button>
          </form>
        </div>
        <div className="text-center">
          <Link href="#" className="text-primary hover:text-primary/90">
            Forgot password?
          </Link>
        </div>
      </div>
    </main>
  );
}
