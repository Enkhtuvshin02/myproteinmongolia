"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Heart, Minus, Plus, ShoppingCart, ShieldCheck, Truck, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import type { Product, ProductVariant } from "@/lib/types";
import { categoryName, formatPrice } from "@/lib/data";
import { useCart } from "./cart-context";

export function ProductDetail({ product }: { product: Product }) {
  const { add, openCart } = useCart();
  const [qty, setQty] = useState(1);

  // Live variant selection
  const hasVariants = (product.variants?.length ?? 0) > 0;
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [activeFlavor, setActiveFlavor] = useState<string | null>(null);
  const [activeWeight, setActiveWeight] = useState<string | null>(null);

  // Initialize selected variant
  useEffect(() => {
    if (hasVariants && product.variants) {
      const initial = product.variants[0];
      setSelectedVariant(initial);
      setActiveFlavor(initial.flavour || null);
      setActiveWeight(initial.weight || null);
    }
  }, [hasVariants, product.variants]);

  // Extract all unique flavors and weights
  const availableFlavors = hasVariants && product.variants
    ? Array.from(new Set(product.variants.map((v) => v.flavour).filter(Boolean))) as string[]
    : [];

  const availableWeights = hasVariants && product.variants
    ? Array.from(new Set(product.variants.map((v) => v.weight).filter(Boolean))) as string[]
    : [];

  // Update variant when flavor is selected
  const handleFlavorSelect = (flavor: string) => {
    if (!product.variants) return;
    setActiveFlavor(flavor);
    // Find variant with this flavor and the currently selected weight, or just the first matching flavor
    let match = product.variants.find((v) => v.flavour === flavor && v.weight === activeWeight);
    if (!match) {
      match = product.variants.find((v) => v.flavour === flavor);
    }
    if (match) {
      setSelectedVariant(match);
      if (match.weight) setActiveWeight(match.weight);
    }
  };

  // Update variant when weight/size is selected
  const handleWeightSelect = (weight: string) => {
    if (!product.variants) return;
    setActiveWeight(weight);
    // Find variant with this weight and the currently selected flavor, or just the first matching weight
    let match = product.variants.find((v) => v.weight === weight && v.flavour === activeFlavor);
    if (!match) {
      match = product.variants.find((v) => v.weight === weight);
    }
    if (match) {
      setSelectedVariant(match);
      if (match.flavour) setActiveFlavor(match.flavour);
    }
  };

  // Accordion open/close states
  const [expandedAccordions, setExpandedAccordions] = useState<Record<string, boolean>>({
    Description: true,
  });

  const toggleAccordion = (key: string) => {
    setExpandedAccordions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Cart properties based on active selection
  const price = selectedVariant ? selectedVariant.price : product.price;
  const image = selectedVariant?.localImagePath || product.image;
  const unit = selectedVariant?.weight || product.unit;
  const stock = selectedVariant ? selectedVariant.stock : product.stock;

  const addToCart = () => {
    const cartProduct: Product = {
      ...product,
      price,
      image,
      unit: unit ?? undefined,
    };

    const flavorText = [selectedVariant?.flavour, selectedVariant?.weight]
      .filter(Boolean)
      .join(" / ") || undefined;

    add(cartProduct, qty, flavorText);
  };

  // Accordion details list from database JSON
  const accordionKeys = product.descriptionAccordions
    ? Object.keys(product.descriptionAccordions)
    : [];

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8">
      {/* breadcrumb */}
      <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
        <Link href="/" className="hover:text-brand transition-colors">Нүүр</Link>
        <span>/</span>
        <Link href="/product" className="hover:text-brand transition-colors">Бүтээгдэхүүн</Link>
        <span>/</span>
        <Link href={`/product?category=${product.categorySlug}`} className="hover:text-brand transition-colors">
          {categoryName(product.categorySlug)}
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium line-clamp-1">{product.name}</span>
      </nav>

      <div className="grid gap-10 grid-cols-1 lg:grid-cols-12 items-start">
        {/* left col: gallery */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="relative aspect-square bg-white overflow-hidden transition-all duration-300">
            <Image
              src={image}
              alt={product.name}
              fill
              priority
              sizes="(max-width:1024px) 100vw, 50vw"
              className="object-contain p-12 transition-all duration-500 hover:scale-105"
            />
          </div>

          {/* Quick Badges (desktop only) */}
          <div className="hidden lg:grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3 border border-shop-line p-3.5 bg-white">
              <ShieldCheck className="size-5 text-brand shrink-0" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-shop-black">Original баталгаа</h4>
                <p className="text-[11px] text-muted-foreground">100% лабораторийн сорилтой</p>
              </div>
            </div>
            <div className="flex items-center gap-3 border border-shop-line p-3.5 bg-white">
              <Truck className="size-5 text-brand shrink-0" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-shop-black">Шуурхай хүргэлт</h4>
                <p className="text-[11px] text-muted-foreground">УБ хотод 24–48 цагт</p>
              </div>
            </div>
          </div>
        </div>

        {/* right col: info & selectors (sticky card on desktop) */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 lg:self-start bg-white lg:border lg:border-shop-line lg:p-6 lg:shadow-sm">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-brand">
                {categoryName(product.categorySlug)}
              </span>
              {product.brand && (
                <>
                  <span className="text-xs text-shop-line">|</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {product.brand}
                  </span>
                </>
              )}
            </div>
            <h1 className="mt-2 text-2xl font-bold leading-tight tracking-tight text-shop-black sm:text-4xl">
              {product.name}
            </h1>
          </div>

          {/* price */}
          <div className="mt-4 flex items-end gap-3 border-b border-shop-line pb-4">
            <span className="text-2xl font-bold text-shop-black font-mono">
              {formatPrice(price)}
            </span>
            {selectedVariant?.gtin && (
              <span className="text-xs text-muted-foreground font-mono ml-auto mb-1">
                GTIN: {selectedVariant.gtin}
              </span>
            )}
          </div>

          {/* flavor selector */}
          {availableFlavors.length > 0 && (
            <div className="mt-6">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Амт сонгох: <span className="text-shop-black font-semibold">{activeFlavor || "Сонгоогүй"}</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {availableFlavors.map((flavor) => (
                  <button
                    key={flavor}
                    type="button"
                    onClick={() => handleFlavorSelect(flavor)}
                    className={`border px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                      activeFlavor === flavor
                        ? "border-brand bg-brand text-white shadow-sm"
                        : "border-shop-line text-foreground/80 bg-white hover:border-shop-black"
                    }`}
                  >
                    {flavor}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* weight / size selector */}
          {availableWeights.length > 0 && (
            <div className="mt-5">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Хэмжээ / Савалгаа: <span className="text-shop-black font-semibold">{activeWeight || "Сонгоогүй"}</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {availableWeights.map((weight) => (
                  <button
                    key={weight}
                    type="button"
                    onClick={() => handleWeightSelect(weight)}
                    className={`border px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                      activeWeight === weight
                        ? "border-brand bg-brand text-white shadow-sm"
                        : "border-shop-line text-foreground/80 bg-white hover:border-shop-black"
                    }`}
                  >
                    {weight}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* quantity & stock info */}
          <div className="mt-8 flex items-center justify-between border-t border-shop-line pt-6">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Тоо хэмжээ</span>
            <div className="flex items-center gap-4">
              <span className="text-xs text-muted-foreground font-mono">
                {stock > 0 ? (
                  <span className="text-success font-semibold">Бэлэн байна (Үлдэгдэл {stock})</span>
                ) : (
                  <span className="text-sale font-semibold">Дууссан</span>
                )}
              </span>
              <div className="flex items-center border border-shop-line bg-white">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="grid size-10 place-items-center hover:bg-shop-paper transition-colors"
                  aria-label="Хасах"
                >
                  <Minus className="size-3.5" />
                </button>
                <span className="w-10 text-center text-sm font-semibold font-mono">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.min(stock, q + 1))}
                  disabled={stock <= 0}
                  className="grid size-10 place-items-center hover:bg-shop-paper transition-colors disabled:opacity-30"
                  aria-label="Нэмэх"
                >
                  <Plus className="size-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* actions */}
          <div className="mt-6 flex flex-col gap-3">
            <button
              onClick={addToCart}
              disabled={stock <= 0}
              className="flex w-full items-center justify-center gap-2 border border-shop-black py-4 text-xs font-bold uppercase tracking-wider transition-all duration-300 hover:bg-shop-black hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ShoppingCart className="size-4" />
              Сагсанд хийх · {formatPrice(price * qty)}
            </button>
            <button
              onClick={() => {
                if (stock > 0) {
                  addToCart();
                  openCart();
                }
              }}
              disabled={stock <= 0}
              className="w-full bg-brand py-4 text-xs font-bold uppercase tracking-wider text-white transition-all duration-300 hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-40"
            >
              Худалдаж авах
            </button>
          </div>
        </div>

        {/* left bottom col: description accordions & nutrition facts (flows below the image gallery on desktop) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Quick Badges (mobile only) */}
          <div className="grid lg:hidden grid-cols-2 gap-3">
            <div className="flex items-center gap-3 border border-shop-line p-3.5 bg-white">
              <ShieldCheck className="size-5 text-brand shrink-0" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-shop-black">Original баталгаа</h4>
                <p className="text-[11px] text-muted-foreground">100% лабораторийн сорилтой</p>
              </div>
            </div>
            <div className="flex items-center gap-3 border border-shop-line p-3.5 bg-white">
              <Truck className="size-5 text-brand shrink-0" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-shop-black">Шуурхай хүргэлт</h4>
                <p className="text-[11px] text-muted-foreground">УБ хотод 24–48 цагт</p>
              </div>
            </div>
          </div>

          {/* detail accordions */}
          {accordionKeys.length > 0 && (
            <div className="border-t border-shop-line pt-4">
              <div className="divide-y divide-shop-line">
                {accordionKeys.map((key) => {
                  const isOpen = !!expandedAccordions[key];
                  const rawContent = product.descriptionAccordions?.[key] || "";
                  return (
                    <div key={key} className="py-3">
                      <button
                        type="button"
                        onClick={() => toggleAccordion(key)}
                        className="flex w-full items-center justify-between text-left py-1"
                      >
                        <span className="text-xs font-bold uppercase tracking-wider text-shop-black flex items-center gap-2">
                          <Sparkles className="size-3.5 text-brand" />
                          {key}
                        </span>
                        {isOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                      </button>
                      {isOpen && (
                        <div className="mt-3.5 text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap pl-5 font-sans">
                          {rawContent}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* nutrition table factsheet */}
          {product.nutritionTable && product.nutritionTable.length > 0 && (
            <div className="border border-shop-black bg-[#fafafa] p-6 shadow-sm">
              <h3 className="font-display text-sm font-bold uppercase tracking-wider mb-4 border-b border-shop-black pb-2">
                Шим тэжээлийн үзүүлэлт (Nutrition Facts)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-shop-black">
                      <th className="py-2.5 font-bold uppercase text-shop-black">Үзүүлэлт</th>
                      <th className="py-2.5 text-right font-bold uppercase text-shop-black">100 граммд</th>
                      <th className="py-2.5 text-right font-bold uppercase text-shop-black">Порцоор</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-shop-line">
                    {product.nutritionTable.map((row, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? "bg-white/50" : ""}>
                        <td className="py-3 font-semibold text-shop-black">{row.parameter}</td>
                        <td className="py-3 text-right text-muted-foreground font-mono">{row.per_100g || "-"}</td>
                        <td className="py-3 text-right text-muted-foreground font-mono">{row.per_serving || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {product.nutritionNotice && (
                <p className="mt-4 text-[10px] text-muted-foreground italic font-mono">
                  * {product.nutritionNotice}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
