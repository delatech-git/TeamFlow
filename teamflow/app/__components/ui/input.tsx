"use client";

import { forwardRef, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "./utils";

export type InputVariant = "default" | "glass" | "authDark";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
  variant?: InputVariant;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  fullWidth?: boolean;
};

const baseClasses =
  "rounded-full border text-sm outline-none transition " +
  "disabled:cursor-not-allowed disabled:opacity-50";

const variantClasses: Record<InputVariant, string> = {
  default:
    "h-10 border-slate-300 bg-white px-4 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",

  glass:
    "h-10 border-white/30 bg-white/14 px-4 text-white placeholder:text-white/62 focus:border-[var(--tf-accent)]/75 focus:bg-white/22",

  authDark:
    "h-12 border-white/25 bg-white/5 px-5 text-base text-white placeholder:text-white/40 " +
    "focus:border-orange-500 focus:ring-2 focus:ring-orange-500/25",
};

// File pickers don't render like text boxes (native "Choose file" button + name),
// so they get their own dashed dropzone look instead of the pill/height rules above.
const fileBaseClasses =
  "cursor-pointer rounded-2xl border border-dashed text-sm outline-none transition " +
  "file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:px-4 file:py-2 " +
  "file:text-xs file:font-semibold file:uppercase file:tracking-wider " +
  "disabled:cursor-not-allowed disabled:opacity-50";

const fileVariantClasses: Record<InputVariant, string> = {
  default:
    "border-slate-300 bg-white px-4 py-3 text-slate-500 file:bg-slate-900 file:text-white hover:file:bg-slate-700",

  glass:
    "border-white/30 bg-white/10 px-4 py-3 text-white/70 file:bg-white/20 file:text-white hover:file:bg-white/30",

  authDark:
    "border-white/25 bg-white/5 px-4 py-3 text-white/60 file:bg-orange-500 file:text-white hover:file:bg-orange-400",
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    id,
    label,
    hint,
    error,
    className,
    variant = "default",
    leadingIcon,
    trailingIcon,
    fullWidth = true,
    ...props
  },
  ref,
) {
  const labelClassName =
    variant === "authDark"
      ? "text-xs font-semibold uppercase tracking-wider text-white/55"
      : "text-xs font-medium text-slate-600";

  const isFile = props.type === "file";
  const isPassword = props.type === "password";
  const [showPassword, setShowPassword] = useState(false);

  const effectiveTrailingIcon = isPassword ? (
    <button
      type="button"
      tabIndex={-1}
      onClick={() => setShowPassword((prev) => !prev)}
      aria-label={showPassword ? "Hide password" : "Show password"}
      className="pointer-events-auto text-slate-500 hover:text-slate-700"
    >
      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  ) : (
    trailingIcon
  );

  return (
    <div className={cn("flex flex-col gap-1.5", fullWidth && "w-full")}>
      {label && (
        <label htmlFor={id} className={labelClassName}>
          {label}
        </label>
      )}

      <div className="relative">
        {leadingIcon && (
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
            {leadingIcon}
          </span>
        )}

        <input
          id={id}
          ref={ref}
          className={cn(
            isFile ? fileBaseClasses : baseClasses,
            isFile ? fileVariantClasses[variant] : variantClasses[variant],
            !isFile && leadingIcon ? "pl-9" : undefined,
            !isFile && effectiveTrailingIcon ? "pr-9" : undefined,
            fullWidth && "w-full",
            error && "border-red-500 focus:ring-red-500/20",
            className,
          )}
          {...props}
          type={isPassword ? (showPassword ? "text" : "password") : props.type}
        />

        {effectiveTrailingIcon && (
          <span className="absolute inset-y-0 right-3 flex items-center">
            {effectiveTrailingIcon}
          </span>
        )}
      </div>

      {error ? (
        <span
          className={cn(
            "text-xs",
            variant === "authDark" ? "text-red-400" : "text-red-500",
          )}
        >
          {error}
        </span>
      ) : hint ? (
        <span
          className={cn(
            "text-xs",
            variant === "authDark" ? "text-white/45" : "text-slate-500",
          )}
        >
          {hint}
        </span>
      ) : null}
    </div>
  );
});
