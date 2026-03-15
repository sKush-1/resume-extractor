import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Header />
      <main className="lg:ml-64 pt-16">
        {children}
      </main>
    </div>
  );
}
