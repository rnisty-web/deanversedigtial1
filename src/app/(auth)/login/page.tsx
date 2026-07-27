import { Suspense } from "react";
import LoginForm from "./LoginForm";

export default function ClientWorkspaceLoginPage() {
  return (
    <Suspense fallback={<p className="text-center text-white/50">Loading…</p>}>
      <LoginForm variant="client" />
    </Suspense>
  );
}
