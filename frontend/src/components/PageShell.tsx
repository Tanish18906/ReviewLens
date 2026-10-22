import React from 'react';
import { Header } from './Header';

interface PageShellProps {
  children: React.ReactNode;
  containerClass?: string;
  hideFooter?: boolean;
}

export function PageShell({ children, containerClass = 'max-w-container', hideFooter = false }: PageShellProps) {
  return (
    <div className="min-h-screen flex flex-col bg-page text-ink selection:bg-brand/20">
      <Header />
      <main className={`flex-1 w-full mx-auto px-4 sm:px-6 py-8 ${containerClass}`}>
        {children}
      </main>
      {!hideFooter && (
        <footer className="bg-surface border-t border-border py-6 mt-auto">
          <div className="max-w-container mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[13px] text-muted">
            <div>
              <span className="font-semibold text-ink">ReviewLens</span> · Semester 3 academic prototype
            </div>
            <div className="text-center sm:text-right">
              Sample data for demonstration · Pure local deployment
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
