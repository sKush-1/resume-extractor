import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <div className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo - simplified if needed, but keeping branding */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
              BP
            </div>
            <span className="font-semibold text-foreground">BulkParser.com</span>
          </div>

          {/* Content */}
          {children}
        </div>
      </div>

      <Footer />
    </div>
  );
}
