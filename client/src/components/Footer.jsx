import { Link } from 'react-router-dom';
import { Mail, ShieldCheck } from 'lucide-react';
import Logo from '../components/Logo.jsx';

const footerGroups = [
  {
    title: 'Marketplace',
    links: [
      { label: 'Browse listings', to: '/marketplace' },
      { label: 'Sell an item', to: '/sell' },
      { label: 'Favourites', to: '/favorites' },
      { label: 'Messages', to: '/messages' },
    ],
  },
  {
    title: 'UniMarket',
    links: [
      { label: 'About', to: '/about' },
      { label: 'Contact', to: '/contact' },
      { label: 'Safety guidelines', to: '/safety' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy policy', to: '/privacy' },
      { label: 'Terms of use', to: '/terms' },
    ],
  },
];

export default function Footer() {
  const contactEmail = import.meta.env.VITE_CONTACT_EMAIL || 'support@unimarket.example';

  return (
    <footer className="mt-24 border-t border-line bg-paper">
      <div className="container-page py-12 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_2fr]">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-4 text-sm leading-6 text-muted">
              A focused campus marketplace for used books, calculators, lab equipment, and the
              useful things students already own.
            </p>
            <div className="mt-5 flex items-start gap-2 rounded-xl bg-forest-50 p-3 text-xs leading-5 text-forest-800">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
              Meet in busy campus spaces, inspect items first, and never share OTPs or passwords.
            </div>
            <div className="mt-4 flex items-center gap-2.5">
              <div className="flex -space-x-1.5">
                <img src="/images/avatars/aarav.jpg" alt="" className="h-6 w-6 rounded-full object-cover ring-2 ring-paper" />
                <img src="/images/avatars/priya.jpg" alt="" className="h-6 w-6 rounded-full object-cover ring-2 ring-paper" />
                <img src="/images/avatars/rohan.jpg" alt="" className="h-6 w-6 rounded-full object-cover ring-2 ring-paper" />
              </div>
              <span className="text-[11px] text-muted">500+ campus exchanges across colleges</span>
            </div>
          </div>


          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {footerGroups.map((group) => (
              <div key={group.title}>
                <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-ink">
                  {group.title}
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {group.links.map((link) => (
                    <li key={link.to}>
                      <Link
                        to={link.to}
                        className="text-sm text-muted transition hover:text-forest-700"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-line pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} UniMarket. Built as a student project.</p>
          <a
            href={`mailto:${contactEmail}`}
            className="inline-flex items-center gap-1.5 transition hover:text-forest-700"
          >
            <Mail className="h-3.5 w-3.5" /> {contactEmail}
          </a>
        </div>
        <p className="mt-4 max-w-3xl text-[11px] leading-5 text-muted/80">
          UniMarket does not process payments and does not verify seller identity. Always arrange
          transactions independently and follow the safety guidance. Demo content is labelled in the
          project documentation.
        </p>
      </div>
    </footer>
  );
}
