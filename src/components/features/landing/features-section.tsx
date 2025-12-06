import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, CreditCard, BarChart3, Zap } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Authentication & Security',
    description: 'Complete user management with OAuth, 2FA, and enterprise-grade security features built-in.',
    features: ['OAuth Integration', 'Two-Factor Authentication', 'Role-Based Access', 'Session Management'],
  },
  {
    icon: CreditCard,
    title: 'Payment Processing',
    description: 'Stripe integration with subscription management, invoicing, and tax compliance out of the box.',
    features: ['Subscription Billing', 'One-time Payments', 'Tax Compliance', 'Invoice Generation'],
  },
  {
    icon: BarChart3,
    title: 'Analytics & Insights',
    description: 'Comprehensive dashboard with user analytics, revenue tracking, and performance metrics.',
    features: ['User Analytics', 'Revenue Tracking', 'Performance Metrics', 'Custom Reports'],
  },
  {
    icon: Zap,
    title: 'API Management',
    description: 'RESTful APIs with rate limiting, authentication, and comprehensive documentation.',
    features: ['Rate Limiting', 'API Authentication', 'Auto Documentation', 'Webhook Support'],
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 sm:py-32">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Everything You Need to Build a{' '}
            <span className="gradient-text">Modern SaaS</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Skip the boilerplate and focus on your unique features. Our foundation includes all the essentials.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature) => (
            <Card key={feature.title} className="relative group hover:shadow-glow transition-all duration-300">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base mb-4">
                  {feature.description}
                </CardDescription>
                <ul className="space-y-2">
                  {feature.features.map((item) => (
                    <li key={item} className="flex items-center text-sm text-muted-foreground">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary mr-3" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional features grid */}
        <div className="mt-20">
          <h3 className="text-2xl font-bold text-center mb-12">
            Plus Many More Features
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              'TypeScript Support',
              'Responsive Design',
              'Dark Mode',
              'Email Templates',
              'File Upload',
              'Database Integration',
              'Caching Layer',
              'Error Tracking',
              'Performance Monitoring',
              'SEO Optimization',
              'i18n Ready',
              'Component Library',
            ].map((feature) => (
              <div key={feature} className="flex items-center p-4 rounded-lg border bg-card">
                <div className="h-2 w-2 rounded-full bg-primary mr-3" />
                <span className="text-sm font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}