"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  enrichRealtimeMessage,
  mergeIncomingMessage,
  type RawMessageRow,
} from "@/lib/messages/realtime";
import type { MessageRecord } from "@/lib/messages/utils";

type UseMessageRealtimeOptions = {
  userId: string | null;
  variant: "admin" | "portal";
  enabled?: boolean;
  setMessages: React.Dispatch<React.SetStateAction<MessageRecord[]>>;
};

export function useMessageRealtime({
  userId,
  variant,
  enabled = true,
  setMessages,
}: UseMessageRealtimeOptions) {
  useEffect(() => {
    if (!userId || !enabled) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`messages-live:${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const row = payload.new as RawMessageRow;
          if (row.sender_id !== userId && row.recipient_id !== userId && variant === "portal") {
            return;
          }

          setMessages((prev) => {
            const enriched = enrichRealtimeMessage(row, prev, variant, userId);
            return mergeIncomingMessage(prev, enriched);
          });
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "messages" },
        (payload) => {
          const row = payload.new as RawMessageRow;
          if (row.sender_id !== userId && row.recipient_id !== userId && variant === "portal") {
            return;
          }
          setMessages((prev) =>
            prev.map((message) =>
              message.id === row.id ? { ...message, read: row.read } : message,
            ),
          );
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId, variant, enabled, setMessages]);
}
