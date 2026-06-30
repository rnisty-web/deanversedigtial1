"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

type MessageComposerProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  sending?: boolean;
  error?: string | null;
  placeholder?: string;
  disabled?: boolean;
  variant?: "admin" | "portal";
};

export function MessageComposer({
  value,
  onChange,
  onSubmit,
  sending = false,
  error,
  placeholder = "Message",
  disabled = false,
  variant = "admin",
}: MessageComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function resizeField() {
    const field = textareaRef.current;
    if (!field) return;
    field.style.height = "auto";
    field.style.height = `${Math.min(field.scrollHeight, 132)}px`;
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!value.trim() || sending || disabled) return;
      onSubmit(e as unknown as React.FormEvent);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className={cn("dm-composer", variant === "portal" && "dm-composer-portal")}
    >
      <div className="dm-composer-shell">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            resizeField();
          }}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder={placeholder}
          disabled={disabled || sending}
          className="dm-composer-input"
          aria-label="Message"
        />
        <button
          type="submit"
          className="dm-composer-send"
          disabled={disabled || sending || !value.trim()}
          aria-label={sending ? "Sending message" : "Send message"}
        >
          {sending ? (
            <span className="dm-composer-spinner" aria-hidden />
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M3.4 20.4 21 12 3.4 3.6l-.9 7.2 9.6 1.2-9.6 1.2.9 7.2z" />
            </svg>
          )}
        </button>
      </div>
      <p className="dm-composer-hint">Press Enter to send · Shift+Enter for a new line</p>
      {error ? <p className="dm-composer-error">{error}</p> : null}
    </form>
  );
}
