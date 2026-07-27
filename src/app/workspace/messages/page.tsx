import AdminMessagesPage from "@/app/admin/messages/page";
import PortalMessagesPage from "@/app/portal/messages/page";
import { WorkspaceModuleBridge } from "@/components/workspace/WorkspaceModuleBridge";

export default function WorkspaceMessagesPage() {
  return (
    <WorkspaceModuleBridge
      all={<AdminMessagesPage />}
      own={<PortalMessagesPage />}
    />
  );
}
