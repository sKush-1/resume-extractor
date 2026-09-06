import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function Navbar() {
    return (
        <nav className="border-b border-border sticky top-0 z-40 bg-background/95 backdrop-blur">
            <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                        BP
                    </div>
                    <span className="font-semibold text-foreground">BulkParser.com</span>
                </Link>
                <div className="flex items-center gap-4">
                    <Link
                        href="/auth/login"
                        className="text-sm text-foreground hover:text-muted-foreground transition-colors"
                    >
                        Sign In
                    </Link>
                    <Button asChild>
                        <Link href="/auth/signup">Get Started</Link>
                    </Button>
                </div>
            </div>
        </nav>
    );
}
