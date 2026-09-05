"use client";

import React, { useEffect } from "react";

/**
 * WorkspaceHistoryGuard isolates the workspace session history stack.
 * It prevents the browser's Back button from popping the user out of the
 * workspace back into the login screen or pre-login landing pages.
 */
export function WorkspaceHistoryGuard() {
  useEffect(() => {
    // 1. Mark the current state as workspace root
    try {
      window.history.replaceState({ workspaceSession: true }, document.title, window.location.href);
      // 2. Add an internal barrier entry
      window.history.pushState({ workspaceSession: true }, document.title, window.location.href);

      const handlePopState = (event: PopStateEvent) => {
        const token =
          localStorage.getItem("dealorbit_token") ||
          document.cookie
            .split("; ")
            .find((row) => row.startsWith("dealorbit_token="))
            ?.split("=")[1];

        // If the user has an active session and attempts to back out into login or pre-auth pages,
        // immediately trap the navigation and hold them in the workspace.
        if (token) {
          window.history.pushState({ workspaceSession: true }, document.title, window.location.href);
        }
      };

      window.addEventListener("popstate", handlePopState);
      return () => {
        window.removeEventListener("popstate", handlePopState);
      };
    } catch {
      // Ignore if history API is restricted in sandbox
    }
  }, []);

  return null;
}
