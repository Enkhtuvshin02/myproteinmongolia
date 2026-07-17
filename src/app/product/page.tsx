import { Suspense } from "react";
import { ProductListing } from "@/components/product-listing";

export default function ProductPage() {
  return (
    <Suspense>
      <ProductListing />
    </Suspense>
  );
}
