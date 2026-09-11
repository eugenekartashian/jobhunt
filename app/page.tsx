import type { ReactElement } from 'react';

import { BottomCta } from '@/components/homepage/BottomCta';
import { DashboardPreview } from '@/components/homepage/DashboardPreview';
import { FeatureShowcase } from '@/components/homepage/FeatureShowcase';
import { Hero } from '@/components/homepage/Hero';
import { Testimonial } from '@/components/homepage/Testimonial';
import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { isUserAuthenticated } from '@/lib/insforge-auth';

const managePoints = [
  {
    title: 'Find jobs that actually fit',
    body: 'Search by title and location or paste a job link. Get matched roles you can quickly scan.',
    accent: 'accent' as const
  },
  {
    title: 'Know the Company Before You Apply',
    body: 'Stop guessing what a company is about. Job Hunt browses their site and gives you everything you need to apply with confidence.',
    accent: 'info' as const
  },
  {
    title: 'Keep track of every application',
    body: "Keep a clear view of every job you've found, tailored. Your activity and progress all stay in one simple place.",
    accent: 'success' as const
  }
];

const confidencePoints = [
  {
    title: 'Understand your match score',
    body: "See how your profile lines up with each role before you apply. Get a clear breakdown of what fits and what's missing.",
    accent: 'info' as const
  },
  {
    title: 'AI-Powered Job Matching',
    body: 'Stop guessing which jobs are worth applying to. Job Hunt scores every role against your actual skills so you focus on the ones that matter.',
    accent: 'success' as const
  },
  {
    title: 'Focus on the right roles',
    body: 'Filter out low fit jobs and stay on the ones that actually matter. Spend less time sorting and more time applying.',
    accent: 'accent' as const
  }
];

export const dynamic = 'force-dynamic';

export default async function Home(): Promise<ReactElement> {
  const isAuthenticated = await isUserAuthenticated();
  const ctaHref = isAuthenticated ? '/profile' : '/login';
  const ctaLabel = isAuthenticated ? 'Profile' : 'Start for free';

  return (
    <>
      <Navbar ctaHref={ctaHref} ctaLabel={ctaLabel} />
      <main className="mx-auto w-full max-w-page px-6 py-12 sm:px-8 lg:px-20">
        <div className="overflow-hidden border border-border bg-surface">
          <Hero
            primaryHref={ctaHref}
            primaryLabel={isAuthenticated ? 'Go to Profile' : 'Get Started'}
          />
          <DashboardPreview />
          <div className="bg-subtle-stripes h-20 border-b border-border" />
          <FeatureShowcase
            title="Manage Your Job Search With Ease"
            points={managePoints}
            image={{
              src: '/images/jobs-lists.png',
              alt: 'A Job Hunt job list with company names, match score bars, salary estimates, and source badges.',
              width: 2364,
              height: 1778
            }}
          />
          <FeatureShowcase
            title="Apply With More Confidence, Every Time"
            points={confidencePoints}
            image={{
              src: '/images/some-log.png',
              alt: 'A Job Hunt agent log showing scan, filter, and action steps for job applications.',
              width: 2144,
              height: 1656
            }}
            imageFirst
          />
          <div className="bg-subtle-stripes h-20 border-b border-border" />
          <Testimonial />
          <div className="bg-subtle-stripes h-20 border-b border-border" />
          <BottomCta
            primaryHref={ctaHref}
            primaryLabel={isAuthenticated ? 'Go to Profile' : 'Get Started'}
          />
          <div className="bg-subtle-stripes h-20 border-b border-border" />
          <Footer />
        </div>
      </main>
    </>
  );
}
