import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Loader2, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastProvider.jsx';
import { conversationService } from '../services/conversationService.js';
import { getApiError } from '../services/api.js';

export default function ContactSellerButton({ listing, className = '' }) {
  const { user } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const isOwner = Boolean(
    user && listing.seller && String(user.id) === String(listing.seller.id)
  ) || listing.isOwner;

  async function handleClick() {
    if (!user) {
      notify.info('Sign in to contact this seller.');
      navigate(`/login?returnTo=${encodeURIComponent(location.pathname + location.search)}`);
      return;
    }

    setLoading(true);
    try {
      const conversation = await conversationService.start(listing.id || listing._id);
      navigate(`/messages?conversation=${conversation.id}`);
    } catch (error) {
      notify.error(getApiError(error, 'Could not start the conversation.'));
    } finally {
      setLoading(false);
    }
  }

  if (isOwner) {
    return (
      <button type="button" className={`btn-secondary w-full ${className}`} disabled>
        This is your listing
      </button>
    );
  }

  if (listing.status !== 'approved' && listing.status !== 'sold') {
    return (
      <button type="button" className={`btn-secondary w-full ${className}`} disabled>
        Not currently available
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={`btn-primary w-full py-3 ${className}`}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageCircle className="h-4 w-4" />}
      {loading ? 'Opening chat…' : 'Contact seller'}
    </button>
  );
}
