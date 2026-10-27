import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ListingForm from '../components/ListingForm.jsx';
import ErrorState from '../components/ErrorState.jsx';
import { PageSpinner } from '../components/LoadingSkeleton.jsx';
import { useToast } from '../context/ToastProvider.jsx';
import { listingService } from '../services/listingService.js';
import { getApiError } from '../services/api.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

export default function EditListingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notify } = useToast();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useDocumentTitle(listing ? `Edit ${listing.title}` : 'Edit listing');

  useEffect(() => {
    let active = true;
    listingService
      .get(id)
      .then((data) => {
        if (!active) return;
        if (!data.isOwner) {
          setError('You can only edit your own listings.');
          return;
        }
        setListing(data);
      })
      .catch((requestError) => {
        if (active) setError(getApiError(requestError, 'Could not load this listing.'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  async function handleSubmit(formData) {
    const result = await listingService.update(id, formData);
    notify.success(result.message || 'Listing updated.');
    navigate('/dashboard?tab=listings');
  }

  if (loading) return <PageSpinner label="Loading listing" />;
  if (error) {
    return (
      <div className="container-page py-16">
        <ErrorState title="Cannot edit this listing" message={error} />
        <div className="mt-6 text-center">
          <Link to="/dashboard?tab=listings" className="btn-secondary">
            <ArrowLeft className="h-4 w-4" /> Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (['sold', 'removed'].includes(listing.status)) {
    return (
      <div className="container-page py-16">
        <ErrorState
          title="This listing cannot be edited"
          message={
            listing.status === 'sold'
              ? 'Relist the item from your dashboard before editing it.'
              : 'A moderator removed this listing, so editing is disabled. Contact support if you need help.'
          }
        />
        <div className="mt-6 text-center">
          <Link to="/dashboard?tab=listings" className="btn-secondary">Back to dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page pb-20 pt-8">
      <div className="mx-auto max-w-5xl">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-forest-700"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <div className="mt-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="section-kicker">Edit listing</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{listing.title}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              Significant changes send the listing back for moderation. Minor changes to pickup
              details keep its current status.
            </p>
          </div>
          <Link to={`/listing/${listing.id || listing._id}`} className="btn-secondary shrink-0">
            View public page
          </Link>
        </div>
        <div className="mt-8">
          <ListingForm
            mode="edit"
            initialListing={listing}
            onSubmit={handleSubmit}
            onCancel={() => navigate(-1)}
          />
        </div>
      </div>
    </div>
  );
}
