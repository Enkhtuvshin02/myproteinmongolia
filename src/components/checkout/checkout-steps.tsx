import { ChevronRight } from "lucide-react";

const steps = ["Миний сагс", "Захиалгын хаяг", "Баталгаажуулах", "Захиалгын мэдээлэл"];

// Breadcrumb-style progress used across cart / checkout / order pages.
export function CheckoutSteps({ active }: { active: number }) {
  return (
    <nav className="mb-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
      {steps.map((label, i) => (
        <span key={label} className="flex items-center gap-2">
          <span
            className={
              i === active
                ? "font-semibold text-brand"
                : i < active
                ? "text-foreground"
                : "text-muted-foreground"
            }
          >
            {label}
          </span>
          {i < steps.length - 1 && (
            <ChevronRight className="size-4 text-muted-foreground" />
          )}
        </span>
      ))}
    </nav>
  );
}
