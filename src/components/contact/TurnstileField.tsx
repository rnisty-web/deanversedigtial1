"use client";

import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { useRef } from "react";

type TurnstileFieldProps = {
  onToken: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
};

export function TurnstileField({ onToken, onExpire, onError }: TurnstileFieldProps) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();
  const turnstileRef = useRef<TurnstileInstance>(null);

  if (!siteKey) return null;

  return (
    <div className="flex justify-center">
      <Turnstile
        ref={turnstileRef}
        siteKey={siteKey}
        onSuccess={onToken}
        onExpire={() => {
          turnstileRef.current?.reset();
          onExpire?.();
        }}
        onError={() => {
          turnstileRef.current?.reset();
          onError?.();
        }}
        options={{
          theme: "dark",
          size: "flexible",
        }}
      />
    </div>
  );
}

export function isTurnstileEnabled(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim());
}
