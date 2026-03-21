import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Target, Users, Shield, Cpu } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'About Us - BulkParser.com',
    description: 'Learn about our mission to build the world\'s most intelligent and accessible resume parsing infrastructure.',
};

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />

            <main className="flex-grow">
                {/* Hero Section */}
                <section className="py-20 md:py-32 bg-muted/30">
                    <div className="max-w-4xl mx-auto px-6 text-center">
                        <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
                            Our Mission
                        </h1>
                        <p className="text-xl text-muted-foreground leading-relaxed">
                            At BulkParser.com, we believe that hiring should be powered by data, not paperwork.
                            Our mission is to build the world's most intelligent and accessible resume parsing
                            infrastructure, enabling teams to spend less time on administration and more time
                            connecting with great talent.
                        </p>
                    </div>
                </section>

                {/* Values Section */}
                <section className="py-20 max-w-6xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-4">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <Target className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-bold text-foreground">Precision First</h2>
                            <p className="text-muted-foreground">
                                We leverage state-of-the-art AI models to ensure that every comma and bullet point
                                is accurately captured and structured.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <Users className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-bold text-foreground">Human-Centric</h2>
                            <p className="text-muted-foreground">
                                Technology should serve people. Our tools are designed to be intuitive,
                                fast, and respectful of the privacy of candidates.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <Shield className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-bold text-foreground">Security Built-in</h2>
                            <p className="text-muted-foreground">
                                We maintain enterprise-grade security standards to protect sensitive
                                candidate data throughout the parsing pipeline.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <Cpu className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-bold text-foreground">AI Innovation</h2>
                            <p className="text-muted-foreground">
                                We are constantly evolving our models to handle complex layouts,
                                multiple languages, and diverse formats.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Team/Company Info */}
                <section className="py-20 bg-muted/30">
                    <div className="max-w-4xl mx-auto px-6 text-center">
                        <h2 className="text-3xl font-bold text-foreground mb-8">Trusted by Recruiters Worldwide</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 opacity-60 grayscale">
                            {/* Placeholders for logos if needed */}
                            <div className="font-bold text-xl">TECHCORP</div>
                            <div className="font-bold text-xl">HR SYSTEMS</div>
                            <div className="font-bold text-xl">GLOBAL HIRED</div>
                            <div className="font-bold text-xl">TALENTFLOW</div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
