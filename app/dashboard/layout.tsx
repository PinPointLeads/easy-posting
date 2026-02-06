import { AuthButton } from "@/components/auth-button";
import { DashboardHeader } from "@/components/dashboard-header";
import { Suspense } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col items-center">
        <DashboardHeader>
          <Suspense>
            <AuthButton />
          </Suspense>
        </DashboardHeader>
        <div className="flex-1 w-full max-w-5xl p-5">{children}</div>
      </div>
    </main>
  );
}
