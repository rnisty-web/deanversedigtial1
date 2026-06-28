export function LiquidBackground() {
  return (
    <>
      <div
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-30%,rgba(111,143,114,0.18),transparent_55%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_50%_45%_at_100%_50%,rgba(163,201,168,0.08),transparent_50%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_40%_35%_at_0%_80%,rgba(47,93,80,0.12),transparent_55%)]"
        aria-hidden
      />
      <div
        className="liquid-mesh pointer-events-none fixed inset-0 opacity-40"
        aria-hidden
      />
    </>
  );
}
