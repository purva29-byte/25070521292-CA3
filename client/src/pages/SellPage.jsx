import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, Image, ShieldCheck, Tag } from 'lucide-react';
import ListingForm from '../components/ListingForm.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastProvider.jsx';
import { listingService } from '../services/listingService.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

export default function SellPage() {
  useDocumentTitle('Sell an item');
  const { user } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();

  async function handleSubmit(formData) {
    await listingService.create(formData);
    notify.success('Listing submitted for moderation. You can track it in your dashboard.');
    navigate('/dashboard?tab=listings');
  }

  return (
    <div className="container-page pb-20 pt-8">
      <div className="mx-auto max-w-5xl">
        <nav className="text-xs text-muted" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-forest-700">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-ink">Sell an item</span>
        </nav>

        <div className="mt-6 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="section-kicker">Declutter your campus life</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">Sell something useful.</h1>
            <p className="mt-3 max-w-xl text-sm leading-7 text-muted">
              Clear photos and an honest description help your listing get approved and help buyers
              decide quickly.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-forest-100 bg-forest-50 px-4 py-3 text-xs leading-5 text-forest-800 lg:max-w-xs">
            <ShieldCheck className="h-5 w-5 shrink-0" />
            Every new listing is reviewed by an administrator before it appears in the marketplace.
          </div>
        </div>

        <div className="mt-8 grid gap-7 lg:grid-cols-[1fr_280px]">
          <ListingForm
            mode="create"
            initialListing={{ college: user?.college || '', images: [] }}
            onSubmit={handleSubmit}
            onCancel={() => navigate(-1)}
          />

          <aside className="order-first lg:order-last">
            <div className="sticky top-24 space-y-4">
              <div className="card p-5">
                <h2 className="text-sm font-semibold">A stronger listing</h2>
                <ul className="mt-4 space-y-4 text-xs leading-5 text-muted">
                  <li className="flex gap-2.5">
                    <Image className="mt-0.5 h-4 w-4 shrink-0 text-forest-700" />
                    <span><strong className="font-semibold text-ink">Clear photos.</strong> Use natural light and show any damage or missing parts.</span>
                  </li>
                  <li className="flex gap-2.5">
                    <Tag className="mt-0.5 h-4 w-4 shrink-0 text-forest-700" />
                    <span><strong className="font-semibold text-ink">Honest pricing.</strong> Compare similar items and mark negotiable if you are flexible.</span>
                  </li>
                  <li className="flex gap-2.5">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-forest-700" />
                    <span><strong className="font-semibold text-ink">Useful detail.</strong> Mention edition, model number, size, or what is included.</span>
                  </li>
                </ul>
              </div>
              <div className="rounded-2xl border border-line bg-paper p-5 text-xs leading-5 text-muted">
                <p className="font-semibold text-ink">What happens next?</p>
                <ol className="mt-3 list-decimal space-y-2 pl-4">
                  <li>Your listing is saved as pending.</li>
                  <li>A moderator checks it against the guidelines.</li>
                  <li>Approved listings become visible in the marketplace.</li>
                  <li>You can mark it sold once it is live.</li>
                </ol>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
