import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0f1a17] px-4 text-center">
      <p className="text-sm font-medium uppercase tracking-wider text-[#a3c9a8]">404</p>
      <h1 className="mt-2 text-3xl font-semibold text-white">Page not found</h1>
      <p className="mt-3 max-w-md text-sm text-white/60">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button href="/">Back to home</Button>
        <Button href="/contact" variant="secondary">
          Contact us
        </Button>
      </div>
      <Link href="/portal" className="mt-6 text-sm text-white/40 hover:text-[#a3c9a8]">
        Client portal
      </Link>
    </div>
  );
}
