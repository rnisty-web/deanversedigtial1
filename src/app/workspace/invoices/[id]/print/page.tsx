import AdminInvoicePrintPage from "@/app/admin/invoices/[id]/print/page";
import PortalInvoicePrintPage from "@/app/portal/invoices/[id]/print/page";
import { requireWorkspaceSession } from "@/lib/workspace/session";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function WorkspaceInvoicePrintPage(props: PageProps) {
  const session = await requireWorkspaceSession();
  if (session.scope === "own") {
    return PortalInvoicePrintPage(props);
  }
  return AdminInvoicePrintPage(props);
}
