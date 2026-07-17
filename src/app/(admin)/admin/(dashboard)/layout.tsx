import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth-utils";
import { AdminNav } from "./AdminNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  return (
    <div className="flex min-h-screen bg-muted/50">
      <aside className="flex w-56 shrink-0 flex-col border-r border-border-subtle bg-background">
        <div className="border-b border-border-subtle px-5 py-4">
          <span className="text-lg font-bold tracking-tight">
            <span className="text-brand">MyProtein</span> Admin
          </span>
        </div>
        <AdminNav />
      </aside>
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  );
}
