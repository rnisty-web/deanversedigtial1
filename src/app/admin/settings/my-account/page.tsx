"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminField } from "@/components/admin/AdminField";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminPageContent } from "@/components/admin/AdminPageContent";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { Button } from "@/components/ui/Button";

import { ActivityStatusPicker, useActivityStatus } from "@/components/admin/ActivityStatusPicker";
import { type UserRole } from "@/lib/roles";

type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  role: UserRole;
};

function Alert({
  tone,
  children,
}: {
  tone: "error" | "success" | "info";
  children: React.ReactNode;
}) {
  const styles = {
    error: "border-red-500/30 bg-red-500/10 text-red-300",
    success: "border-[#6f8f72]/30 bg-[var(--admin-gold-soft)] text-[var(--admin-gold-light)]",
    info: "border-amber-500/30 bg-amber-500/10 text-amber-100",
  };

  return (
    <div className={`rounded-lg border px-4 py-3 text-sm ${styles[tone]}`}>{children}</div>
  );
}

export default function MyAccountPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);
  const [emailMessage, setEmailMessage] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const {
    status: activityStatus,
    canEdit: canEditActivity,
    saving: savingActivity,
    save: saveActivity,
  } = useActivityStatus();

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);

    const res = await fetch("/api/admin/account");
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to load account");
      setLoading(false);
      return;
    }

    const data = await res.json();
    const nextProfile = data.profile as Profile;
    setProfile(nextProfile);
    setFullName(nextProfile.full_name ?? "");
    setPhone(nextProfile.phone ?? "");
    setAvatarUrl(nextProfile.avatar_url ?? "");
    setEmail(nextProfile.email ?? "");
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMessage(null);
    setProfileError(null);

    const res = await fetch("/api/admin/account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: fullName,
        phone,
        avatar_url: avatarUrl,
      }),
    });

    setSavingProfile(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setProfileError(data.error ?? "Failed to update profile");
      return;
    }

    const data = await res.json();
    setProfile(data.profile);
    setProfileMessage("Profile updated successfully");
  }

  async function handleSaveEmail(e: React.FormEvent) {
    e.preventDefault();
    setSavingEmail(true);
    setEmailMessage(null);
    setEmailError(null);

    const res = await fetch("/api/admin/account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    setSavingEmail(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setEmailError(data.error ?? "Failed to update email");
      return;
    }

    const data = await res.json();
    setProfile(data.profile);

    if (data.emailConfirmationRequired) {
      setEmailMessage(
        "Confirmation email sent. Check your inbox to verify the new address. Your login email stays the same until you confirm.",
      );
    } else {
      setEmailMessage("Email updated successfully");
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordMessage(null);
    setPasswordError(null);

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters");
      return;
    }

    setSavingPassword(true);

    const res = await fetch("/api/admin/account/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    });

    setSavingPassword(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setPasswordError(data.error ?? "Failed to update password");
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordMessage("Password updated successfully");
  }

  return (
    <>
      <AdminHeader
        title="My Account"
        subtitle="Manage your admin profile, email, and password"
      />

      <AdminPageContent>
        <div className="mx-auto max-w-3xl">
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm">
          <Link href="/admin/settings" className="text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]">
            Settings
          </Link>
          <span className="text-[var(--admin-text-muted)]">/</span>
          <span className="text-[var(--admin-gold-light)]">My Account</span>
        </nav>

        {error && (
          <div className="mb-6">
            <Alert tone="error">{error}</Alert>
          </div>
        )}

        {loading ? (
          <p className="text-[var(--admin-text-muted)]">Loading account…</p>
        ) : profile ? (
          <div className="space-y-6">
            <AdminCard padding="lg">
              <h2 className="text-lg font-semibold text-[var(--admin-text)]">Profile</h2>
              <p className="mt-1 text-sm text-[var(--admin-text-muted)]">
                Update your name, phone number, and avatar shown across the admin portal.
              </p>

              {profileMessage && (
                <div className="mt-4">
                  <Alert tone="success">{profileMessage}</Alert>
                </div>
              )}
              {profileError && (
                <div className="mt-4">
                  <Alert tone="error">{profileError}</Alert>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="mt-6 space-y-4">
                <AdminField
                  label="Full name"
                  value={fullName}
                  onChange={setFullName}
                  placeholder="Your name"
                />
                <AdminField
                  label="Phone number"
                  type="tel"
                  value={phone}
                  onChange={setPhone}
                  placeholder="+1 (555) 000-0000"
                />
                <MediaPicker
                  label="Avatar URL"
                  value={avatarUrl}
                  onChange={setAvatarUrl}
                  hint="Paste a URL or upload an image from the media library."
                />
                <div className="flex justify-end pt-2">
                  <Button type="submit" size="sm" className="admin-btn-gold" disabled={savingProfile}>
                    {savingProfile ? "Saving…" : "Save profile"}
                  </Button>
                </div>
              </form>
            </AdminCard>

            {canEditActivity && (
              <AdminCard padding="lg">
                <h2 className="text-lg font-semibold text-[var(--admin-text)]">Activity status</h2>
                <p className="mt-1 text-sm text-[var(--admin-text-muted)]">
                  Let your team and customers know what you are working on. This is separate from
                  your online/offline presence indicator.
                </p>
                <div className="mt-6 max-w-sm">
                  <label className="mb-1.5 block text-sm font-medium text-[var(--admin-text-muted)]">
                    Current status
                  </label>
                  <ActivityStatusPicker
                    value={activityStatus}
                    onChange={saveActivity}
                    disabled={savingActivity}
                  />
                </div>
              </AdminCard>
            )}

            <AdminCard padding="lg">
              <h2 className="text-lg font-semibold text-[var(--admin-text)]">Email address</h2>
              <p className="mt-1 text-sm text-[var(--admin-text-muted)]">
                Changing your email may require confirmation before it takes effect.
              </p>

              {emailMessage && (
                <div className="mt-4">
                  <Alert tone={emailMessage.includes("Confirmation") ? "info" : "success"}>
                    {emailMessage}
                  </Alert>
                </div>
              )}
              {emailError && (
                <div className="mt-4">
                  <Alert tone="error">{emailError}</Alert>
                </div>
              )}

              <form onSubmit={handleSaveEmail} className="mt-6 space-y-4">
                <AdminField
                  label="Email"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  placeholder="you@example.com"
                />
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <p className="text-xs text-[var(--admin-text-muted)]">
                    Signed in as {profile.email}
                  </p>
                  <Button type="submit" size="sm" className="admin-btn-gold" disabled={savingEmail}>
                    {savingEmail ? "Saving…" : "Update email"}
                  </Button>
                </div>
              </form>
            </AdminCard>

            <AdminCard padding="lg">
              <h2 className="text-lg font-semibold text-[var(--admin-text)]">Password</h2>
              <p className="mt-1 text-sm text-[var(--admin-text-muted)]">
                Enter your current password to set a new one. You can also use the{" "}
                <Link href="/forgot-password" className="text-[var(--admin-gold-light)] hover:underline">
                  forgot password
                </Link>{" "}
                flow if you are signed out.
              </p>

              {passwordMessage && (
                <div className="mt-4">
                  <Alert tone="success">{passwordMessage}</Alert>
                </div>
              )}
              {passwordError && (
                <div className="mt-4">
                  <Alert tone="error">{passwordError}</Alert>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="mt-6 space-y-4">
                <AdminField
                  label="Current password"
                  type="password"
                  value={currentPassword}
                  onChange={setCurrentPassword}
                  placeholder="••••••••"
                />
                <AdminField
                  label="New password"
                  type="password"
                  value={newPassword}
                  onChange={setNewPassword}
                  hint="At least 8 characters"
                  placeholder="••••••••"
                />
                <AdminField
                  label="Confirm new password"
                  type="password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  placeholder="••••••••"
                />
                <div className="flex justify-end pt-2">
                  <Button type="submit" size="sm" className="admin-btn-gold" disabled={savingPassword}>
                    {savingPassword ? "Updating…" : "Update password"}
                  </Button>
                </div>
              </form>
            </AdminCard>
          </div>
        ) : null}
        </div>
      </AdminPageContent>
    </>
  );
}
