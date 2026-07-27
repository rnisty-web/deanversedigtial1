import AdminInvoicesPage from "@/app/admin/invoices/page";
import PortalInvoicesPage from "@/app/portal/invoices/page";
import { WorkspaceModuleBridge } from "@/components/workspace/WorkspaceModuleBridge";

export default function WorkspaceInvoicesPage() {
  return (
    <WorkspaceModuleBridge
      all={<AdminInvoicesPage />}
      own={<PortalInvoicesPage />}
    />
  );
}
