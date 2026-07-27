import { requireWorkspaceSession } from "@/lib/workspace/session";
import type { DataScope } from "@/lib/workspace/permissions";

/**
 * Server wrapper that picks the staff (all-scope) or client (own-scope) page
 * implementation while modules are still being fully unified. Both UIs keep
 * their existing look; only the host route changes to /workspace/*.
 */
export async function WorkspaceModuleBridge({
  all,
  own,
}: {
  all: React.ReactNode;
  own?: React.ReactNode;
}) {
  const session = await requireWorkspaceSession();
  const scope: DataScope = session.scope;
  if (scope === "own" && own) return <>{own}</>;
  return <>{all}</>;
}
