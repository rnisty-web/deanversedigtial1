import { Suspense } from "react";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <Suspense fallback={<p className="text-center text-white/50">Loading…</p>}>
      <LoginForm />
    </Suspense>
  );
}
