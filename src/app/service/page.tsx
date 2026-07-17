import { FileText } from "lucide-react";
import { TermsAccordion } from "./terms-accordion";

export const metadata = {
  title: "Үйлчилгээний нөхцөл — GainHub",
  description:
    "GainHub цахим худалдааны вэб сайтын үйлчилгээний нөхцөл, хэрэглэгчийн эрх үүрэг.",
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 pb-16">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-3">
        <div className="flex items-center gap-2 text-brand">
          <FileText className="size-5" />
          <span className="text-sm font-medium uppercase tracking-wide">
            Хууль эрхзүйн баримт бичиг
          </span>
        </div>
        <h1 className="text-3xl font-bold text-foreground">
          Үйлчилгээний нөхцөл
        </h1>
        <p className="text-sm text-muted-foreground">
          Сүүлд шинэчлэгдсэн: 2026 оны 06 дугаар сарын 13
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed border-l-2 border-brand pl-4">
          Та <strong>gainhub.mn</strong>-д нэвтрэх болон худалдан авалт хийхдээ
          доорх үйлчилгээний нөхцөлийг хүлээн зөвшөөрсөнд тооцно. Аливаа
          асуудал үүссэн тохиолдолд манай баг тантай холбогдоно.
        </p>
      </div>

      {/* Accordion sections */}
      <TermsAccordion />

      {/* Contact strip */}
      <div className="mt-10 rounded-xl bg-muted/50 border border-border-subtle p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm">
        <p className="text-muted-foreground">
          Үйлчилгээний нөхцөлтэй холбоотой асуулт байвал бидэнтэй холбоо
          барина уу.
        </p>
        <div className="flex flex-wrap gap-3 shrink-0">
          <a
            href="tel:77100100"
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover transition-colors"
          >
            77100100
          </a>
          <a
            href="mailto:info@gainhub.mn"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border-subtle bg-white px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
          >
            info@gainhub.mn
          </a>
        </div>
      </div>
    </main>
  );
}
