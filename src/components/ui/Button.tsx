"use client";

import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";

const VARIANT_CLASS: Record<Variant, string> = {
  primary:
    "border-primary/20 bg-primary text-white hover:bg-primary/90",
  secondary:
    "border-[#e5e5e3] bg-light text-dark hover:bg-light/60",
  danger:
    "border-red-200 bg-red-600 text-white hover:bg-red-700",
  ghost:
    "border-transparent bg-transparent text-dark hover:bg-light",
};

export function Button({
  className = "",
  variant = "secondary",
  type,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      type={type ?? "button"}
      {...props}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-custom border px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        VARIANT_CLASS[variant],
        className,
      ].join(" ")}
    />
  );
}

