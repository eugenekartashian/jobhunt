import type { ReactElement } from 'react';

import { BottomCta } from '@/components/homepage/BottomCta';
import { DashboardPreview } from '@/components/homepage/DashboardPreview';
import { FeatureShowcase } from '@/components/homepage/FeatureShowcase';
import { Hero } from '@/components/homepage/Hero';
import { Testimonial } from '@/components/homepage/Testimonial';
import { Navbar } from '@/components/layout/Navbar';
import { isUserAuthenticated } from '@/lib/insforge-auth';

const managePoints = [
  {
    title: 'Find roles that fit your goals',
    body: 'Search by position and place or add a job link. Review relevant opportunities without the noise.',
    accent: 'accent' as const
  },
  {
    title: 'Research before you reach out',
    body: 'Get useful context on each employer. Job Hunt reviews their public information so you can apply with a clearer picture.',
    accent: 'info' as const
  },
  {
    title: 'Keep your search organized',
    body: 'Save the opportunities you discover and follow your progress from one focused workspace.',
    accent: 'success' as const
  }
];

const confidencePoints = [
  {
    title: 'See your fit at a glance',
    body: 'Compare your profile with each opportunity before applying and understand where you are strongest.',
    accent: 'info' as const
  },
  {
    title: 'Match with roles that suit you',
    body: 'Job Hunt evaluates openings against your real experience, helping you prioritize the applications with the most promise.',
    accent: 'success' as const
  },
  {
    title: 'Spend time where it matters',
    body: 'Move past low-fit openings and concentrate on the roles worth your attention, so more time goes into applying.',
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
            title="A clearer way to manage your search"
            points={managePoints}
            image={{
              src: '/images/jobs-lists.png',
              alt: 'Job Hunt opportunity list with employers, match scores, salary ranges, and sources.',
              width: 2364,
              height: 1778
            }}
          />
          <FeatureShowcase
            title="Make every application count"
            points={confidencePoints}
            image={{
              src: '/images/some-log.png',
              alt: 'Job Hunt activity log showing automated search and filtering steps.',
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
        </div>
      </main>
    </>
  );
}
