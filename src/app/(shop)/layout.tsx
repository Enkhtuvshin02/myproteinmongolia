import type { Metadata } from "next";
import { Golos_Text, Oswald } from "next/font/google";
import { Suspense } from "react";
import "../globals.css";
import { CartProvider } from "@/components/cart-context";
import { AccountProvider } from "@/components/account-context";
import { OrdersProvider } from "@/components/orders-context";
import { Header } from "@/components/header";
import { TopBar } from "@/components/top-bar";
import { Footer } from "@/components/footer";
import { CartDrawer } from "@/components/cart-drawer";
import { PromotionPopup } from "@/components/promotion-popup";

const golos = Golos_Text({
  variable: "--font-golos",
  subsets: ["latin", "cyrillic"],
});

const oswald = Oswald({
  variable: "--font-head",
  subsets: ["latin", "cyrillic"],
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  title: "MyProtein Mongolia — Уураг, спортын нэмэлт тэжээл",
  description: "Whey уураг, креатин, дасгалын өмнөх, амин хүчил, иж бүрдэл — фитнесийн нэмэлт тэжээлийн цахим дэлгүүр",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="mn" className={`${golos.variable} ${oswald.variable} h-full antialiased`}>
      <body className="shop-body flex min-h-full flex-col bg-background text-foreground">
        <AccountProvider>
          <OrdersProvider>
            <CartProvider>
              <TopBar />
              <Suspense fallback={<div className="h-[72px] border-b border-shop-line" />}>
                <Header />
              </Suspense>
              <main className="flex-1">{children}</main>
              <Footer />
              <CartDrawer />
              <PromotionPopup />
            </CartProvider>
          </OrdersProvider>
        </AccountProvider>
      </body>
    </html>
  );
}
