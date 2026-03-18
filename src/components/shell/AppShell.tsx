import { Sidebar } from "@/components/shell/Sidebar";
import type { ReactNode } from "react";

function formatDateFr(date: Date) {
  return date.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function AppShell({ children }: { children: ReactNode }) {
  const todayLabel = formatDateFr(new Date());

  return (
    <div className="flex h-full overflow-hidden">
      <Sidebar />

      <main className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <header className="sticky top-0 z-10 flex h-20 items-center justify-between border-b border-[#e5e5e3] bg-light/80 px-8 backdrop-blur-md">
          <h1 className="text-2xl font-bold text-dark">Bonjour Jean Dupont</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-dark/60">Nous sommes le {todayLabel}</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <span className="material-symbols-outlined text-lg">
                notifications
              </span>
            </div>
          </div>
        </header>

        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}

