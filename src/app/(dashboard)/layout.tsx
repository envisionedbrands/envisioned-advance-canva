import { requireAuth } from '@/lib/auth/server';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Require authentication for all dashboard routes
  const user = await requireAuth();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Main content area - no sidebar, full canvas space */}
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
