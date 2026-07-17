import type { ReactNode } from "react";
import { Logo } from "@/components/logo";

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-12">
      <Logo className="mb-6" />
      <div className="w-full rounded-card border border-border-subtle bg-background p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </div>
      {footer && <div className="mt-4 text-center text-sm text-muted-foreground">{footer}</div>}
    </div>
  );
}

export function Field({
  label,
  required,
  error,
  ...props
}: {
  label: string;
  required?: boolean;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">
        {label} {required && <span className="text-sale">*</span>}
      </span>
      <input
        {...props}
        className={`h-11 w-full rounded-lg border px-3 text-sm outline-none focus:border-brand ${
          error ? "border-sale" : "border-border-subtle"
        }`}
      />
      {error && <span className="mt-1 block text-xs text-sale">{error}</span>}
    </label>
  );
}
