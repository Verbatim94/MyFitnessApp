"use client";

import { motion } from "framer-motion";
import type { HTMLMotionProps } from "framer-motion";
import { Check, ChevronRight } from "lucide-react";
import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes
} from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLMotionProps<"div">) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className={cn(
        "rounded-[28px] border border-white/8 bg-card/90 p-4 shadow-soft backdrop-blur-xl",
        className
      )}
      {...props}
    />
  );
}

export function SectionHeader({
  title,
  caption,
  action
}: {
  title: string;
  caption?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <div>
        <h2 className="text-base font-semibold tracking-tight text-foreground">{title}</h2>
        {caption ? <p className="mt-1 text-xs text-muted-foreground">{caption}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Pill({
  children,
  tone = "default",
  className
}: {
  children: ReactNode;
  tone?: "default" | "success" | "warning" | "danger";
  className?: string;
}) {
  const toneClass =
    tone === "success"
      ? "bg-success/15 text-success"
      : tone === "warning"
        ? "bg-warning/15 text-warning"
        : tone === "danger"
          ? "bg-danger/15 text-danger"
          : "bg-white/6 text-foreground";

  return <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium", toneClass, className)}>{children}</span>;
}

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-white/6", className)}>
      <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${Math.max(4, Math.min(100, value))}%` }} />
    </div>
  );
}

export function MetricRing({ value, label, sublabel }: { value: number; label: string; sublabel?: string }) {
  const safe = Math.max(0, Math.min(100, value));
  return (
    <div className="flex items-center gap-4 rounded-[24px] border border-white/8 bg-card-2/70 p-4">
      <div
        className="grid h-20 w-20 place-items-center rounded-full"
        style={{
          background: `conic-gradient(hsl(var(--accent)) ${safe * 3.6}deg, rgba(255,255,255,0.06) 0deg)`
        }}
      >
        <div className="grid h-14 w-14 place-items-center rounded-full bg-background text-sm font-semibold text-foreground">{safe}%</div>
      </div>
      <div>
        <div className="text-sm font-semibold text-foreground">{label}</div>
        {sublabel ? <div className="mt-1 text-xs text-muted-foreground">{sublabel}</div> : null}
      </div>
    </div>
  );
}

export function IconButton({
  children,
  active,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-2xl border px-3 py-2 text-sm transition-colors",
        active
          ? "border-accent/40 bg-accent/15 text-foreground"
          : "border-white/8 bg-white/4 text-muted-foreground hover:text-foreground",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return <label className="mb-2 block text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">{children}</label>;
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "h-12 w-full rounded-2xl border border-white/10 bg-white/4 px-4 text-sm text-foreground outline-none transition focus:border-accent/50 focus:ring-2 focus:ring-accent/20",
        props.className
      )}
    />
  );
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "min-h-24 w-full rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-sm text-foreground outline-none transition focus:border-accent/50 focus:ring-2 focus:ring-accent/20",
        props.className
      )}
    />
  );
}

export function PrimaryButton({
  children,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-accent px-4 text-sm font-semibold text-accent-foreground transition hover:opacity-95",
        className
      )}
      {...props}
    >
      {children}
      <ChevronRight className="h-4 w-4" />
    </button>
  );
}

export function CheckboxChip({
  checked,
  label,
  onClick
}: {
  checked: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm transition",
        checked ? "border-success/40 bg-success/12 text-foreground" : "border-white/10 bg-white/4 text-muted-foreground"
      )}
    >
      <span
        className={cn(
          "grid h-5 w-5 place-items-center rounded-full border",
          checked ? "border-success/50 bg-success/20 text-success" : "border-white/10"
        )}
      >
        {checked ? <Check className="h-3.5 w-3.5" /> : null}
      </span>
      {label}
    </button>
  );
}
