"use client";

import type { LabelHTMLAttributes } from "react";

export function Label({ className = "", ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      {...props}
      className={["text-xs font-semibold uppercase tracking-wider text-dark/60", className].join(
        " ",
      )}
    />
  );
}

