import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  Database,
  GraduationCap,
  HeartHandshake,
  MapPin,
  Recycle,
  ShieldCheck,
  Users,
} from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import Avatar from '../components/Avatar.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

const studentTeam = [
  {
    name: 'Aarav Mehta',
    role: 'Computer Science · Year 3',
    college: "St. Xavier's College",
    avatar: '/images/avatars/aarav.jpg',
    bio: 'Focuses on textbook exchange curation and frontend usability.',
  },
  {
    name: 'Priya Nair',
    role: 'Mechanical Eng. · Year 2',
    college: 'College of Engineering, Pune',
    avatar: '/images/avatars/priya.jpg',
    bio: 'Helps organize engineering instruments and workshop tool recycling.',
  },
  {
    name: 'Rohan Kulkarni',
    role: 'Electronics Eng. · Final Year',
    college: 'VJTI Mumbai',
    avatar: '/images/avatars/rohan.jpg',
    bio: 'Leads calculator verification and electronics category moderation.',
  },
  {
    name: 'Sana Khan',
    role: 'Chemistry · Year 3',
    college: 'Fergusson College',
    avatar: '/images/avatars/sana.jpg',
    bio: 'Coordinates laboratory coat and practical apparatus guidelines.',
  },
];

export default function AboutPage() {
  useDocumentTitle('About');

  return (
    <div>
      <PageHeader
        kicker="About UniMarket"
        title="A focused marketplace for campus life."
        description="UniMarket helps college students buy and sell the academic and hostel items that are useful for a semester, then often sit unused afterward."
      />

      <div className="container-page py-12 sm:py-16">
        {/* Visual Hero Banner */}
        <div className="relative mb-14 overflow-hidden rounded-3xl border border-line shadow-card">
          <div className="relative aspect-[21/9] min-h-[260px] w-full">
            <img
              src="/images/backgrounds/study-group.jpg"
              alt="Students collaborating on campus"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-forest-950/90 via-forest-900/80 to-transparent" />
            <div className="absolute inset-y-0 left-0 flex max-w-xl flex-col justify-center p-6 text-white sm:p-10">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-forest-200">
                <Recycle className="h-4 w-4" /> The Campus Circular Economy
              </span>
              <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
                Giving semester essentials a second, third, and fourth life.
              </h2>
              <p className="mt-3 text-xs leading-6 text-forest-100/80 sm:text-sm">
                From data structures textbooks to drafting drafters, keeping items in circulation
                cuts expenses and reduces campus waste.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="prose-page">
            <h2 className="!mt-0">The problem</h2>
            <p>
              Students need affordable textbooks, calculators, drafting tools, lab equipment, and
              small hostel essentials. At the same time, other students have exactly those items
              sitting unused after a course ends. Generic classifieds are noisy, and sharing personal
              phone numbers across informal group chats can feel uncomfortable.
            </p>

            <h2>What we built</h2>
            <p>
              UniMarket combines approved listings, category search, favourites, listing-linked
              messaging, and a moderation workflow in one place. New posts enter a review queue, and
              students can report suspicious content. The platform does not process payments or
              promise delivery.
            </p>

            <h2>What we deliberately do not claim</h2>
            <ul>
              <li>We do not verify that a user is a student at a particular college.</li>
              <li>We do not guarantee that a seller or item is safe.</li>
              <li>We do not hold money or resolve refunds.</li>
              <li>We do not display fabricated testimonials or invented usage statistics.</li>
            </ul>

            <h2>Demo project note</h2>
            <p>
              This is a full-stack college project. The marketplace visible after running the seed
              script contains clearly documented demo accounts and demo listings. Real listings
              created through the app are persisted in MongoDB alongside them.
            </p>
          </div>

          <div className="space-y-6">
            <div className="relative overflow-hidden rounded-3xl bg-forest-700 p-7 text-white shadow-sm">
              <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-forest-600/50" />
              <p className="relative text-xs font-semibold uppercase tracking-[0.2em] text-forest-200">The idea</p>
              <p className="relative mt-4 text-2xl font-semibold leading-snug">
                Useful items should move between students, not disappear into cupboards.
              </p>
              <div className="relative mt-6 flex items-center gap-2 text-xs text-forest-100/75">
                <MapPin className="h-4 w-4" /> Campus-first, not nationwide classifieds.
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { icon: Users, title: 'Student accounts', text: 'Role-based access for students and administrators.' },
                { icon: ShieldCheck, title: 'Moderated listings', text: 'Approval, rejection, removal, and an audit trail.' },
                { icon: BookOpenCheck, title: 'Academic focus', text: 'Seven categories built around campus needs.' },
                { icon: Database, title: 'Real persistence', text: 'React talks to Express, Express uses Mongoose, MongoDB stores the data.' },
              ].map(({ icon: Icon, title, text }) => (
                <div key={title} className="card p-4 transition duration-200 hover:border-forest-200 hover:shadow-sm">
                  <Icon className="h-4 w-4 text-forest-700" />
                  <h3 className="mt-3 text-sm font-semibold">{title}</h3>
                  <p className="mt-1 text-[11px] leading-5 text-muted">{text}</p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-line bg-paper p-5 text-sm text-muted shadow-sm">
              <p className="font-semibold text-ink">Want to explore?</p>
              <p className="mt-1 text-xs leading-5">Browse live demo listings or read the safety guidance before arranging an exchange.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link to="/marketplace" className="btn-primary btn-sm">
                  Marketplace <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link to="/safety" className="btn-secondary btn-sm">
                  Safety guidelines
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Student Ambassador / Team Section */}
        <section className="mt-16 border-t border-line pt-12">
          <div className="max-w-2xl">
            <p className="section-kicker">Campus contributors</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Meet our student team and ambassadors
            </h2>
            <p className="mt-2 text-sm text-muted">
              Active student contributors helping moderate listings, test workflows, and keep UniMarket safe.
            </p>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {studentTeam.map((member) => (
              <div
                key={member.name}
                className="card flex flex-col items-center p-5 text-center transition duration-200 hover:-translate-y-1 hover:shadow-card"
              >
                <Avatar name={member.name} src={member.avatar} size="xl" className="ring-4 ring-forest-50" />
                <h3 className="mt-4 text-sm font-semibold text-ink">{member.name}</h3>
                <p className="text-[11px] font-medium text-forest-700">{member.role}</p>
                <p className="mt-0.5 text-[10px] text-muted">{member.college}</p>
                <p className="mt-3 text-xs leading-5 text-muted/90">{member.bio}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
