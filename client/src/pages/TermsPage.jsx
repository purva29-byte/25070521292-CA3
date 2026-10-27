import PageHeader from '../components/PageHeader.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

export default function TermsPage() {
  useDocumentTitle('Terms of use');
  const email = import.meta.env.VITE_CONTACT_EMAIL || 'support@unimarket.example';

  return (
    <div>
      <PageHeader
        kicker="Terms"
        title="Terms of use"
        description="These terms explain the basic rules for using this UniMarket college project. They are not legal advice and do not create a commercial marketplace service."
      />
      <div className="container-page py-12 sm:py-16">
        <div className="container-narrow prose-page max-w-3xl px-0">
          <p className="!mt-0 text-xs text-muted">Last updated: 26 October 2026</p>

          <h2>1. Using UniMarket</h2>
          <p>
            You must provide accurate account information, keep your password private, and use the
            platform only for lawful student marketplace activity. You are responsible for activity
            performed through your account.
          </p>

          <h2>2. Listings and moderation</h2>
          <ul>
            <li>New and significantly edited listings enter a moderation queue.</li>
            <li>Administrators may approve, reject, remove, or restore listings and record a reason.</li>
            <li>Removed listings do not appear publicly. Rejected listings show the seller a reason to help them make changes.</li>
            <li>Approval is a content check, not a guarantee of quality, ownership, legality, or safety.</li>
          </ul>

          <h2>3. Prohibited items and behaviour</h2>
          <p>
            Do not list weapons, illegal drugs, stolen property, hazardous materials, academic
            cheating services, counterfeit goods, or anything unsafe or unrelated to a student
            marketplace. Do not harass others, spam, impersonate people, attempt unauthorized access,
            or misrepresent an item’s condition.
          </p>

          <h2>4. Transactions are between students</h2>
          <p>
            UniMarket does not process payments, hold funds, provide escrow, arrange delivery, or
            guarantee that a transaction will happen. Buyers and sellers must arrange and complete
            exchanges themselves, preferably in a safe public campus location. Financial disputes are
            not resolved by the platform.
          </p>

          <h2>5. Accounts and enforcement</h2>
          <p>
            Administrators may suspend accounts for abuse, repeated policy violations, or security
            concerns. Suspension revokes active sessions. Users must not attempt to make themselves
            administrators or access areas for which they do not have permission.
          </p>

          <h2>6. Content</h2>
          <p>
            You retain responsibility for the photos and text you upload. By posting, you confirm you
            have the right to share that content. UniMarket may remove content that violates these
            terms or creates a safety risk.
          </p>

          <h2>7. Availability and warranty</h2>
          <p>
            This is a student project. The service is provided as-is, without warranties of
            availability, fitness, or accuracy. Features may change or be unavailable. Do not rely on
            it for urgent or high-value transactions.
          </p>

          <h2>8. Safety</h2>
          <p>
            Follow the safety guidelines. Never share OTPs, passwords, banking details, or identity
            documents. Inspect items before paying, avoid advance payments to unknown sellers, and
            contact campus security or local emergency services if there is immediate danger.
          </p>

          <h2>9. Contact</h2>
          <p>
            Questions about these terms can be sent to{' '}
            <a href={`mailto:${email}`}>{email}</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
