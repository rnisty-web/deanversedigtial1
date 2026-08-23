export function AdminFooter() {
  return (
    <footer className="admin-footer-gold-border shrink-0 bg-[var(--admin-panel)]/80 px-3 py-2 backdrop-blur-xl sm:px-6 sm:py-3 lg:flex lg:items-center lg:justify-center lg:px-6">
      <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-[8px] font-medium uppercase tracking-[0.14em] text-[var(--admin-text-muted)] sm:text-[10px] sm:tracking-[0.22em]">
        <span className="text-[var(--admin-gold)]">✦</span>
        <span>DeanVerse Digital</span>
        <span className="hidden text-[var(--admin-text-muted)]/40 sm:inline">·</span>
        <span className="hidden sm:inline">Building digital experiences that inspire</span>
        <span className="hidden text-[var(--admin-text-muted)]/40 sm:inline">·</span>
        <span className="hidden sm:inline">D+D</span>
        <span className="text-[var(--admin-gold)] sm:hidden">D+D</span>
        <span className="hidden text-[var(--admin-gold)] sm:inline">✦</span>
      </p>
    </footer>
  );
}
