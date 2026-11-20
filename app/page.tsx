export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
      <div className="max-w-2xl rounded-lg border border-border bg-card p-8 shadow-sm">
        <div className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 mb-4">
          Phase 01 — Architecture & Contract Freeze Complete
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          CartGuard AI
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          QALA LABS — AI FORGE 2026 (Challenge AF-2026-01: Project Sentinel AI)
        </p>
        <div className="mt-6 border-t border-border pt-6 text-left text-xs text-muted-foreground space-y-2">
          <p>
            <strong className="text-foreground">Backend & Core Contracts:</strong>{" "}
            Initialized & Frozen (Aayush)
          </p>
          <p>
            <strong className="text-foreground">AI & Compliance Pipeline:</strong>{" "}
            Stubs Ready for Block A (Aashirwad)
          </p>
          <p>
            <strong className="text-foreground">Dashboard UI Shell:</strong>{" "}
            Awaiting Frontend Layout (Aayash)
          </p>
        </div>
      </div>
    </main>
  );
}
