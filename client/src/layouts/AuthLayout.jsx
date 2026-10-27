import { Link, Outlet } from 'react-router-dom';
import { ArrowLeft, BookOpenCheck, ShieldCheck, Users } from 'lucide-react';
import Logo from '../components/Logo.jsx';

const points = [
  { icon: BookOpenCheck, text: 'Academic materials and campus essentials in one focused place.' },
  { icon: Users, text: 'Student-to-student conversations, without sharing private contact details.' },
  { icon: ShieldCheck, text: 'Moderation checks and clear safety reminders for in-person exchanges.' },
];

export default function AuthLayout() {
  return (
    <div className="grid min-h-screen bg-canvas lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden border-r border-line bg-forest-700 p-12 lg:flex lg:flex-col">
        <div className="absolute inset-0 opacity-20" aria-hidden="true">
          <div className="absolute -right-24 top-10 h-80 w-80 rounded-full border-[40px] border-forest-300" />
          <div className="absolute -bottom-16 -left-10 h-72 w-72 rounded-full border-[28px] border-forest-400" />
        </div>
        <div className="relative">
          <Logo to="/" />
        </div>
        <div className="relative my-auto max-w-lg">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-forest-200">
            Smart deals. Student to student.
          </p>
          <h1 className="mt-5 text-4xl font-semibold leading-[1.12] tracking-tight text-white xl:text-5xl">
            The useful things you need, already on campus.
          </h1>
          <p className="mt-5 text-sm leading-7 text-forest-100/85">
            Buy and sell textbooks, calculators, drawing kits, and hostel essentials with students
            from your own campus community.
          </p>
          <div className="mt-9 space-y-4">
            {points.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-start gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/10">
                  <Icon className="h-4 w-4 text-forest-100" />
                </span>
                <p className="pt-1 text-sm leading-6 text-forest-100/85">{text}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-xs text-forest-200/70">
          UniMarket never processes payments or asks for your banking credentials.
        </p>
      </aside>

      <div className="flex min-h-screen flex-col">
        <div className="flex items-center justify-between px-5 py-5 sm:px-8">
          <Logo className="lg:invisible" />
          <Link
            to="/marketplace"
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted transition hover:text-forest-700"
          >
            <ArrowLeft className="h-4 w-4" /> Browse listings
          </Link>
        </div>
        <main id="main-content" className="flex flex-1 items-center justify-center px-5 py-8 sm:px-8">
          <div className="w-full max-w-md">
            <Outlet />
          </div>
        </main>
        <div className="px-5 py-5 text-center text-xs text-muted sm:px-8">
          By using UniMarket you agree to our{' '}
          <Link to="/terms" className="link">
            terms
          </Link>{' '}
          and{' '}
          <Link to="/safety" className="link">
            safety guidelines
          </Link>
          .
        </div>
      </div>
    </div>
  );
}
