/** Staff / Lead Creator workspace emails must use this domain. */
export const CREATOR_EMAIL_DOMAIN = "deanversedigital.com";

export type AuthWorkspaceVariant = "client" | "creators";

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isCreatorEmail(email: string): boolean {
  return normalizeEmail(email).endsWith(`@${CREATOR_EMAIL_DOMAIN}`);
}

export function creatorEmailError(): string {
  return `Development Workspace is limited to @${CREATOR_EMAIL_DOMAIN} accounts. Use Client Workspace if you are a client.`;
}

export function clientEmailHintForCreator(): string {
  return `This looks like a studio account. Sign in through Development Workspace instead.`;
}
