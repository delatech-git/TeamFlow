import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

import { cn } from "./utils";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

export type ButtonSize = "sm" | "md" | "lg";
export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  rounded?: boolean;
  fullWidth?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  iconOnly?: boolean;
};

const baseClasses =
  "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 " +
  "disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border border-white/20 bg-white/5 text-white shadow-sm backdrop-blur-md " +
    "hover:border-cyan-400/80 hover:bg-white/10 hover:text-cyan-50 " +
    "hover:shadow-[0_0_22px_rgba(34,211,238,0.35),0_0_18px_rgba(236,72,153,0.25)] " +
    "focus-visible:ring-cyan-400/60",

  secondary:
    "border-2 border-white text-white bg-transparent " +
    "uppercase tracking-wide font-semibold " +
    "hover:bg-white hover:text-slate-950 " +
    "focus-visible:ring-white/60",
  ghost:
    "text-slate-700 hover:bg-slate-100 hover:text-slate-950 focus-visible:ring-slate-400",
  danger:
    "bg-red-600 text-white shadow-sm hover:bg-red-700 focus-visible:ring-red-500",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

const iconSizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 w-9 p-0",
  md: "h-10 w-10 p-0",
  lg: "h-12 w-12 p-0",
};
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      className,
      variant = "primary",
      size = "md",
      rounded,
      fullWidth,
      leadingIcon,
      trailingIcon,
      iconOnly,
      children,
      type = "button",
      ...rest
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          baseClasses,
          variantClasses[variant],
          iconOnly ? iconSizeClasses[size] : sizeClasses[size],
          rounded ? "rounded-full" : "rounded-xl",
          fullWidth && "w-full",
          className,
        )}
        {...rest}
      >
        {leadingIcon && !iconOnly && (
          <span className="shrink-0">{leadingIcon}</span>
        )}

        {children}

        {trailingIcon && !iconOnly && (
          <span className="shrink-0">{trailingIcon}</span>
        )}
      </button>
    );
  },
);
