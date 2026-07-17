"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import Link from "next/link";

type Product = {
  id: string;
  name: string;
  price: number;
  originalPrice: number | null;
  image: string;
};

type PromotionSettings = {
  isActive: boolean;
  title: string;
  description: string;
  productId: string | null;
  product: Product | null;
  startDate: string;
  endDate: string;
  discountCode: string | null;
  discountValue: string | null;
  imageUrl: string | null;
};

export function PromotionPopup() {
  const [promo, setPromo] = useState<PromotionSettings | null>(null);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if dismissed in this session
    const isDismissed = sessionStorage.getItem("myprotein-promo-dismissed") === "true";
    if (isDismissed) {
      setLoading(false);
      return;
    }

    // Fetch active promotion
    fetch("/api/promotion")
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        if (data.active && data.promo) {
          setPromo(data.promo);
          // Auto open after a small delay for better user experience
          const timer = setTimeout(() => {
            setOpen(true);
          }, 1500);
          return () => clearTimeout(timer);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleClose = () => {
    setOpen(false);
    sessionStorage.setItem("myprotein-promo-dismissed", "true");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    // Simulate newsletter subscription success
    setSubmitted(true);
  };

  if (!open || !promo) return null;

  const displayImage = promo.imageUrl || promo.product?.image || "/products/whey.svg";

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
      onClick={handleClose}
    >
      <div 
        className="relative w-full max-w-3xl overflow-hidden rounded-xl bg-background shadow-2xl transition-all duration-300 transform scale-100 flex flex-col md:flex-row border border-border-subtle"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute right-3 top-3 z-10 flex size-8 items-center justify-center rounded-full bg-background/80 text-foreground hover:bg-muted transition-colors border border-border-subtle"
          aria-label="Close"
        >
          <X className="size-4" />
        </button>

        {/* Left Side: Product or Banner Image */}
        <div className="relative w-full md:w-1/2 bg-ink flex flex-col justify-between p-8 text-white min-h-[250px] md:min-h-[400px]">
          {/* Subtle background brand-teal radial gradient */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(30,150,166,0.18),transparent)] pointer-events-none" />

          <div className="relative z-10">
            <span className="text-xs font-bold tracking-widest text-brand uppercase">
              MyProtein<span className="text-white"> Mongolia</span> ОНЦЛОХ
            </span>
          </div>

          <div className="relative z-10 my-auto flex flex-col items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={displayImage}
              alt={promo.product?.name || "Promotion banner"}
              className="max-h-48 md:max-h-56 object-contain drop-shadow-[0_10px_20px_rgba(255,87,34,0.25)] transition-transform duration-500 hover:scale-105"
            />
            {promo.product && (
              <div className="mt-4 text-center">
                <p className="text-sm font-semibold tracking-tight text-white/95">{promo.product.name}</p>
                <div className="mt-1 flex items-center justify-center gap-2">
                  <span className="text-lg font-black text-brand">₮{promo.product.price.toLocaleString()}</span>
                  {promo.product.originalPrice && (
                    <span className="text-xs text-white/50 line-through">₮{promo.product.originalPrice.toLocaleString()}</span>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="relative z-10 text-center">
            <p className="text-[10px] text-white/40">MyProtein Mongolia © {new Date().getFullYear()}. Бүх эрх хуулиар хамгаалагдсан.</p>
          </div>
        </div>

        {/* Right Side: Action form and text details */}
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center bg-background">
          <div className="space-y-6 text-center md:text-left">
            <div>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight text-foreground uppercase leading-none">
                {promo.title}
              </h2>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                {promo.description}
              </p>
            </div>

            {/* Display Promo Code directly if available */}
            {promo.discountCode && (
              <div className="border border-dashed border-border-subtle bg-muted rounded-lg p-3 text-center">
                <span className="text-xs text-muted-foreground block uppercase font-bold tracking-wider mb-1">
                  Урамшууллын код
                </span>
                <span className="text-xl font-mono font-black text-brand tracking-widest">
                  {promo.discountCode}
                </span>
                {promo.discountValue && (
                  <span className="text-xs text-muted-foreground block mt-1">
                    ({promo.discountValue} Хямдрал)
                  </span>
                )}
              </div>
            )}

            {/* Action Button: Redirect to product or close */}
            <div className="space-y-3">
              {promo.productId ? (
                <Link
                  href={`/product/${promo.productId}`}
                  onClick={handleClose}
                  className="inline-flex items-center justify-center h-11 w-full rounded-lg bg-ink text-white font-bold text-sm tracking-wide uppercase transition-all duration-150 hover:bg-brand active:scale-[0.98]"
                >
                  Бүтээгдэхүүнийг үзэх
                </Link>
              ) : (
                <button
                  onClick={handleClose}
                  className="h-11 w-full rounded-lg bg-ink text-white font-bold text-sm tracking-wide uppercase transition-all duration-150 hover:bg-brand active:scale-[0.98]"
                >
                  Урамшуулал авах
                </button>
              )}

              <div>
                <button
                  type="button"
                  onClick={handleClose}
                  className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors hover:underline"
                >
                  Хаах
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
