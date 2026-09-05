"use client";

import { useEffect, useState } from "react";
import { siteConfig } from "@/config/site";

interface HealthData {
  status: string;
  uptimeSeconds: number;
  environment: string;
  database?: {
    connected: boolean;
    type: string;
  };
}

export default function HealthStatus() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${siteConfig.apiUrl}/api/v1/health`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setHealth(json.data);
    } catch (err) {
      setError((err as Error).message || "Cannot connect to backend");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="card-surface">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative flex h-3.5 w-3.5">
            {loading ? (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            ) : health ? (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            ) : (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            )}
            <span
              className={`relative inline-flex rounded-full h-3.5 w-3.5 ${
                loading
                  ? "bg-amber-500"
                  : health
                  ? "bg-emerald-500"
                  : "bg-rose-500"
              }`}
            ></span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="type-h3 text-base font-semibold">
                Backend API Connection
              </h3>
              {loading ? (
                <span className="badge badge-primary">Checking...</span>
              ) : health ? (
                <span className="badge badge-success">Connected</span>
              ) : (
                <span className="badge bg-rose-100 text-rose-700 border border-rose-200">
                  Offline
                </span>
              )}
            </div>
            <p className="type-muted text-xs mt-0.5">
              Target endpoint:{" "}
              <code className="bg-slate-100 px-1.5 py-0.5 rounded text-[11px] font-mono">
                {siteConfig.apiUrl}/api/v1/health
              </code>
            </p>
          </div>
        </div>

        <button
          onClick={checkHealth}
          disabled={loading}
          className="btn-outline text-xs px-3 py-1.5 self-start sm:self-center"
        >
          {loading ? "Pinging..." : "Refresh Status"}
        </button>
      </div>

      {health && (
        <div className="mt-4 pt-4 border-t border-[var(--border)] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-2.5 rounded-lg bg-[var(--background)]">
            <span className="text-[var(--text-muted)] block">Status</span>
            <span className="font-semibold text-[var(--text-main)] capitalize">
              {health.status}
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-[var(--background)]">
            <span className="text-[var(--text-muted)] block">Environment</span>
            <span className="font-semibold text-[var(--text-main)]">
              {health.environment}
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-[var(--background)]">
            <span className="text-[var(--text-muted)] block">Database</span>
            <span className="font-semibold text-[var(--text-main)]">
              {health.database?.connected ? "Online" : "Connecting..."}
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-[var(--background)]">
            <span className="text-[var(--text-muted)] block">Uptime</span>
            <span className="font-semibold text-[var(--text-main)]">
              {health.uptimeSeconds}s
            </span>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
          Backend currently offline: Ensure the Express backend is running with{" "}
          <code className="font-mono font-semibold">npm run dev</code> or{" "}
          <code className="font-mono font-semibold">npm run dev:backend</code>.
        </div>
      )}
    </div>
  );
}
