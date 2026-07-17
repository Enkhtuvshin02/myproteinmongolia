import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { CartProvider } from "@/components/cart-context";
import { AccountProvider } from "@/components/account-context";
import { OrdersProvider } from "@/components/orders-context";
import { Header } from "@/components/header";
import { CategoryNav } from "@/components/category-nav";
import { Footer } from "@/components/footer";
import { CartDrawer } from "@/components/cart-drawer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"], // Mongolian uses Cyrillic
});

export const metadata: Metadata = {
  title: "GainHub — Уураг, спортын нэмэлт тэжээл",
  description: "Whey уураг, креатин, дасгалын өмнөх, амин хүчил, иж бүрдэл — фитнесийн нэмэлт тэжээлийн цахим дэлгүүр",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="mn" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <AccountProvider>
          <OrdersProvider>
            <CartProvider>
              <Suspense fallback={<div className="h-[68px] border-b border-border-subtle" />}>
                <Header />
              </Suspense>
              <CategoryNav />
              <main className="flex-1">{children}</main>
              <Footer />
              <CartDrawer />
            </CartProvider>
          </OrdersProvider>
        </AccountProvider>
      </body>
    </html>
  );
}
