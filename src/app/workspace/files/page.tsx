import { redirect } from "next/navigation";
import PortalFilesPage from "@/app/portal/files/page";
import { requireWorkspaceSession } from "@/lib/workspace/session";

export default async function WorkspaceFilesPage() {
  const session = await requireWorkspaceSession();
  // Staff manage project deliverables from Projects; the dedicated Files module
  // is the client-facing project file browser.
  if (session.scope === "all") {
    redirect("/workspace/projects");
  }
  return <PortalFilesPage />;
}
