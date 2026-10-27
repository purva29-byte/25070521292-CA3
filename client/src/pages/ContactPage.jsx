import { Link } from 'react-router-dom';
import { Clock3, Flag, Mail, MessageSquare, ShieldCheck, Users } from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import Avatar from '../components/Avatar.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

export default function ContactPage() {
  useDocumentTitle('Contact');
  const email = import.meta.env.VITE_CONTACT_EMAIL || 'support@unimarket.example';

  return (
    <div>
      <PageHeader
        kicker="Contact"
        title="Talk to the UniMarket team."
        description="This is a student project, so support is best-effort. Use the right channel below so your message reaches someone who can help."
      />

      <div className="container-page py-12 sm:py-16">
        {/* Support team visual highlight */}
        <div className="relative mb-8 overflow-hidden rounded-3xl border border-line bg-gradient-to-r from-forest-900 to-forest-800 p-6 text-white sm:p-8 shadow-sm">
          <div className="absolute right-0 top-0 h-full w-1/3 opacity-20 hidden md:block">
            <img
              src="/images/backgrounds/study-group.jpg"
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
          <div className="relative max-w-xl">
            <div className="flex items-center gap-2 text-forest-200 text-xs font-semibold uppercase tracking-wider">
              <Users className="h-4 w-4" /> Student Support Desk
            </div>
            <h2 className="mt-2 text-xl font-bold sm:text-2xl">
              We're students building for students.
            </h2>
            <p className="mt-2 text-xs leading-6 text-forest-100/80 sm:text-sm">
              Need assistance with an account, listing moderation, or campus exchange guidance? We check in daily between lectures.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <div className="flex -space-x-2">
                <Avatar name="Aarav Mehta" size="sm" className="ring-2 ring-forest-900" />
                <Avatar name="Priya Nair" size="sm" className="ring-2 ring-forest-900" />
                <Avatar name="Rohan Kulkarni" size="sm" className="ring-2 ring-forest-900" />
                <Avatar name="Sana Khan" size="sm" className="ring-2 ring-forest-900" />
              </div>
              <span className="text-xs text-forest-200">Active campus moderators on duty</span>
            </div>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <div className="card p-6 md:col-span-2">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-forest-50 text-forest-700">
              <Mail className="h-5 w-5" />
            </span>
            <h2 className="mt-4 text-lg font-semibold">Email the project team</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              For account access questions, password-reset problems, accessibility feedback, or
              general project questions, email us. Include your UniMarket display name and the email
              on your account, but never send your password.
            </p>
            <a href={`mailto:${email}`} className="btn-primary mt-5 inline-flex items-center gap-2 shadow-sm">
              <Mail className="h-4 w-4" /> {email}
            </a>
            <p className="mt-3 text-[11px] text-muted">
              This link opens your email client directly.
            </p>
          </div>

          <div className="card p-6 flex flex-col justify-between">
            <div>
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-red-50 text-red-700">
                <Flag className="h-5 w-5" />
              </span>
              <h2 className="mt-4 text-base font-semibold">Report a listing</h2>
              <p className="mt-2 text-xs leading-5 text-muted">
                If a live listing looks misleading, prohibited, or suspicious, use its Report button.
                That creates a moderation record and keeps the listing context attached.
              </p>
            </div>
            <Link to="/marketplace" className="btn-secondary btn-sm mt-5">
              Browse listings
            </Link>
          </div>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-line bg-paper p-6 shadow-sm">
            <div className="flex items-center gap-2 text-forest-800">
              <ShieldCheck className="h-5 w-5" />
              <h2 className="text-sm font-semibold">Safety concerns</h2>
            </div>
            <p className="mt-3 text-xs leading-6 text-muted">
              If there is an immediate risk, contact campus security or local emergency services
              first. You can report the account or listing afterward for platform moderation.
            </p>
            <Link to="/safety" className="link mt-3 inline-block text-xs font-semibold">
              Read safety guidance
            </Link>
          </div>

          <div className="rounded-2xl border border-line bg-paper p-6 shadow-sm">
            <div className="flex items-center gap-2 text-forest-800">
              <Clock3 className="h-5 w-5" />
              <h2 className="text-sm font-semibold">Response expectations</h2>
            </div>
            <p className="mt-3 text-xs leading-6 text-muted">
              This project is not a commercial service and does not promise a fixed response time.
              Password reset emails only work when the server owner has configured SMTP.
            </p>
            <Link to="/forgot-password" className="link mt-3 inline-block text-xs font-semibold">
              Password reset
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
