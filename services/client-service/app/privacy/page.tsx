import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Privacy Policy - BulkParser.com',
    description: 'Learn how we collect, use, and protect your data at BulkParser.com.',
};

export default function PrivacyPage() {
    const lastUpdated = "March 16, 2026";

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />

            <main className="flex-grow py-20 max-w-4xl mx-auto px-6">
                <h1 className="text-4xl font-bold text-foreground mb-4">Privacy Policy</h1>
                <p className="text-muted-foreground mb-12 italic">Last updated: {lastUpdated}</p>

                <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-foreground">1. Introduction</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            At BulkParser.com, we take your privacy seriously. This Privacy Policy explains how we collect,
                            use, disclose, and safeguard your information when you visit our website and use our
                            parsing services.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-foreground">2. Information Collection</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            We collect information that you provide directly to us when you:
                        </p>
                        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                            <li>Create an account or register for our services.</li>
                            <li>Upload resumes or documents for parsing.</li>
                            <li>Contact our support team or provide feedback.</li>
                            <li>Subscribe to our newsletter or communications.</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-foreground">3. Document Processing</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            When you upload resumes to BulkParser.com, the documents are processed using AI models
                            to extract structured data. We do not use your uploaded data to train our public models
                            without your explicit consent. Documents are stored securely and can be deleted by
                            the user at any time.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-foreground">4. Use of Information</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            We use the information we collect to:
                        </p>
                        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                            <li>Provide, operate, and maintain our services.</li>
                            <li>Improve and personalize your experience.</li>
                            <li>Process and analyze the resumes you upload.</li>
                            <li>Communicate with you about updates and support.</li>
                            <li>Detect and prevent fraud or abuse of our system.</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-foreground">5. Data Security</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            We implement industry-standard security measures to protect your personal information
                            and uploaded documents. However, no method of transmission over the internet or
                            electronic storage is 100% secure, and we cannot guarantee absolute security.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-foreground">6. Your Rights</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            You have the right to access, update, or delete your personal information. If you wish
                            to exercise these rights, please contact us or use the account management tools
                            provided in your dashboard.
                        </p>
                    </section>

                    <section className="space-y-4 text-center py-12">
                        <p className="text-sm border-t border-border pt-8 text-muted-foreground">
                            Questions about our privacy practices? Email us at privacy@bulkparser.com
                        </p>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
}
