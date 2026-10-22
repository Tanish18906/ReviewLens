import { Link } from 'react-router-dom';
import { PageShell } from '../components/PageShell';
import { HelpCircle, ArrowLeft } from 'lucide-react';

export function NotFoundPage() {
  return (
    <PageShell>
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
        <div className="w-16 h-16 rounded-full bg-muted/10 text-muted flex items-center justify-center mb-4">
          <HelpCircle className="w-8 h-8" />
        </div>
        <h1 className="text-[28px] font-bold text-ink mb-2">Page not found</h1>
        <p className="text-[15px] text-muted max-w-md mb-6">
          The requested page does not exist or has been moved in this prototype.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand hover:bg-brand-hover text-white text-[14px] font-medium rounded-control shadow-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to products
        </Link>
      </div>
    </PageShell>
  );
}
