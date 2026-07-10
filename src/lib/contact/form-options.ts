import type { ContactPageSettings } from "@/lib/cms/types";
import { budgetRanges as defaultBudgetRanges, projectTypes as defaultProjectTypes } from "@/lib/data/fallbacks";

export type ContactFormOptions = {
  budgetRanges: string[];
  projectTypes: string[];
};

function cleanOptionList(items: string[] | undefined, fallback: readonly string[]): string[] {
  const cleaned = (items ?? [])
    .map((item) => item.trim())
    .filter(Boolean);
  return cleaned.length > 0 ? cleaned : [...fallback];
}

export function resolveContactFormOptions(
  contact: Pick<ContactPageSettings, "budgetRanges" | "projectTypes">,
): ContactFormOptions {
  return {
    budgetRanges: cleanOptionList(contact.budgetRanges, defaultBudgetRanges),
    projectTypes: cleanOptionList(contact.projectTypes, defaultProjectTypes),
  };
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidContactEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email);
}

export function isValidContactPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15;
}

export function isAllowedContactChoice(value: string, allowed: string[]): boolean {
  const trimmed = value.trim();
  return trimmed.length > 0 && allowed.includes(trimmed);
}

export type ContactSubmissionInput = {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  company?: unknown;
  message?: unknown;
  budget?: unknown;
  project_type?: unknown;
  service_interest?: unknown;
};

export type ContactValidationResult =
  | {
      ok: true;
      data: {
        name: string;
        email: string;
        phone: string | null;
        company: string | null;
        message: string;
        budget: string;
        project_type: string;
        service_interest: string;
      };
    }
  | { ok: false; error: string };

export function validateContactSubmission(
  input: ContactSubmissionInput,
  options: ContactFormOptions,
): ContactValidationResult {
  if (typeof input.name !== "string" || typeof input.email !== "string") {
    return { ok: false, error: "Invalid submission" };
  }

  const name = input.name.trim().slice(0, 120);
  const email = input.email.trim().slice(0, 254).toLowerCase();

  if (name.length < 2) {
    return { ok: false, error: "Please enter your full name" };
  }

  if (!email || !isValidContactEmail(email)) {
    return { ok: false, error: "Please provide a valid email address" };
  }

  const phoneRaw = typeof input.phone === "string" ? input.phone.trim().slice(0, 40) : "";
  if (phoneRaw && !isValidContactPhone(phoneRaw)) {
    return { ok: false, error: "Please provide a valid phone number" };
  }

  const company =
    typeof input.company === "string" && input.company.trim()
      ? input.company.trim().slice(0, 120)
      : null;

  const message =
    typeof input.message === "string" ? input.message.trim().slice(0, 5000) : "";

  if (message.length < 10) {
    return { ok: false, error: "Please describe your project in at least 10 characters" };
  }

  const budget = typeof input.budget === "string" ? input.budget.trim() : "";
  if (!isAllowedContactChoice(budget, options.budgetRanges)) {
    return { ok: false, error: "Please select a valid budget range" };
  }

  const projectType =
    typeof input.project_type === "string"
      ? input.project_type.trim()
      : typeof input.service_interest === "string"
        ? input.service_interest.trim()
        : "";

  if (!isAllowedContactChoice(projectType, options.projectTypes)) {
    return { ok: false, error: "Please select a valid project type" };
  }

  return {
    ok: true,
    data: {
      name,
      email,
      phone: phoneRaw || null,
      company,
      message,
      budget,
      project_type: projectType,
      service_interest: projectType,
    },
  };
}
