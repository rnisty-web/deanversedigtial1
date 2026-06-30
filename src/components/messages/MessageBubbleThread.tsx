"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  buildThreadSegments,
  formatMessageTime,
  type ThreadBubble,
} from "@/lib/messages/utils";
import { cn } from "@/lib/utils";

type MessageBubbleThreadProps = {
  messages: ThreadBubble[];
  variant?: "admin" | "portal";
  className?: string;
  scrollKey?: string;
};

export function MessageBubbleThread({
  messages,
  variant = "admin",
  className,
  scrollKey,
}: MessageBubbleThreadProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const segments = useMemo(() => buildThreadSegments(messages), [messages]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [scrollKey, messages.length]);

  return (
    <div
      ref={scrollRef}
      className={cn("dm-thread", variant === "portal" && "dm-thread-portal", className)}
    >
      {segments.map((segment, index) => {
        if (segment.type === "date") {
          return (
            <div key={`date-${segment.label}-${index}`} className="dm-date-separator">
              <span>{segment.label}</span>
            </div>
          );
        }

        const { group, showSubject } = segment;

        return (
          <div
            key={`group-${group.bubbles[0]?.id ?? index}`}
            className={cn("dm-group", group.isOutgoing && "dm-group-out")}
          >
            {showSubject && group.bubbles[0]?.subject ? (
              <p className="dm-thread-subject">{group.bubbles[0].subject}</p>
            ) : null}
            <div className="dm-bubble-stack">
              {group.bubbles.map((bubble, bubbleIndex) => {
                const isFirst = bubbleIndex === 0;
                const isLast = bubbleIndex === group.bubbles.length - 1;
                const isSingle = group.bubbles.length === 1;

                return (
                  <div
                    key={bubble.id}
                    className={cn(
                      "dm-bubble",
                      group.isOutgoing ? "dm-bubble-out" : "dm-bubble-in",
                      isSingle && "dm-bubble-single",
                      !isSingle && isFirst && "dm-bubble-first",
                      !isSingle && isLast && "dm-bubble-last",
                      !isSingle && !isFirst && !isLast && "dm-bubble-middle",
                    )}
                  >
                    <p className="dm-bubble-text">{bubble.content}</p>
                  </div>
                );
              })}
            </div>
            <p className="dm-group-time">{formatMessageTime(group.timestamp)}</p>
          </div>
        );
      })}
    </div>
  );
}
