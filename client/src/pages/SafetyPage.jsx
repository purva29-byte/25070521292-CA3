import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Smartphone,
  Users,
} from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

const principles = [
  {
    icon: MapPin,
    title: 'Meet in a public campus space',
    text: 'Choose a busy, well-lit place such as a library entrance, canteen, or department lobby. Avoid isolated rooms, empty car parks, or meeting off campus with someone you do not know.',
  },
  {
    icon: Eye,
    title: 'Inspect before you pay',
    text: 'Test the calculator, open the textbook, check the lab kit, and confirm what is included. Do not rely only on photos or descriptions.',
  },
  {
    icon: Smartphone,
    title: 'Keep money and codes private',
    text: 'Never share OTPs, UPI PINs, passwords, banking details, or identity documents. A genuine student seller does not need them.',
  },
  {
    icon: MessageSquare,
    title: 'Keep the conversation on UniMarket',
    text: 'Listing-linked messages keep context available for moderation. Be cautious if someone insists on moving to another app immediately.',
  },
];

const campusSpots = [
  {
    name: 'Central Library Atrium',
    desc: 'High student traffic, monitored turnstiles, bright lighting.',
    img: '/images/places/library.jpg',
  },
  {
    name: 'Main Campus Canteen',
    desc: 'Open dining area during daytime breaks and lunch hours.',
    img: '/images/places/canteen.jpg',
  },
  {
    name: 'Academic Department Lobby',
    desc: 'Familiar department corridor with students and staff nearby.',
    img: '/images/places/atrium.jpg',
  },
  {
    name: 'Campus Security Hub',
    desc: 'Guarded main access point with 24/7 campus monitoring.',
    img: '/images/places/security.jpg',
  },
];

export default function SafetyPage() {
  useDocumentTitle('Safety guidelines');

  return (
    <div>
      <PageHeader
        kicker="Safety first"
        title="A safe exchange starts with a clear plan."
        description="UniMarket is a listing and messaging platform, not an escrow service. Buyers and sellers arrange and complete exchanges independently. These guidelines help you reduce risk."
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-ochre-100 bg-ochre-50 px-3 py-1.5 text-xs font-medium text-ochre-700">
          <AlertTriangle className="h-3.5 w-3.5" />
          UniMarket does not verify seller identity or process payments.
        </div>
      </PageHeader>

      <div className="container-page py-12 sm:py-16">
        <div className="grid gap-4 sm:grid-cols-2">
          {principles.map(({ icon: Icon, title, text }) => (
            <section key={title} className="card p-5 sm:p-6 transition hover:shadow-card">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-forest-50 text-forest-700">
                <Icon className="h-5 w-5" strokeWidth={1.7} />
              </span>
              <h2 className="mt-4 text-base font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">{text}</p>
            </section>
          ))}
        </div>

        {/* Visual Recommended Meetup Zones */}
        <section className="mt-12 rounded-3xl border border-line bg-paper p-6 sm:p-8 shadow-sm">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-forest-700">
              <MapPin className="h-3.5 w-3.5" /> Recommended Meetup Zones
            </span>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              Stick to busy, daytime campus spaces
            </h2>
            <p className="mt-1 text-sm text-muted">
              Here are typical student exchange spots that offer natural security, reliable visibility, and convenience:
            </p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {campusSpots.map((spot) => (
              <div
                key={spot.name}
                className="group overflow-hidden rounded-2xl border border-line bg-canvas transition duration-300 hover:-translate-y-1 hover:shadow-card"
              >
                <div className="aspect-[16/10] overflow-hidden bg-paper">
                  <img
                    src={spot.img}
                    alt={spot.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-108"
                    loading="lazy"
                  />
                </div>
                <div className="p-3.5">
                  <h3 className="text-sm font-semibold text-ink">{spot.name}</h3>
                  <p className="mt-1 text-xs leading-5 text-muted">{spot.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_0.9fr]">
          <section className="prose-page">
            <h2 className="!mt-0">A sensible in-person exchange</h2>
            <ol className="mt-5 list-decimal space-y-3 pl-5">
              <li>Message the seller through the listing and confirm that the item is still available.</li>
              <li>Ask about condition, accessories, edition, size, and any faults before meeting.</li>
              <li>Agree on a public campus location and a reasonable time during the day.</li>
              <li>Bring a friend if you feel uncertain, and tell someone where you are going.</li>
              <li>Inspect and test the item before handing over money.</li>
              <li>If something feels wrong, leave. You do not owe anyone a purchase.</li>
            </ol>

            <h2>Payments</h2>
            <p>
              UniMarket does not accept, hold, or release payments. Avoid paying in advance to an
              unknown seller, especially through unofficial links or QR codes. Cash or a normal
              person-to-person transfer after inspecting the item is usually safer.
            </p>

            <h2>Online safety</h2>
            <ul>
              <li>Never share your UniMarket password or a login OTP.</li>
              <li>Do not send screenshots of bank accounts, identity cards, or personal documents.</li>
              <li>Be wary of urgent requests, overpayment stories, refund scams, and “courier” links.</li>
              <li>Check that a listing is still approved and available before travelling.</li>
            </ul>

            <h2>Report a problem</h2>
            <p>
              Use the report button on a listing to flag prohibited items, scams, spam, or misleading
              descriptions. You can also email the project contact address for account issues.
              Reports are reviewed by administrators, but reporting does not guarantee removal or a
              particular outcome.
            </p>
          </section>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-forest-100 bg-forest-50 p-5 shadow-sm">
              <div className="flex items-center gap-2 text-forest-800">
                <ShieldCheck className="h-5 w-5" />
                <h2 className="text-sm font-semibold">Moderation, realistically</h2>
              </div>
              <ul className="mt-4 space-y-3 text-xs leading-5 text-forest-900/75">
                <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" /> New listings are reviewed before appearing publicly.</li>
                <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" /> Reports are stored for administrators to review.</li>
                <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" /> Removed listings disappear from public results.</li>
                <li className="flex gap-2"><AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> Moderation is not identity verification or a background check.</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-line bg-paper p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-forest-700" />
                <h2 className="text-sm font-semibold">If you feel unsafe</h2>
              </div>
              <p className="mt-2 text-xs leading-5 text-muted">
                Leave the situation and contact campus security or local emergency services if there
                is an immediate danger. Report the account or listing afterward so the platform can
                take appropriate action.
              </p>
            </div>

            <Link to="/contact" className="btn-secondary w-full">Contact the project team</Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
