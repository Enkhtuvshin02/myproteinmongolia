"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";

export function ReceiptThumbnail({ url }: { url: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)} className="relative block size-10 overflow-hidden rounded border border-border-subtle">
        <Image src={url} alt="Баримт" fill sizes="40px" className="object-cover" />
      </button>
      {open && (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-black/80 p-4" onClick={() => setOpen(false)}>
          <button onClick={() => setOpen(false)} aria-label="Хаах" className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20">
            <X className="size-5" />
          </button>
          <div className="relative max-h-[85vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
            <Image src={url} alt="Гүйлгээний баримт" width={900} height={1200} className="h-auto max-h-[85vh] w-auto rounded-lg object-contain" />
          </div>
        </div>
      )}
    </>
  );
}
