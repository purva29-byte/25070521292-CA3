import { Route, Routes } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout.jsx';
import AuthLayout from './layouts/AuthLayout.jsx';
import ProtectedRoute, { AdminRoute } from './routes/ProtectedRoute.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
import LandingPage from './pages/LandingPage.jsx';
import MarketplacePage from './pages/MarketplacePage.jsx';
import ListingPage from './pages/ListingPage.jsx';
import SellerPage from './pages/SellerPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import ResetPasswordPage from './pages/ResetPasswordPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import FavoritesPage from './pages/FavoritesPage.jsx';
import SellPage from './pages/SellPage.jsx';
import EditListingPage from './pages/EditListingPage.jsx';
import MessagesPage from './pages/MessagesPage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import SafetyPage from './pages/SafetyPage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import PrivacyPage from './pages/PrivacyPage.jsx';
import TermsPage from './pages/TermsPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>

        <Route element={<PublicLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/listing/:id" element={<ListingPage />} />
          <Route path="/seller/:id" element={<SellerPage />} />
          <Route path="/safety" element={<SafetyPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/sell" element={<SellPage />} />
            <Route path="/sell/:id/edit" element={<EditListingPage />} />
            <Route path="/messages" element={<MessagesPage />} />
          </Route>

          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  );
}
