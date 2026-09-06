import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Mail, MessageSquare, MapPin, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Contact Us - BulkParser.com',
    description: 'Get in touch with the BulkParser.com team for support, sales, or enterprise solutions.',
};

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />

            <main className="flex-grow py-20 md:py-32">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                        {/* Info */}
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                                Get in Touch
                            </h1>
                            <p className="text-xl text-muted-foreground mb-12">
                                Have questions about our platform or need a custom enterprise solution?
                                Our team is here to help you scale your recruitment.
                            </p>

                            <div className="space-y-8">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                        <Mail className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-foreground">Email</h3>
                                        <p className="text-muted-foreground">support@bulkparser.com</p>
                                        <p className="text-muted-foreground">sales@bulkparser.com</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                        <MessageSquare className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-foreground">Live Chat</h3>
                                        <p className="text-muted-foreground">Available Mon-Fri, 9am - 6pm EST</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                        <MapPin className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-foreground">Office</h3>
                                        <p className="text-muted-foreground">123 AI Boulevard, Tech City</p>
                                        <p className="text-muted-foreground">San Francisco, CA 94103</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Form */}
                        <div className="bg-muted/30 border border-border rounded-2xl p-8 shadow-sm">
                            <h2 className="text-2xl font-bold text-foreground mb-6">Send us a message</h2>
                            <form className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">First Name</label>
                                        <Input placeholder="John" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Last Name</label>
                                        <Input placeholder="Doe" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Email Address</label>
                                    <Input type="email" placeholder="john@example.com" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Subject</label>
                                    <Input placeholder="How can we help?" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Message</label>
                                    <Textarea placeholder="Tell us more about your needs..." className="min-h-[150px]" />
                                </div>
                                <Button className="w-full py-6 text-lg">Send Message</Button>
                            </form>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
