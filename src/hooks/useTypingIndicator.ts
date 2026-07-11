"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const TYPING_IDLE_MS = 2000;
// Re-broadcast while typing continues, often enough to beat the receiver's stale timeout.
const TYPING_THROTTLE_MS = 1200;
const TYPING_STALE_MS = 2800;

type TypingPayload = {
  userId: string;
  isTyping: boolean;
};

export function useTypingIndicator(
  conversationKey: string | null,
  userId: string | null,
  counterpartName?: string,
) {
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>["channel"]> | null>(null);
  const typingIdleRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSentRef = useRef(0);
  const staleRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const broadcastTyping = useCallback((isTyping: boolean) => {
    const channel = channelRef.current;
    if (!channel || !userId) return;

    void channel.send({
      type: "broadcast",
      event: "typing",
      payload: { userId, isTyping } satisfies TypingPayload,
    });
  }, [userId]);

  const stopTyping = useCallback(() => {
    if (typingIdleRef.current) clearTimeout(typingIdleRef.current);
    lastSentRef.current = 0;
    broadcastTyping(false);
  }, [broadcastTyping]);

  const notifyTyping = useCallback(() => {
    if (!conversationKey || !userId) return;

    // Leading-edge throttle: broadcast immediately, then re-broadcast periodically
    // while typing continues so the other side's stale timeout keeps refreshing.
    const now = Date.now();
    if (now - lastSentRef.current >= TYPING_THROTTLE_MS) {
      lastSentRef.current = now;
      broadcastTyping(true);
    }

    if (typingIdleRef.current) clearTimeout(typingIdleRef.current);
    typingIdleRef.current = setTimeout(() => {
      lastSentRef.current = 0;
      broadcastTyping(false);
    }, TYPING_IDLE_MS);
  }, [broadcastTyping, conversationKey, userId]);

  useEffect(() => {
    if (!conversationKey || !userId) {
      setIsOtherTyping(false);
      return;
    }

    const supabase = createClient();
    const channel = supabase.channel(`typing:${conversationKey}`, {
      config: { broadcast: { self: false } },
    });

    channel
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        const data = payload as TypingPayload;
        if (data.userId === userId) return;

        if (staleRef.current) clearTimeout(staleRef.current);

        if (data.isTyping) {
          setIsOtherTyping(true);
          staleRef.current = setTimeout(() => setIsOtherTyping(false), TYPING_STALE_MS);
        } else {
          setIsOtherTyping(false);
        }
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      stopTyping();
      if (staleRef.current) clearTimeout(staleRef.current);
      void supabase.removeChannel(channel);
      channelRef.current = null;
      setIsOtherTyping(false);
    };
  }, [conversationKey, userId, stopTyping]);

  const firstName = counterpartName?.trim().split(/\s+/)[0];
  const typingLabel = isOtherTyping
    ? `${firstName && firstName !== "You" ? firstName : "Someone"} is typing…`
    : null;

  return { isOtherTyping, typingLabel, notifyTyping, stopTyping };
}
