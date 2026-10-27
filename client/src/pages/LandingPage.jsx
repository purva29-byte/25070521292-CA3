import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpenCheck,
  Calculator,
  CheckCircle2,
  Eye,
  GraduationCap,
  Handshake,
  MapPin,
  MessageCircle,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import SearchBar from '../components/SearchBar.jsx';
import ListingGrid from '../components/ListingGrid.jsx';
import { ListingGridSkeleton } from '../components/LoadingSkeleton.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Avatar from '../components/Avatar.jsx';
import { useListings } from '../hooks/useListings.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { listingService } from '../services/listingService.js';
import {
  categoryIcon,
  categoryTint,
  categoryImage,
  categoryDescription,
} from '../utils/categoryMeta.js';
import { imageUrl, formatCurrency } from '../utils/format.js';
import { CATEGORIES } from '../utils/constants.js';

const steps = [
  {
    icon: Search,
    title: 'Discover an item',
    text: 'Search by name, category, condition, and price. Every result comes from a real student listing.',
  },
  {
    icon: MessageCircle,
    title: 'Contact the seller',
    text: 'Ask about condition, what is included, or whether the price is flexible — all inside UniMarket.',
  },
  {
    icon: Handshake,
    title: 'Meet safely on campus',
    text: 'Agree on a busy, well-lit campus spot, inspect the item first, and exchange in person.',
  },
];

const benefits = [
  {
    icon: GraduationCap,
    title: 'Built for campus life',
    text: 'Textbooks, calculators, drafting tools, lab gear, and hostel essentials — not a general classifieds feed.',
  },
  {
    icon: ShieldCheck,
    title: 'Moderated, not unsupervised',
    text: 'New listings enter a review queue. Reports go to moderators who can remove unsafe or misleading posts.',
  },
  {
    icon: Users,
    title: 'Conversations stay in one place',
    text: 'Ask questions through listing-linked chats. Your email and password are never shown on your public profile.',
  },
];

const testimonials = [
  {
    name: 'Aarav Mehta',
    college: "St. Xavier's College",
    department: 'Computer Science',
    avatar: '/images/avatars/aarav.jpg',
    text: 'Sold my semester 3 algorithms book to a junior within two days of posting. We met right at the campus library steps — no courier delays or fees.',
    item: 'Algorithms CLRS (3rd Edition)',
    rating: 5,
  },
  {
    name: 'Priya Nair',
    college: 'College of Engineering, Pune',
    department: 'Mechanical Eng.',
    avatar: '/images/avatars/priya.jpg',
    text: 'Picked up a complete drawing kit and mini drafter for first year at less than half the bookstore cost. Everything was in great condition!',
    item: 'Engineering Drawing Kit',
    rating: 5,
  },
  {
    name: 'Rohan Kulkarni',
    college: 'VJTI Mumbai',
    department: 'Electronics Eng.',
    avatar: '/images/avatars/rohan.jpg',
    text: 'Found a Casio Classwiz right before our semester exams without waiting days for delivery. Listing-linked chat made coordinating effortless.',
    item: 'Casio FX-991EX Calculator',
    rating: 5,
  },
];

const campusSpots = [
  { name: 'Central Library', desc: 'Well-lit entrance & lobby', img: '/images/places/library.jpg' },
  { name: 'Campus Cafeteria', desc: 'Busy daytime meeting spot', img: '/images/places/canteen.jpg' },
  { name: 'Department Atrium', desc: 'Familiar academic building', img: '/images/places/atrium.jpg' },
  { name: 'Campus Security Hub', desc: 'Monitored public area', img: '/images/places/security.jpg' },
];

export default function LandingPage() {
  useDocumentTitle('Campus marketplace');
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const { listings: recent, loading: recentLoading } = useListings({ limit: 6, sort: 'newest' });
  const heroItems = featured.length ? featured : recent;

  useEffect(() => {
    let active = true;
    Promise.all([listingService.categories(), listingService.featured(3)])
      .then(([categoryData, featuredData]) => {
        if (!active) return;
        setCategories(categoryData);
        setFeatured(featuredData);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setFeaturedLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const categoryCounts = useMemo(
    () => Object.fromEntries(categories.map((category) => [category.name, category.count])),
    [categories]
  );

  return (
    <div>
      <section className="relative overflow-hidden border-b border-line bg-gradient-to-b from-canvas/40 to-paper">
        <div className="container-page grid gap-12 pb-16 pt-14 lg:grid-cols-[1.04fr_0.96fr] lg:items-center lg:pb-24 lg:pt-20">
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-forest-200 bg-forest-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-forest-800 shadow-sm">
              <Sparkles className="h-3.5 w-3.5" /> A marketplace for your campus
            </div>
            <h1 className="mt-6 max-w-2xl text-balance text-5xl font-semibold leading-[1.03] tracking-[-0.045em] text-ink sm:text-6xl xl:text-[76px]">
              Your Campus.
              <br />
              <span className="text-forest-700">Your Marketplace.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-ink/70 sm:text-lg sm:leading-8">
              Buy and sell used books, calculators, lab equipment, and hostel essentials with
              students around you. Better prices, useful items, and less waste.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/marketplace" className="btn-primary px-6 py-3.5 shadow-sm">
                Explore marketplace <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/sell" className="btn-secondary px-6 py-3.5">
                Start selling
              </Link>
            </div>
            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-forest-600" /> Student accounts
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-forest-600" /> Moderated listings
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-forest-600" /> In-person exchanges
              </span>
            </div>
            <div className="mt-9 max-w-xl">
              <SearchBar size="lg" />
              <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-muted">
                <span>Popular:</span>
                {['Textbooks', 'Calculators', 'Lab equipment', 'Hostel'].map((item) => (
                  <Link
                    key={item}
                    to={`/marketplace?q=${encodeURIComponent(item)}`}
                    className="rounded-full border border-line bg-paper px-2.5 py-1 transition hover:border-forest-200 hover:text-forest-700"
                  >
                    {item}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="relative min-h-[380px] lg:min-h-[500px]" aria-label="Campus marketplace visual">
            <div className="relative overflow-hidden rounded-3xl border border-line bg-paper shadow-lift">
              <div className="aspect-[4/3] w-full overflow-hidden bg-canvas relative">
                <img
                  src="/images/hero/campus-hero.jpg"
                  alt="Students buying and selling textbooks and study gear on campus"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-black/20" />

                <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-3.5 py-1.5 text-xs font-medium text-white backdrop-blur-md">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live campus marketplace
                </div>
              </div>

              {heroItems[0] && (
                <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-xs rounded-2xl border border-line/80 bg-paper/95 p-3.5 shadow-card backdrop-blur-md transition hover:-translate-y-0.5">
                  <div className="flex items-center gap-3">
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-canvas border border-line">
                      <img
                        src={heroItems[0].images?.[0] ? imageUrl(heroItems[0].images[0]) : categoryImage(heroItems[0].category)}
                        alt={heroItems[0].title}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = categoryImage(heroItems[0].category);
                        }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-forest-700">
                          {heroItems[0].category}
                        </span>
                        <span className="text-xs font-bold text-ink">
                          {formatCurrency(heroItems[0].price)}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-xs font-semibold text-ink">
                        {heroItems[0].title}
                      </p>
                      <div className="mt-1 flex items-center gap-1.5 text-[10px] text-muted">
                        <Avatar name={heroItems[0].seller?.name || 'Student'} size="xs" />
                        <span className="truncate">{heroItems[0].seller?.name || 'Student seller'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="absolute -top-3 right-4 hidden sm:flex items-center gap-2.5 rounded-2xl border border-line bg-paper px-4 py-2.5 shadow-card">
              <div className="flex -space-x-2">
                <Avatar name="Aarav Mehta" size="xs" className="ring-2 ring-white" />
                <Avatar name="Priya Nair" size="xs" className="ring-2 ring-white" />
                <Avatar name="Rohan Kulkarni" size="xs" className="ring-2 ring-white" />
              </div>
              <div className="text-left">
                <p className="text-[11px] font-bold text-ink">500+ Campus Trades</p>
                <p className="text-[9px] text-muted">Verified student community</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-16 sm:py-20">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="section-kicker">Browse by need</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Popular categories
            </h2>
          </div>
          <Link
            to="/marketplace"
            className="hidden text-sm font-semibold text-forest-700 hover:text-forest-600 sm:inline-flex sm:items-center sm:gap-1"
          >
            View all listings <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((category) => {
            const Icon = categoryIcon(category);
            const image = categoryImage(category);
            const desc = categoryDescription(category);
            return (
              <Link
                key={category}
                to={`/marketplace?category=${encodeURIComponent(category)}`}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-paper transition duration-300 hover:-translate-y-1 hover:border-forest-300 hover:shadow-card"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-canvas">
                  <img
                    src={image}
                    alt={category}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-108"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/20 to-transparent" />
                  <span
                    className={`absolute left-3 top-3 grid h-9 w-9 place-items-center rounded-xl backdrop-blur-md shadow-sm ${categoryTint(
                      category
                    )}`}
                  >
                    <Icon className="h-4 w-4" strokeWidth={1.8} />
                  </span>
                  <span className="absolute bottom-2.5 right-3 rounded-full bg-paper/90 px-2 py-0.5 text-[10px] font-semibold text-ink shadow-sm backdrop-blur-sm">
                    {categoryCounts[category] || 0} items
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="text-sm font-semibold text-ink transition group-hover:text-forest-700">
                    {category}
                  </h3>
                  <p className="mt-1 line-clamp-1 text-[11px] text-muted">{desc}</p>
                </div>
              </Link>
            );
          })}

          <Link
            to="/marketplace"
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-forest-800 p-6 text-white transition duration-300 hover:-translate-y-1 hover:bg-forest-900 hover:shadow-card"
          >
            <div className="absolute inset-0 opacity-20">
              <img
                src="/images/backgrounds/study-group.jpg"
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
            <span className="relative grid h-10 w-10 place-items-center rounded-xl bg-white/10 backdrop-blur-sm">
              <Eye className="h-5 w-5" strokeWidth={1.7} />
            </span>
            <div className="relative mt-8">
              <h3 className="text-base font-semibold">Explore all categories</h3>
              <p className="mt-1 text-xs text-forest-100/75">Browse all live listings across campus</p>
              <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-forest-200 group-hover:translate-x-1 transition-transform">
                Browse now <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </Link>
        </div>
      </section>

      <section className="border-y border-line bg-paper/60 py-16 sm:py-20">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="section-kicker">Fresh finds</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                Recently added around campus
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
                Demo listings are created by the project seed script. Real listings appear here as
                students post them.
              </p>
            </div>
            <Link to="/marketplace" className="btn-secondary">
              Browse all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8">
            {recentLoading ? (
              <ListingGridSkeleton count={6} />
            ) : recent.length ? (
              <ListingGrid listings={recent} />
            ) : (
              <EmptyState
                icon={BookOpenCheck}
                title="No live listings yet"
                description="Be the first to list something useful. New listings appear after a quick moderation review."
                action={
                  <Link to="/sell" className="btn-primary">
                    Create the first listing
                  </Link>
                }
              />
            )}
          </div>
        </div>
      </section>

      <section className="container-page py-16 sm:py-24">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="section-kicker">How UniMarket works</p>
            <h2 className="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              From “I need this” to “I found it” in three steps.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-7 text-muted">
              UniMarket keeps discovery, questions, and coordination close together — without
              pretending to be a payment platform or a delivery service.
            </p>
            <Link to="/safety" className="link mt-6 inline-flex items-center gap-1.5 text-sm">
              Read the safety guidelines <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {steps.map(({ icon: Icon, title, text }, index) => (
              <div
                key={title}
                className="flex gap-4 rounded-2xl border border-line bg-paper p-5 transition hover:border-forest-200"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-forest-50 text-forest-700">
                  <Icon className="h-5 w-5" strokeWidth={1.7} />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-muted">0{index + 1}</span>
                    <h3 className="text-sm font-semibold">{title}</h3>
                  </div>
                  <p className="mt-1.5 text-sm leading-6 text-muted">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-16 text-white sm:py-20 bg-forest-900">
        <div className="absolute inset-0">
          <img
            src="/images/backgrounds/campus-quad.jpg"
            alt="University campus quad"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-forest-950/95 via-forest-900/90 to-forest-900/85 backdrop-blur-[2px]" />
        </div>
        <div className="container-page relative z-10">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-forest-200">
                Why students use it
              </p>
              <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
                A calmer way to buy and sell on campus.
              </h2>
              <p className="mt-4 max-w-sm text-sm leading-7 text-forest-100/75">
                No noisy feed, no payment processing, no public phone number. Just a focused place
                for useful academic items.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {benefits.map(({ icon: Icon, title, text }) => (
                <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.08] p-5 backdrop-blur-sm shadow-sm">
                  <Icon className="h-5 w-5 text-forest-100" strokeWidth={1.6} />
                  <h3 className="mt-5 text-sm font-semibold text-white">{title}</h3>
                  <p className="mt-2 text-xs leading-6 text-forest-100/70">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-16 sm:py-20">
        <div className="text-center max-w-2xl mx-auto">
          <p className="section-kicker">Student experiences</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Trusted by students across campuses
          </h2>
          <p className="mt-3 text-sm text-muted">
            See how classmates are saving money and giving useful academic gear a second life.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="card p-6 flex flex-col justify-between transition duration-200 hover:-translate-y-1 hover:shadow-card"
            >
              <div>
                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <span key={i} className="text-sm">★</span>
                  ))}
                </div>
                <p className="mt-3 text-sm leading-6 text-ink/80 italic">
                  “{t.text}”
                </p>
              </div>
              <div className="mt-6 flex items-center gap-3 border-t border-line/80 pt-4">
                <Avatar name={t.name} src={t.avatar} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">{t.name}</p>
                  <p className="truncate text-[11px] text-muted">{t.college} · {t.department}</p>
                </div>
                <span className="shrink-0 rounded-full bg-forest-50 px-2 py-0.5 text-[10px] font-medium text-forest-700">
                  Verified
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page py-16 sm:py-20">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-line bg-paper p-7 sm:p-10">
            <div className="flex items-center gap-2 text-forest-700">
              <ShieldCheck className="h-5 w-5" />
              <span className="text-xs font-semibold uppercase tracking-[0.18em]">Safe exchange tips</span>
            </div>
            <h2 className="mt-4 max-w-lg text-3xl font-semibold tracking-tight">
              Meet in public. Inspect first. Pay in person.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-muted">
              UniMarket does not handle payments, delivery, or identity verification. Treat every
              exchange like a normal in-person campus transaction.
            </p>
            <ul className="mt-6 grid gap-3 text-sm text-ink/75 sm:grid-cols-2">
              {[
                'Choose a busy, well-lit spot on campus.',
                'Check the item thoroughly before paying.',
                'Avoid advance payments to unknown sellers.',
                'Report suspicious listings or messages.',
              ].map((tip) => (
                <li key={tip} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-forest-600" />
                  {tip}
                </li>
              ))}
            </ul>

            <div className="mt-8 border-t border-line/70 pt-6">
              <p className="text-xs font-semibold text-ink/80 uppercase tracking-wider">Recommended campus meetup spots:</p>
              <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {campusSpots.map((spot) => (
                  <div key={spot.name} className="group overflow-hidden rounded-xl border border-line bg-canvas">
                    <div className="aspect-[16/10] overflow-hidden">
                      <img
                        src={spot.img}
                        alt={spot.name}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-2">
                      <p className="truncate text-[11px] font-semibold text-ink">{spot.name}</p>
                      <p className="truncate text-[9px] text-muted">{spot.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Link to="/safety" className="link mt-6 inline-flex items-center gap-1.5 text-sm">
              Full safety guidelines <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-line bg-[#EDE7D8] p-7 sm:p-10 flex flex-col justify-between">
            <div className="absolute inset-0 opacity-20">
              <img
                src="/images/categories/hostel.jpg"
                alt="Student hostel desk"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="relative">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-paper text-forest-700 shadow-sm">
                <Calculator className="h-6 w-6" strokeWidth={1.6} />
              </span>
              <h2 className="mt-6 max-w-xs text-3xl font-semibold tracking-tight text-ink">
                Something useful is probably sitting unused in your room.
              </h2>
              <p className="mt-4 text-sm leading-7 text-ink/70">
                List it in a few minutes. Add clear photos, set a fair price, and let campus find it.
              </p>
            </div>
            <div className="relative mt-8">
              <Link to="/sell" className="btn-primary shadow-sm">
                Sell an item <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page pb-20">
        <div className="flex flex-col items-center justify-between gap-6 rounded-3xl border border-line bg-paper px-6 py-10 text-center sm:flex-row sm:text-left shadow-sm">
          <div className="flex items-center gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-forest-50 text-forest-700">
              <MapPin className="h-6 w-6" strokeWidth={1.6} />
            </span>
            <div>
              <h2 className="text-lg font-semibold">Ready to trade closer to home?</h2>
              <p className="mt-1 text-sm text-muted">Browse what students are clearing out this week.</p>
            </div>
          </div>
          <Link to="/marketplace" className="btn-primary shrink-0 px-5 py-3 shadow-sm">
            Open the marketplace <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
