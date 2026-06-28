"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AdminField } from "@/components/admin/AdminField";
import { AdminAlert } from "@/components/admin/AdminAlert";
import { PortalPageContent } from "@/components/portal/PortalPageContent";
import { PortalPageHeader } from "@/components/portal/PortalPageHeader";
import { PortalCard } from "@/components/portal/PortalCard";
import { Button } from "@/components/ui/Button";

type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
};

type Client = {
  id: string;
  name: string;
  company: string | null;
};

export default function PortalAccountPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [message, setMessage] = useState<{ tone: "success" | "error" | "info"; text: string } | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/portal/account", { credentials: "same-origin" });
    if (res.ok) {
      const data = await res.json();
      setProfile(data.profile);
      setClient(data.client);
      setFullName(data.profile.full_name ?? "");
      setEmail(data.profile.email ?? "");
      setPhone(data.profile.phone ?? "");
      setCompany(data.client?.company ?? "");
      setAvatarUrl(data.profile.avatar_url ?? "");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const res = await fetch("/api/portal/account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        full_name: fullName,
        email,
        phone,
        avatar_url: avatarUrl,
        company,
      }),
    });

    setSaving(false);
    const data = await res.json().catch(() => ({}));

    if (res.ok) {
      setProfile(data.profile);
      setMessage({
        tone: data.emailConfirmationRequired ? "info" : "success",
        text: data.emailConfirmationRequired
          ? "Profile saved. Check your inbox to confirm your new email address."
          : "Profile updated successfully.",
      });
      return;
    }

    setMessage({ tone: "error", text: data.error ?? "Failed to save profile" });
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordSaving(true);
    setMessage(null);

    const res = await fetch("/api/portal/account/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ password: currentPassword, newPassword }),
    });

    setPasswordSaving(false);
    const data = await res.json().catch(() => ({}));

    if (res.ok) {
      setCurrentPassword("");
      setNewPassword("");
      setMessage({ tone: "success", text: "Password updated successfully." });
      return;
    }

    setMessage({ tone: "error", text: data.error ?? "Failed to update password" });
  }

  return (
    <PortalPageContent>
      <PortalPageHeader
        title="Account settings"
        subtitle="Manage your profile, contact details, and portal security."
      />

      {message && (
        <AdminAlert tone={message.tone} className="mb-6">
          {message.text}
        </AdminAlert>
      )}

      {loading ? (
        <p className="text-white/50">Loading account…</p>
      ) : (
        <div className="mx-auto max-w-3xl space-y-6">
          <PortalCard padding="lg">
            <h2 className="text-lg font-semibold text-white">Profile</h2>
            <form onSubmit={saveProfile} className="mt-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                  {avatarUrl ? (
                    <Image src={avatarUrl} alt="" fill className="object-cover" unoptimized />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xl text-white/30">
                      {(fullName || email || "?")[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
              <AdminField
                label="Avatar URL"
                type="url"
                value={avatarUrl}
                onChange={setAvatarUrl}
                hint="Optional image link for your profile photo."
              />
              </div>
              <AdminField label="Full name" value={fullName} onChange={setFullName} />
              <AdminField label="Email" type="email" value={email} onChange={setEmail} />
              <AdminField label="Phone" value={phone} onChange={setPhone} />
              {client && (
                <AdminField label="Company" value={company} onChange={setCompany} />
              )}
              <Button type="submit" size="sm" disabled={saving}>
                {saving ? "Saving…" : "Save profile"}
              </Button>
            </form>
          </PortalCard>

          <PortalCard padding="lg">
            <h2 className="text-lg font-semibold text-white">Security</h2>
            <form onSubmit={savePassword} className="mt-6 space-y-4">
              <AdminField
                label="Current password"
                type="password"
                value={currentPassword}
                onChange={setCurrentPassword}
              />
              <AdminField
                label="New password"
                type="password"
                value={newPassword}
                onChange={setNewPassword}
              />
              <Button type="submit" size="sm" disabled={passwordSaving}>
                {passwordSaving ? "Updating…" : "Update password"}
              </Button>
            </form>
          </PortalCard>

          <p className="text-sm text-white/40">
            Need help?{" "}
            <Link href="/portal/messages" className="text-[#a3c9a8] hover:underline">
              Send a message
            </Link>{" "}
            or visit the{" "}
            <Link href="/contact" className="text-[#a3c9a8] hover:underline">
              contact page
            </Link>
            .
          </p>
        </div>
      )}
    </PortalPageContent>
  );
}
