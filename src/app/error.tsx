"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0f1a17] px-4 text-center">
      <p className="text-sm font-medium uppercase tracking-wider text-red-300">Something went wrong</p>
      <h1 className="mt-2 text-3xl font-semibold text-white">Unexpected error</h1>
      <p className="mt-3 max-w-md text-sm text-white/60">
        We hit a snag loading this page. Please try again.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button href="/" variant="secondary">
          Back to home
        </Button>
      </div>
    </div>
  );
}
