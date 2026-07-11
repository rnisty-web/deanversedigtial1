"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const TYPING_IDLE_MS = 2000;
const TYPING_DEBOUNCE_MS = 300;
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
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (typingIdleRef.current) clearTimeout(typingIdleRef.current);
    broadcastTyping(false);
  }, [broadcastTyping]);

  const notifyTyping = useCallback(() => {
    if (!conversationKey || !userId) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      broadcastTyping(true);
      if (typingIdleRef.current) clearTimeout(typingIdleRef.current);
      typingIdleRef.current = setTimeout(() => broadcastTyping(false), TYPING_IDLE_MS);
    }, TYPING_DEBOUNCE_MS);
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
