"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type NavItem = {
  href: string;
  label: string;
  icon: ReactNode;
};

function NavIconHome() {
  return (
    <svg
      className="mr-3 h-5 w-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
    </svg>
  );
}

function NavIconTeam() {
  return (
    <svg
      className="mr-3 h-5 w-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
    </svg>
  );
}

function NavIconClients() {
  return (
    <svg
      className="mr-3 h-5 w-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
    </svg>
  );
}

function NavIconAnalytics() {
  return (
    <svg
      className="mr-3 h-5 w-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
    </svg>
  );
}

function NavIconConfig() {
  return (
    <svg
      className="mr-3 h-5 w-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
      <path
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
    </svg>
  );
}

const NAV: NavItem[] = [
  { href: "/", label: "Accueil", icon: <NavIconHome /> },
  { href: "/equipe", label: "Équipe", icon: <NavIconTeam /> },
  { href: "/clients", label: "Clients", icon: <NavIconClients /> },
  { href: "/analyses", label: "Analyses", icon: <NavIconAnalytics /> },
  { href: "/configuration/imprimantes", label: "Configuration", icon: <NavIconConfig /> },
];

export function Sidebar() {
  const pathname = usePathname() ?? "/";

  return (
    <aside className="flex h-full w-64 flex-col border-r border-[#3d342f] bg-sidebar-bg">
      <div className="flex h-20 flex-col justify-center border-b border-[#3d342f] px-6">
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold tracking-tight text-white">
            Lylo <span className="text-primary">back-office</span>
          </span>
        </div>
        <span className="mt-0.5 text-[10px] uppercase tracking-widest text-cream/40">
          Version 1.0.4
        </span>
      </div>

      <nav className="flex-1 space-y-2 px-4 py-6">
        {NAV.map((item) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const base =
            "group flex items-center rounded-custom px-3 py-2 text-sm font-medium transition-colors";
          const active = "bg-primary/20 text-white";
          const inactive =
            "text-cream/70 hover:bg-primary/10 hover:text-white";

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`${base} ${isActive ? active : inactive}`}
            >
              <span className={isActive ? "text-primary" : ""}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[#3d342f] p-4">
        <div className="mb-4 flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/20 bg-cream/10 font-semibold text-primary">
            JD
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-semibold text-white">
              Jean Dupont
            </span>
            <span className="truncate text-xs text-cream/50">
              j.dupont@lylo.ai
            </span>
          </div>
        </div>

        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-custom border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-primary/20"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
          Déconnexion
        </button>
      </div>
    </aside>
  );
}

