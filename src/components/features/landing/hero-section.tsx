import { Button } from '@/components/ui/button';
import { ArrowRight, Play } from 'lucide-react';
import Link from 'next/link';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background py-20 sm:py-32">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
      
      <div className="container relative">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium mb-8 animate-fade-in">
            <span className="mr-2">🚀</span>
            New: Advanced Analytics Dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </div>

          {/* Main headline */}
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl mb-6 animate-fade-in">
            Build Your{' '}
            <span className="gradient-text">
              SaaS Application
            </span>{' '}
            Faster Than Ever
          </h1>

          {/* Subtitle */}
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl mb-10 animate-fade-in">
            Complete SaaS foundation with authentication, payments, analytics, and API management. 
            Deploy in minutes, not months.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-in">
            <Button size="lg" className="text-lg px-8 py-6" asChild>
              <Link href="/auth/signup">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6" asChild>
              <Link href="#demo">
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Link>
            </Button>
          </div>

          {/* Social proof */}
          <div className="animate-fade-in">
            <p className="text-sm text-muted-foreground mb-6">
              Trusted by 10,000+ developers and growing
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              {/* Placeholder for company logos */}
              <div className="h-8 w-24 bg-muted rounded flex items-center justify-center text-xs font-medium">
                Company A
              </div>
              <div className="h-8 w-24 bg-muted rounded flex items-center justify-center text-xs font-medium">
                Company B
              </div>
              <div className="h-8 w-24 bg-muted rounded flex items-center justify-center text-xs font-medium">
                Company C
              </div>
              <div className="h-8 w-24 bg-muted rounded flex items-center justify-center text-xs font-medium">
                Company D
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-12">
        <div className="h-32 w-32 rounded-full bg-primary/20 blur-3xl" />
      </div>
      <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12">
        <div className="h-32 w-32 rounded-full bg-accent/20 blur-3xl" />
      </div>
    </section>
  );
}