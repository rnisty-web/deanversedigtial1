import AdminAccountPage from "@/app/admin/settings/my-account/page";
import PortalAccountPage from "@/app/portal/account/page";
import { WorkspaceModuleBridge } from "@/components/workspace/WorkspaceModuleBridge";

export default function WorkspaceAccountPage() {
  return (
    <WorkspaceModuleBridge
      all={<AdminAccountPage />}
      own={<PortalAccountPage />}
    />
  );
}
