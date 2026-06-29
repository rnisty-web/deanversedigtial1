"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminAlert } from "@/components/admin/AdminAlert";
import { AdminField } from "@/components/admin/AdminField";
import { PortalAccountSidebar } from "@/components/portal/PortalAccountSidebar";
import { PortalPageContent } from "@/components/portal/PortalPageContent";
import { PortalPageHeader } from "@/components/portal/PortalPageHeader";
import { PortalSectionCard } from "@/components/portal/PortalCard";
import { Button } from "@/components/ui/Button";

type Client = {
  id: string;
  name: string;
  company: string | null;
};

type Profile = {
  full_name: string | null;
  email: string;
  avatar_url: string | null;
};

export default function PortalAccountPage() {
  const [client, setClient] = useState<Client | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [activeSection, setActiveSection] = useState("profile");
  const [message, setMessage] = useState<{ tone: "success" | "error" | "info"; text: string } | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const sections = useMemo(
    () => [
      { id: "profile", label: "Profile" },
      { id: "security", label: "Security" },
    ],
    [],
  );

  const scrollToSection = useCallback((id: string) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/portal/account", { credentials: "same-origin" });
    if (res.ok) {
      const data = await res.json();
      setClient(data.client);
      setProfile(data.profile);
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
        breadcrumb={[
          { label: "Dashboard", href: "/portal" },
          { label: "Account" },
        ]}
        tabs={sections.map((s) => ({ id: s.id, label: s.label }))}
        activeTab={activeSection}
        onTabChange={scrollToSection}
      />

      {message && (
        <AdminAlert tone={message.tone} className="mb-6">
          {message.text}
        </AdminAlert>
      )}

      {loading ? (
        <div className="portal-account-layout">
          <div className="portal-account-stack">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="admin-luxury-card h-56 animate-pulse" />
            ))}
          </div>
          <div className="portal-account-sidebar">
            <div className="admin-luxury-card h-96 animate-pulse" />
          </div>
        </div>
      ) : profile ? (
        <div className="portal-account-layout">
          <div className="portal-account-stack">
            <PortalSectionCard id="profile">
              <h2 className="text-lg font-semibold text-[var(--admin-text)]">Profile</h2>
              <p className="mt-1 text-sm text-[var(--admin-text-muted)]">
                Update your name, contact details, and avatar shown in the portal.
              </p>
              <form onSubmit={saveProfile} className="mt-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-[var(--admin-border-subtle)] bg-[var(--admin-panel)]">
                    {avatarUrl ? (
                      <Image src={avatarUrl} alt="" fill className="object-cover" unoptimized />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xl text-[var(--admin-gold-light)]">
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
                {client ? <AdminField label="Company" value={company} onChange={setCompany} /> : null}
                <div className="flex justify-end pt-2">
                  <Button type="submit" size="sm" className="admin-btn-gold" disabled={saving}>
                    {saving ? "Saving…" : "Save profile"}
                  </Button>
                </div>
              </form>
            </PortalSectionCard>

            <PortalSectionCard id="security">
              <h2 className="text-lg font-semibold text-[var(--admin-text)]">Security</h2>
              <p className="mt-1 text-sm text-[var(--admin-text-muted)]">
                Change your password or use the{" "}
                <Link href="/forgot-password" className="text-[var(--admin-gold-light)] hover:underline">
                  forgot password
                </Link>{" "}
                flow if you are signed out.
              </p>
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
                  hint="At least 8 characters"
                />
                <div className="flex justify-end pt-2">
                  <Button type="submit" size="sm" className="admin-btn-gold" disabled={passwordSaving}>
                    {passwordSaving ? "Updating…" : "Update password"}
                  </Button>
                </div>
              </form>
            </PortalSectionCard>

            <p className="text-sm text-[var(--admin-text-muted)]">
              Need help?{" "}
              <Link href="/portal/messages" className="text-[var(--admin-gold-light)] hover:underline">
                Send a message
              </Link>{" "}
              or visit the{" "}
              <Link href="/contact" className="text-[var(--admin-gold-light)] hover:underline">
                contact page
              </Link>
              .
            </p>
          </div>

          <PortalAccountSidebar
            profile={profile}
            client={client}
            sections={sections}
            activeSection={activeSection}
            onSectionClick={scrollToSection}
          />
        </div>
      ) : null}
    </PortalPageContent>
  );
}
