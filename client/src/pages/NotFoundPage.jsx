import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

export default function NotFoundPage() {
  useDocumentTitle('Page not found');

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-16">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex justify-center">
          <img
            src="/images/illustrations/404-campus.svg"
            alt="404 Off Campus signpost"
            className="h-40 w-auto object-contain transition duration-300 hover:scale-105"
          />
        </div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-forest-700">404 Error</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">This page is off campus.</h1>
        <p className="mt-3 text-sm leading-7 text-muted">
          The link may be broken, or the listing or student profile may have been removed or relocated.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/" className="btn-secondary shadow-sm">
            <Home className="h-4 w-4" /> Return home
          </Link>
          <Link to="/marketplace" className="btn-primary shadow-sm">
            <Search className="h-4 w-4" /> Browse marketplace
          </Link>
        </div>
      </div>
    </div>
  );
}
