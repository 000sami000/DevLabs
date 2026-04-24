import React from "react";

function Resource_comp() {
  return (
    <div className="group overflow-hidden rounded-xl border border-[var(--app-border)] bg-[var(--app-bg-panel)] transition hover:border-[var(--app-accent)]">
      <div
        className="h-[180px] w-full bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${"/demo1.webp"})` }}
      />

      <div className="p-4">
        <div className="text-sm font-semibold text-[var(--app-text)]">Learn AI free</div>
        <div className="mt-1 text-xs text-[var(--app-muted)]">Curated external resource</div>
      </div>
    </div>
  );
}

export default Resource_comp;

