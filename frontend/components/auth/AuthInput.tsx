"use client";

import React, { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export interface AuthInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, error, helperText, icon, type = "text", className = "", id, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-[var(--text-main)] uppercase tracking-wider"
          >
            {label}
          </label>
        )}

        <div className="relative rounded-[var(--radius-md)]">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-muted)]">
              {icon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            type={inputType}
            className={`w-full bg-[var(--card)] text-[var(--text-main)] placeholder:text-[var(--text-subtle)] text-sm rounded-[var(--radius-md)] border transition-all duration-150 py-3 ${
              icon ? "pl-11" : "pl-4"
            } ${isPassword ? "pr-11" : "pr-4"} ${
              error
                ? "border-[var(--destructive)] focus:ring-2 focus:ring-[var(--destructive)]/20 focus:border-[var(--destructive)]"
                : "border-[var(--input-border)] hover:border-slate-400 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/15"
            } outline-none disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors focus:outline-none"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        {error && (
          <p className="text-xs text-[var(--destructive)] flex items-center gap-1 mt-1 font-medium animate-fadeIn">
            {error}
          </p>
        )}

        {helperText && !error && (
          <p className="text-xs text-[var(--text-muted)] mt-1">{helperText}</p>
        )}
      </div>
    );
  }
);

AuthInput.displayName = "AuthInput";
