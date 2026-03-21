import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Terms of Service - BulkParser.com',
    description: 'Read the terms and conditions for using the BulkParser.com platform.',
};

export default function TermsPage() {
    const lastUpdated = "March 16, 2026";

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />

            <main className="flex-grow py-20 max-w-4xl mx-auto px-6">
                <h1 className="text-4xl font-bold text-foreground mb-4">Terms and Conditions</h1>
                <p className="text-muted-foreground mb-12 italic">Last updated: {lastUpdated}</p>

                <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-foreground">1. Introduction</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Welcome to BulkParser.com. By using our website and services, you agree to comply with
                            and be bound by the following terms and conditions. Please read these terms carefully
                            before using our platform.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-foreground">2. Description of Service</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            BulkParser.com provides an AI-powered resume parsing and extraction service. Users can
                            upload resumes in various formats to extract structured data. We reserves the right to
                            modify or discontinue the service at any time.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-foreground">3. User Responsibility</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            You are responsible for maintaining the confidentiality of your account and for all
                            activities that occur under your account. You agree to use the service only for lawful
                            purposes and in a way that does not infringe on the rights of others.
                            We strictly enforce identity limits. Each user is allowed a maximum of 2 accounts.
                            Attempts to bypass these limits via IP spoofing or fingerprint manipulation may result
                            in immediate termination of access.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-foreground">4. Data Privacy</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Your privacy is important to us. Our Privacy Policy explains how we collect, use, and
                            protect candidate data. By using the service, you consent to the processing of
                            uploaded documents as described in our policy.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-foreground">5. Limitation of Liability</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            BulkParser.com is provided "as is" without any warranties. We shall not be liable for
                            any indirect, incidental, or consequential damages arising from the use of our services.
                        </p>
                    </section>

                    <section className="space-y-4 text-center py-12">
                        <p className="text-sm border-t border-border pt-8 text-muted-foreground">
                            Questions about our terms? Email us at legacy@bulkparser.com
                        </p>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
}
