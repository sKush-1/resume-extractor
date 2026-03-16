import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Footer } from '@/components/layout/footer';
import { CheckCircle2, Zap, BarChart3, FileText, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border sticky top-0 z-40 bg-background/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
              BP
            </div>
            <span className="font-semibold text-foreground">BulkParser.com</span>
          </div>
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

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 py-20 md:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Parse Resumes with <span className="text-primary">AI Power</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Automatically extract structured data from resumes. Save time, reduce errors, and hire better candidates with our intelligent resume parsing platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild>
                <Link href="/auth/signup">
                  Start Free Trial
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#features">Learn More</Link>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-6">
              No credit card required. Get started in minutes.
            </p>
          </div>
          <div className="hidden lg:block">
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-8 border border-border">
              <div className="bg-background rounded-lg p-6 border border-border space-y-4">
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded-full w-3/4"></div>
                  <div className="h-3 bg-muted rounded-full w-4/5"></div>
                  <div className="h-3 bg-muted rounded-full w-2/3"></div>
                </div>
                <div className="pt-4 border-t border-border space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                    <span className="text-sm text-foreground">Skills extracted</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                    <span className="text-sm text-foreground">Experience parsed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                    <span className="text-sm text-foreground">Data validated</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-muted border-y border-border py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Powerful Features
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to process and manage resumes at scale
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: FileText,
                title: 'Batch Processing',
                description: 'Upload hundreds of resumes at once and process them in parallel',
              },
              {
                icon: Zap,
                title: 'Real-time Status',
                description: 'Monitor processing progress and get instant notifications',
              },
              {
                icon: BarChart3,
                title: 'Structured Data',
                description: 'Extract skills, experience, education, and contact info automatically',
              },
              {
                icon: CheckCircle2,
                title: 'Easy Exports',
                description: 'Download results as Excel, CSV, or JSON formats',
              },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-background rounded-xl border border-border p-6 hover:border-primary/50 transition-colors"
                >
                  <Icon className="w-8 h-8 text-primary mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get started in three simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              step: '01',
              title: 'Upload Resumes',
              description:
                'Drag and drop your PDF or Word resumes, or upload them in bulk',
            },
            {
              step: '02',
              title: 'Parse & Extract',
              description:
                'Our AI engine automatically extracts all structured data from each resume',
            },
            {
              step: '03',
              title: 'Export & Use',
              description:
                'Download results in your preferred format and integrate with your system',
            },
          ].map((item, index) => (
            <div key={index} className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl mb-6">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {item.title}
                </h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
              {index < 2 && (
                <div className="hidden md:block absolute top-8 -right-12 w-24 h-1 bg-gradient-to-r from-primary to-transparent"></div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="bg-muted border-y border-border py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Simple Pricing
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that fits your needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Starter',
                price: '$99',
                description: 'Perfect for small teams',
                features: [
                  'Up to 100 resumes/month',
                  'Basic data extraction',
                  'Email support',
                  'CSV exports',
                ],
              },
              {
                name: 'Professional',
                price: '$499',
                description: 'For growing companies',
                features: [
                  'Up to 1,000 resumes/month',
                  'Advanced extraction',
                  'Priority support',
                  'All export formats',
                  'Custom integrations',
                ],
                highlight: true,
              },
              {
                name: 'Enterprise',
                price: 'Custom',
                description: 'Unlimited processing',
                features: [
                  'Unlimited resumes',
                  'API access',
                  'Dedicated support',
                  'SLA guaranteed',
                  'Custom deployment',
                ],
              },
            ].map((plan, index) => (
              <div
                key={index}
                className={`rounded-xl border p-8 ${plan.highlight
                    ? 'border-primary bg-primary/5 relative'
                    : 'border-border bg-background'
                  }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
                    Popular
                  </div>
                )}
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {plan.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  {plan.description}
                </p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-foreground">
                    {plan.price}
                  </span>
                  {plan.price !== 'Custom' && (
                    <span className="text-muted-foreground">/month</span>
                  )}
                </div>
                <Button
                  asChild
                  variant={plan.highlight ? 'default' : 'outline'}
                  className="w-full mb-8"
                >
                  <Link href="/auth/signup">Get Started</Link>
                </Button>
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="bg-primary text-primary-foreground rounded-2xl p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Hiring?
          </h2>
          <p className="text-lg mb-8 text-primary-foreground/90 max-w-2xl mx-auto">
            Join hundreds of companies that trust BulkParser.com to streamline their recruitment process.
          </p>
          <Button asChild size="lg" variant="secondary">
            <Link href="/auth/signup">
              Start Your Free Trial
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
