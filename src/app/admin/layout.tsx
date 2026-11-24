import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/admin-sidebar";
import { getCurrentUser } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?from=/admin");
  if (user.role !== "ADMIN") redirect("/login");

  return (
    <div className="flex min-h-screen bg-smoke-50">
      <AdminSidebar adminName={user.name} />
      <div className="flex-1 overflow-x-hidden">
        <main className="mx-auto max-w-6xl px-4 py-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}
