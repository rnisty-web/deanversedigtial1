import AdminProjectsPage from "@/app/admin/projects/page";
import PortalProjectsPage from "@/app/portal/projects/page";
import { WorkspaceModuleBridge } from "@/components/workspace/WorkspaceModuleBridge";

export default function WorkspaceProjectsPage() {
  return (
    <WorkspaceModuleBridge
      all={<AdminProjectsPage />}
      own={<PortalProjectsPage />}
    />
  );
}
