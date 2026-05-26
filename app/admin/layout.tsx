import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Guard super admin only
  if (!session?.user || !(session.user as any).isSuperAdmin) {
    redirect("/dashboard");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-900 font-sans text-gray-100">
      {/* Sidebar */}
      <Sidebar user={session.user} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-gray-950">
        {/* Header */}
        <Header />

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 text-gray-100">
          {children}
        </main>
      </div>
    </div>
  );
}
