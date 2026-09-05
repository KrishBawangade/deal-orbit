"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      richColors
      closeButton
      toastOptions={{
        style: {
          borderRadius: "var(--radius-md)",
          fontFamily: "var(--font-sans)",
        },
        className: "border shadow-lg",
      }}
    />
  );
}

// Re-export toast function so teammates can import directly from @/components/Toaster
export { toast } from "sonner";
