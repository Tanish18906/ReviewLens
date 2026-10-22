import React from 'react';
import { Header } from './Header';
import { Heart } from 'lucide-react';

interface PageShellProps {
  children: React.ReactNode;
  containerClass?: string;
  hideFooter?: boolean;
}

export function PageShell({ children, containerClass = 'max-w-container', hideFooter = false }: PageShellProps) {
  return (
    <div className="min-h-screen flex flex-col bg-page text-ink selection:bg-brand-subtle selection:text-brand">
      <Header />
      <main className={`flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10 ${containerClass}`}>
        {children}
      </main>
      {!hideFooter && (
        <footer className="bg-surface border-t border-border py-8 mt-auto transition-colors">
          <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] text-muted">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-ink font-heading text-[14px]">Blush &amp; Bloom</span>
              <span>—</span>
              <span className="font-medium">Powered by ReviewLens</span>
              <span>·</span>
              <span className="font-semibold text-brand">Semester 3 Academic Prototype</span>
            </div>
            <div className="text-center sm:text-right text-[12px] max-w-md text-muted/90 flex items-center gap-1.5 justify-center sm:justify-end">
              <span>Crafted for curated plushies, fragrances, cosmetics &amp; accessories review research.</span>
              <Heart className="w-3.5 h-3.5 text-brand fill-brand flex-shrink-0" />
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
