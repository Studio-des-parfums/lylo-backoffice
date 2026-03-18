"use client";

import type { InputHTMLAttributes } from "react";

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={[
        "w-full rounded-custom border border-[#e5e5e3] bg-white px-3 py-2 text-sm text-dark shadow-sm outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/15 disabled:bg-light",
        className,
      ].join(" ")}
    />
  );
}

