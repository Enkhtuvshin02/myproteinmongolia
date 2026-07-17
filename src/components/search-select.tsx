"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

export function SearchSelect({
  value,
  onChange,
  options,
  placeholder = "Сонгох",
  disabled = false,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQ("");
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const filtered = q
    ? options.filter((o) => o.toLowerCase().includes(q.toLowerCase()))
    : options;

  const select = (v: string) => {
    onChange(v);
    setOpen(false);
    setQ("");
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={`flex h-11 w-full items-center justify-between rounded-lg border px-3 text-sm transition-colors ${
          open ? "border-brand bg-background" : "border-border-subtle bg-background"
        } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:border-brand/60"}`}
      >
        <span className={value ? "text-foreground" : "text-muted-foreground"}>
          {value || placeholder}
        </span>
        <ChevronDown
          className={`size-4 shrink-0 text-muted-foreground transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-border-subtle bg-background shadow-lg">
          <div className="p-2">
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") { setOpen(false); setQ(""); }
                if (e.key === "Enter" && filtered.length === 1) select(filtered[0]);
              }}
              placeholder="Хайх…"
              className="h-9 w-full rounded-lg border border-border-subtle bg-muted/60 px-3 text-sm outline-none focus:border-brand focus:bg-background"
            />
          </div>
          <ul className="max-h-56 overflow-y-auto pb-1.5">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-sm text-muted-foreground">Олдсонгүй</li>
            ) : (
              filtered.map((o) => (
                <li
                  key={o}
                  onMouseDown={() => select(o)}
                  className={`cursor-pointer px-4 py-2.5 text-sm transition-colors ${
                    o === value
                      ? "bg-brand/8 font-bold text-brand"
                      : "hover:bg-muted"
                  }`}
                >
                  {o}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
