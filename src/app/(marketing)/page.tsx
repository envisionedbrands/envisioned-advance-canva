import { HeroSection } from '@/components/features/landing/hero-section';
import { FeaturesSection } from '@/components/features/landing/features-section';
import { PricingPreview } from '@/components/features/landing/pricing-preview';

export default function Home() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <PricingPreview />
    </>
  );
}
