import PageHeader from '../components/PageHeader.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

export default function PrivacyPage() {
  useDocumentTitle('Privacy policy');
  const email = import.meta.env.VITE_CONTACT_EMAIL || 'support@unimarket.example';

  return (
    <div>
      <PageHeader
        kicker="Privacy"
        title="Privacy policy"
        description="This policy describes what this UniMarket project stores and why. It is written for a college project, not as legal advice."
      />
      <div className="container-page py-12 sm:py-16">
        <div className="container-narrow prose-page max-w-3xl px-0">
          <p className="!mt-0 text-xs text-muted">Last updated: 26 October 2026</p>

          <h2>Information we store</h2>
          <ul>
            <li><strong>Account details:</strong> name, email, college, optional department and year, account role, and account status.</li>
            <li><strong>Authentication data:</strong> a bcrypt password hash, a JWT session cookie, a CSRF token cookie, and password-reset token hashes.</li>
            <li><strong>Marketplace activity:</strong> listings, image files, favourites, conversations, messages, reports, and moderation records.</li>
            <li><strong>Technical data:</strong> standard request logs produced while the API is running. Production server logs should be configured by the deployer.</li>
          </ul>

          <h2>What is public</h2>
          <p>
            A seller’s display name, college, optional department and year, member-since date, and
            approved listings may be visible publicly. Email addresses, password hashes, reset
            tokens, and account status are not included in public seller payloads. Messages are only
            visible to the two participants and administrators where required for moderation.
          </p>

          <h2>Why we use it</h2>
          <ul>
            <li>To authenticate accounts and enforce ownership and role permissions.</li>
            <li>To display listings and support search, filters, and favourites.</li>
            <li>To deliver buyer–seller messages linked to a listing.</li>
            <li>To review reports and keep an audit trail of moderation decisions.</li>
            <li>To send password-reset email only when the deployer has configured SMTP.</li>
          </ul>

          <h2>Cookies</h2>
          <p>
            UniMarket uses an HttpOnly session cookie for authentication and a readable CSRF token
            cookie for double-submit protection on state-changing requests. We do not use advertising
            or analytics cookies. The frontend stores your grid/list layout preference in local
            storage.
          </p>

          <h2>Images and uploads</h2>
          <p>
            In local development, uploaded images are stored in the server’s uploads folder and served
            through a controlled route. A production deployment must use persistent object storage or
            a managed image provider because ephemeral server files can disappear on redeploy.
          </p>

          <h2>Retention and deletion</h2>
          <p>
            Listings can be deleted by their owner. Deleting a listing removes its conversations,
            messages, and reports and removes it from other students’ favourites. Moderation logs may
            be retained to preserve an audit trail. This project does not currently provide a
            self-service account deletion flow; contact the project team for account removal.
          </p>

          <h2>Security limitations</h2>
          <p>
            The app uses password hashing, server-side authorization, validation, rate limiting,
            Helmet, restricted CORS, CSRF protection, and upload restrictions. No system is completely
            secure, and this project does not claim otherwise. Do not post sensitive personal
            information in listings or messages.
          </p>

          <h2>Contact</h2>
          <p>
            For privacy questions or account removal, email{' '}
            <a href={`mailto:${email}`}>{email}</a>. Do not send passwords or OTPs.
          </p>
        </div>
      </div>
    </div>
  );
}
