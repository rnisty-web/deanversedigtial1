import { Suspense } from "react";
import LoginForm from "../LoginForm";

export default function LeadCreatorsWorkspaceLoginPage() {
  return (
    <Suspense fallback={<p className="text-center text-white/50">Loading…</p>}>
      <LoginForm variant="creators" />
    </Suspense>
  );
}
