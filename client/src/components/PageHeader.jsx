import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function PageHeader({ kicker, title, description, children }) {
  return (
    <div className="border-b border-line bg-paper">
      <div className="container-page py-12 sm:py-16">
        <nav className="mb-6 text-xs text-muted" aria-label="Breadcrumb">
          <Link to="/" className="transition hover:text-forest-700">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-ink">{title}</span>
        </nav>
        <p className="section-kicker">{kicker}</p>
        <h1 className="mt-3 max-w-3xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl">{title}</h1>
        {description && <p className="mt-4 max-w-2xl text-sm leading-7 text-muted sm:text-base">{description}</p>}
        {children && <div className="mt-6">{children}</div>}
      </div>
    </div>
  );
}

export function InfoAction({ to, children }) {
  return (
    <Link to={to} className="btn-primary">
      {children} <ArrowRight className="h-4 w-4" />
    </Link>
  );
}
