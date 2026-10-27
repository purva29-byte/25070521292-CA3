import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PriceDisplay from '../components/PriceDisplay.jsx';
import ConditionBadge from '../components/ConditionBadge.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import SearchBar from '../components/SearchBar.jsx';
import ListingCard from '../components/ListingCard.jsx';
import SafetyPage from '../pages/SafetyPage.jsx';
import { AuthProvider } from '../context/AuthContext.jsx';
import { FavoritesProvider } from '../context/FavoritesContext.jsx';
import { ToastProvider } from '../context/ToastProvider.jsx';

describe('UniMarket Frontend Unit and Component Tests', () => {
  describe('PriceDisplay Component', () => {
    it('formats price in Indian Rupees (INR)', () => {
      render(<PriceDisplay price={850} />);
      expect(screen.getByText(/₹\s*850/)).toBeInTheDocument();
    });

    it('shows Negotiable badge when negotiable is true', () => {
      render(<PriceDisplay price={1200} negotiable={true} />);
      expect(screen.getByText('Negotiable')).toBeInTheDocument();
    });

    it('handles zero and large prices correctly', () => {
      const { rerender } = render(<PriceDisplay price={0} />);
      expect(screen.getByText(/₹\s*0/)).toBeInTheDocument();

      rerender(<PriceDisplay price={45000} />);
      expect(screen.getByText(/₹\s*45,000/)).toBeInTheDocument();
    });
  });

  describe('ConditionBadge Component', () => {
    it('renders correct labels for each condition', () => {
      const { rerender } = render(<ConditionBadge condition="new" />);
      expect(screen.getByText('New')).toBeInTheDocument();

      rerender(<ConditionBadge condition="like_new" />);
      expect(screen.getByText('Like new')).toBeInTheDocument();

      rerender(<ConditionBadge condition="good" />);
      expect(screen.getByText('Good')).toBeInTheDocument();

      rerender(<ConditionBadge condition="fair" />);
      expect(screen.getByText('Fair')).toBeInTheDocument();
    });
  });

  describe('StatusBadge Component', () => {
    it('renders correct status label', () => {
      const { rerender } = render(<StatusBadge status="approved" />);
      expect(screen.getByText('Live')).toBeInTheDocument();

      rerender(<StatusBadge status="pending" />);
      expect(screen.getByText('Pending review')).toBeInTheDocument();

      rerender(<StatusBadge status="sold" />);
      expect(screen.getByText('Sold')).toBeInTheDocument();

      rerender(<StatusBadge status="rejected" />);
      expect(screen.getByText('Needs changes')).toBeInTheDocument();
    });
  });

  describe('EmptyState & ErrorState Components', () => {
    it('renders EmptyState with title, description, and action button', () => {
      const onAction = vi.fn();
      render(
        <EmptyState
          title="No listings found"
          description="Try adjusting your filters or search keywords."
          action={<button onClick={onAction}>Clear all filters</button>}
        />
      );

      expect(screen.getByText('No listings found')).toBeInTheDocument();
      expect(
        screen.getByText('Try adjusting your filters or search keywords.')
      ).toBeInTheDocument();

      const button = screen.getByRole('button', { name: 'Clear all filters' });
      fireEvent.click(button);
      expect(onAction).toHaveBeenCalledTimes(1);
    });

    it('renders ErrorState with retry button', () => {
      const onRetry = vi.fn();
      render(
        <ErrorState
          title="Failed to load items"
          description="Could not connect to the server."
          onRetry={onRetry}
        />
      );

      expect(screen.getByText('Failed to load items')).toBeInTheDocument();
      const retryButton = screen.getByRole('button', { name: /try again/i });
      fireEvent.click(retryButton);
      expect(onRetry).toHaveBeenCalledTimes(1);
    });
  });

  describe('SearchBar Component', () => {
    it('updates text and triggers onSearch when submitted', () => {
      const onSearch = vi.fn();
      render(
        <MemoryRouter>
          <SearchBar initialValue="" onSearch={onSearch} placeholder="Search textbooks..." />
        </MemoryRouter>
      );

      const input = screen.getByPlaceholderText('Search textbooks...');
      fireEvent.change(input, { target: { value: 'Casio Classwiz' } });
      expect(input.value).toBe('Casio Classwiz');

      fireEvent.submit(input.closest('form'));
      expect(onSearch).toHaveBeenCalledWith('Casio Classwiz');
    });
  });

  describe('ListingCard Component', () => {
    const mockListing = {
      id: 'listing-101',
      title: 'CASIO FX-991EX Scientific Calculator',
      description: 'Used for two semesters. Clean screen and intact keys.',
      price: 950,
      category: 'Calculators and Electronics',
      condition: 'like_new',
      college: 'COEP Pune',
      pickupLocation: 'Library entrance',
      isNegotiable: true,
      status: 'approved',
      images: ['/uploads/demo/calculator.svg'],
      seller: {
        id: 'seller-202',
        name: 'Rohan Kulkarni',
        college: 'COEP Pune',
      },
      views: 35,
    };

    it('renders listing card with title, price, badges, and seller info', () => {
      render(
        <MemoryRouter>
          <ToastProvider>
            <AuthProvider>
              <FavoritesProvider>
                <ListingCard listing={mockListing} />
              </FavoritesProvider>
            </AuthProvider>
          </ToastProvider>
        </MemoryRouter>
      );

      expect(screen.getByText('CASIO FX-991EX Scientific Calculator')).toBeInTheDocument();
      expect(screen.getByText(/₹\s*950/)).toBeInTheDocument();
      expect(screen.getByText('Like new')).toBeInTheDocument();
      expect(screen.getByText('Rohan Kulkarni')).toBeInTheDocument();
      expect(screen.getByText('COEP Pune')).toBeInTheDocument();
    });
  });

  describe('Safety Guidelines Page', () => {
    it('renders student campus safety rules and trade advice', () => {
      render(
        <MemoryRouter>
          <SafetyPage />
        </MemoryRouter>
      );

      expect(
        screen.getByRole('heading', { level: 1, name: /A safe exchange starts with a clear plan/i })
      ).toBeInTheDocument();
      expect(screen.getByText(/Meet in a public campus space/i)).toBeInTheDocument();
      expect(screen.getByText(/Inspect before you pay/i)).toBeInTheDocument();
    });
  });
});
