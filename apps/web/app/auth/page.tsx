"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { IconBrandDiscord, IconBrandGithub } from "@tabler/icons-react";
import Image from "next/image";
import Input51 from "@/components/input51";
import { useAuthStore } from "@/store/use-auth-store";

export default function AuthPage() {
  const router = useRouter();

  const {
    isAuthenticated,
    loading,
    signInWithProvider,
    signUpWithEmail,
    error,
  } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState<string>("");
  const [isSubmiting, setIsSubmiting] = useState(false);
  const [signUp, setSignUp] = useState(false);

  useEffect(() => {
    const isAuth = isAuthenticated();
    if (isAuth) {
      router.push("/create");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmiting(true);

    signUpWithEmail(email, password);
    setIsSubmiting(false);
    if (error) {
      console.error("Error signing-in: ", error);
      return;
    }
    router.push("/");
  };

  return (
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
                <Button
                  variant="link"
                  onClick={() => setSignUp(!signUp)}
                  className="font-medium text-primary hover:text-primary/90"
                >
                  Login
                </Button>
              </p>
            ) : (
              <p className="">
                Don&apos;t have an account?{" "}
                <Button
                  variant="link"
                  onClick={() => setSignUp(!signUp)}
                  className="font-medium text-primary hover:text-primary/90"
                >
                  Sign up
                </Button>
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
              <svg
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
              </svg>
            </Button>
            <Button
              variant="outline"
              aria-label="Sign in with Discord"
              onClick={() => signInWithProvider("discord")}
              className="flex items-center justify-center rounded-lg border py-5 duration-150 cursor-pointer"
            >
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
            <p className="absolute inset-x-0 -top-2 mx-auto inline-block w-fit px-2 text-sm bg-background">
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
                placeholder="johndoe@example.com"
                className="mt-2 w-full rounded-lg border bg-transparent px-3 py-5 shadow-sm outline-none focus:border-secondary"
              />
            </div>
            <div className="relative">
              {/* Password Input with strength */}
              <Input51 value={password} onChange={setPassword} />
            </div>
            {error && <p className="text-red-500">{error}</p>}
            <Button
              disabled={isSubmiting}
              className="w-full rounded-lg px-4 py-5 font-medium  duration-150"
            >
              {isSubmiting ? "Submitting..." : "Submit"}
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
