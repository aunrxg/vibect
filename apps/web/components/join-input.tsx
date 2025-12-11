"use client";

import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "./ui/input-otp";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import Link from "next/link";
import {
  IconBrandDiscord,
  IconBrandGithub,
  IconBrandGoogle,
} from "@tabler/icons-react";

export default function JoinInput() {
  return (
    <Card className="flex flex-col items-center justify-center p-6 rounded-lg border shadow-xl mx-auto max-w-md">
      <CardHeader className="w-full text-center">
        <CardTitle>Join a Music Space</CardTitle>
        <CardDescription>Enter a room code to join a room</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-8">
        <InputOTP
          maxLength={8}
          pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
          autoFocus
          autoComplete="one-time-code"
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
            <InputOTPSlot index={6} />
            <InputOTPSlot index={7} />
          </InputOTPGroup>
        </InputOTP>

        <Button className="cursor-pointer">Join Room</Button>
      </CardContent>

      <Separator />

      <CardFooter className="flex h-5 items-center space-x-4 text-xs">
        {/* When not logged in */}
        <Link
          href="#"
          className="flex items-center gap-2 transition-colors hover:text-primary"
        >
          <IconBrandGoogle className="size-5!" />
          Google
        </Link>
        <Separator orientation="vertical" />
        <Link
          href="#"
          className="flex items-center gap-2 transition-colors hover:text-primary"
        >
          <IconBrandGithub className="size-5!" />
          GitHub
        </Link>
        <Separator orientation="vertical" />
        <Link
          href="#"
          className="flex items-center gap-2 transition-colors hover:text-primary"
        >
          <IconBrandDiscord className="size-5!" />
          Discord
        </Link>
      </CardFooter>
    </Card>
  );
}
