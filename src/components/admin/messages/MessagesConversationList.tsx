"use client";

import { ConversationListPanel } from "@/components/messages/ConversationListPanel";
import type { Conversation } from "@/lib/messages/utils";

type MessagesConversationListProps = {
  conversations: Conversation[];
  selectedKey: string | null;
  starredKeys: Set<string>;
  onSelect: (key: string) => void;
  onToggleStar: (key: string) => void;
  hidden?: boolean;
};

export function MessagesConversationList(props: MessagesConversationListProps) {
  return (
    <ConversationListPanel
      {...props}
      variant="admin"
      title="Messages"
    />
  );
}
