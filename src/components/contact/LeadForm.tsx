"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { budgetRanges, projectTypes } from "@/lib/data/fallbacks";
import { cn } from "@/lib/utils";
import { isTurnstileEnabled, TurnstileField } from "@/components/contact/TurnstileField";

const inputStyles =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 transition-colors focus:border-[#a3c9a8]/50 focus:outline-none focus:ring-2 focus:ring-[#a3c9a8]/20";

export function LeadForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedService = searchParams.get("service") ?? "";
  const preselectedValue = projectTypes.includes(
    preselectedService as (typeof projectTypes)[number],
  )
    ? preselectedService
    : preselectedService
      ? preselectedService
      : "";

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileRequired = isTurnstileEnabled();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    const formData = new FormData(event.currentTarget);

    if (turnstileRequired && !turnstileToken) {
      setStatus("error");
      setErrorMessage("Please complete the security check before submitting.");
      return;
    }

    const payload = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      company: formData.get("company") as string,
      budget: formData.get("budget") as string,
      project_type: formData.get("project_type") as string,
      service_interest: formData.get("project_type") as string,
      message: formData.get("description") as string,
      website: formData.get("website") as string,
      turnstile_token: turnstileToken || undefined,
    };

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Something went wrong. Please try again.");
      }

      router.push("/thank-you?source=contact");
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Something went wrong. Please try again.",
      );
    }
  }

  if (status === "success") {
    return null;
  }

  return (
    <GlassCard hover={false} padding="lg">
      <form onSubmit={handleSubmit} className="relative space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-medium text-white/80">
              Name <span className="text-[#a3c9a8]">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              autoComplete="name"
              className={inputStyles}
              placeholder="Your full name"
            />
          </div>
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-white/80">
              Email <span className="text-[#a3c9a8]">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className={inputStyles}
              placeholder="you@company.com"
            />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="phone" className="mb-2 block text-sm font-medium text-white/80">
              Phone
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              className={inputStyles}
              placeholder="(555) 555-5555"
            />
          </div>
          <div>
            <label htmlFor="company" className="mb-2 block text-sm font-medium text-white/80">
              Business Name
            </label>
            <input
              id="company"
              name="company"
              type="text"
              autoComplete="organization"
              className={inputStyles}
              placeholder="Your business or brand"
            />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="budget" className="mb-2 block text-sm font-medium text-white/80">
              Budget
            </label>
            <select
              id="budget"
              name="budget"
              className={cn(inputStyles, "appearance-none")}
              defaultValue=""
            >
              <option value="" disabled className="bg-[#0f1a17]">
                Select a range
              </option>
              {budgetRanges.map((range) => (
                <option key={range} value={range} className="bg-[#0f1a17]">
                  {range}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="project_type" className="mb-2 block text-sm font-medium text-white/80">
              Project Type
            </label>
            <select
              id="project_type"
              name="project_type"
              className={cn(inputStyles, "appearance-none")}
              defaultValue={preselectedValue || ""}
            >
              <option value="" disabled className="bg-[#0f1a17]">
                Select a type
              </option>
              {preselectedService &&
                !projectTypes.includes(preselectedService as (typeof projectTypes)[number]) && (
                  <option value={preselectedService} className="bg-[#0f1a17]">
                    {preselectedService}
                  </option>
                )}
              {projectTypes.map((type) => (
                <option key={type} value={type} className="bg-[#0f1a17]">
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="description" className="mb-2 block text-sm font-medium text-white/80">
            Project Description <span className="text-[#a3c9a8]">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            required
            rows={5}
            className={cn(inputStyles, "resize-y")}
            placeholder="Tell me about your project, goals, and timeline..."
          />
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-[9999px] h-0 w-0 overflow-hidden opacity-0"
        >
          <label htmlFor="website">Website</label>
          <input
            id="website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        {turnstileRequired && (
          <TurnstileField
            onToken={setTurnstileToken}
            onExpire={() => setTurnstileToken("")}
            onError={() => setTurnstileToken("")}
          />
        )}

        {status === "error" && (
          <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {errorMessage}
          </p>
        )}

        <p className="text-xs leading-relaxed text-white/45">
          By submitting this form, you agree to our{" "}
          <Link href="/privacy" className="text-[#a3c9a8] hover:text-[#6f8f72]">
            Privacy Policy
          </Link>{" "}
          and{" "}
          <Link href="/terms" className="text-[#a3c9a8] hover:text-[#6f8f72]">
            Terms of Service
          </Link>
          . We&apos;ll use your details only to respond to your inquiry.
        </p>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          disabled={status === "loading"}
        >
          {status === "loading" ? "Sending..." : "Send Message"}
        </Button>
      </form>
    </GlassCard>
  );
}
