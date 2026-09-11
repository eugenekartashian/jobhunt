import Image from 'next/image';
import type { ReactElement } from 'react';

import userIcon from '@/public/images/user-icon.png';

export function Testimonial(): ReactElement {
  return (
    <section className="border-b border-border bg-surface px-6 py-24 text-center sm:px-10">
      <div className="mx-auto max-w-4xl">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-accent">
          Success Stories
        </p>
        <blockquote className="mt-7 text-2xl font-semibold leading-9 text-text-dark sm:text-quote">
          &ldquo;I used to spend my evenings copy-pasting CVs. Now I open my
          dashboard to see interviews waiting. It feels like cheating. Had 3
          offers on the table simultaneously.&rdquo;
        </blockquote>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Image
            src={userIcon}
            alt="Job Hunt user portrait"
            width={48}
            height={48}
            className="size-12 rounded-md"
          />
          <div className="text-left">
            <p className="text-sm font-bold leading-5 text-text-primary">
              John Smith
            </p>
            <p className="text-xs font-medium leading-4 text-text-secondary">
              Senior Developer
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
