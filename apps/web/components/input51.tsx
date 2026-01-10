"use client";

import { useMemo, useState } from "react";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface Input51Props {
  value: string;
  onChange: (value: string) => void;
}

export default function Input51({ value, onChange }: Input51Props) {
  // const [password, setPassword] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  const requirements = useMemo(
    () => [
      { regex: /.{8,}/, text: "At least 8 characters" },
      { regex: /[0-9]/, text: "At least 1 number" },
      { regex: /[a-z]/, text: "At least 1 lowercase letter" },
      { regex: /[A-Z]/, text: "At least 1 uppercase letter" },
    ],
    [],
  );

  const strength = useMemo(
    () =>
      requirements.map((req) => ({
        met: req.regex.test(value),
        text: req.text,
      })),
    [value, requirements],
  );

  const strengthScore = useMemo(
    () => strength.filter((req) => req.met).length,
    [strength],
  );

  const strengthColor = useMemo(() => {
    if (strengthScore === 0) return "bg-border";
    if (strengthScore <= 1) return "bg-red-500";
    if (strengthScore <= 2) return "bg-orange-500";
    if (strengthScore === 3) return "bg-amber-500";
    return "bg-emerald-500";
  }, [strengthScore]);

  const strengthText = useMemo(() => {
    if (strengthScore === 0) return "Enter a password";
    if (strengthScore <= 2) return "Weak password";
    if (strengthScore === 3) return "Medium password";
    return "Strong password";
  }, [strengthScore]);

  return (
    <div>
      {/* Password input */}
      <div className="space-y-2">
        <Label htmlFor="input-51" className="font-medium">
          Password
        </Label>

        <div className="relative">
          <Input
            id="input-51"
            type={isVisible ? "text" : "password"}
            required
            value={value}
            onChange={(e) => onChange(e.target.value)}
            aria-invalid={strengthScore < 4}
            aria-describedby="password-description"
            placeholder="********"
            className="mt-2 w-full rounded-lg border bg-transparent px-3 py-5 shadow-sm outline-none focus:border-primary"
          />

          <button
            type="button"
            onClick={() => setIsVisible(!isVisible)}
            aria-label={isVisible ? "Hide password" : "Show password"}
            className="absolute inset-y-0 right-0 mt-2 mr-3 flex items-center"
          >
            {isVisible ? (
              <EyeOff size={20} className="text-secondary" />
            ) : (
              <Eye size={20} className="text-secondary" />
            )}
          </button>
        </div>
      </div>

      {/* Strength bar */}
      <div
        className="bg-border mb-4 mt-3 h-1 w-full overflow-hidden rounded-full"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={4}
        aria-valuenow={strengthScore}
        aria-label="Password strength"
      >
        <div
          className={`h-full transition-all duration-500 ease-out ${strengthColor}`}
          style={{ width: `${(strengthScore / 4) * 100}%` }}
        />
      </div>

      {/* Strength description */}
      <p className="mb-2 text-sm font-medium" id="password-description">
        {strengthText}. Must contain:
      </p>

      {/* Requirements */}
      <ul className="space-y-1.5" aria-label="Password requirements">
        {strength.map((req, index) => (
          <li key={index} className="flex items-center gap-2">
            {req.met ? (
              <Check className="text-emerald-500" size={16} />
            ) : (
              <X className="text-muted-foreground/80" size={16} />
            )}
            <span
              className={`text-xs ${
                req.met ? "text-emerald-500" : "text-muted-foreground/80"
              }`}
            >
              {req.text}
            </span>
            <span className="sr-only">
              {req.met ? "- Requirement met" : "- Requirement not met"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
