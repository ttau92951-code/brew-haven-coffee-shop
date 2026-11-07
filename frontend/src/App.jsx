import { Navigate, Route, Routes } from 'react-router-dom';

import ProtectedRoute from './components/ProtectedRoute.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
import SiteLayout from './components/SiteLayout.jsx';

import HomePage from './pages/HomePage.jsx';
import MenuPage from './pages/MenuPage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import CartPage from './pages/CartPage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
import OrderConfirmationPage from './pages/OrderConfirmationPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignUpPage from './pages/SignUpPage.jsx';
import AccountPage from './pages/AccountPage.jsx';
import MyOrdersPage from './pages/MyOrdersPage.jsx';
import NotificationsPage from './pages/NotificationsPage.jsx';
import ReviewsPage from './pages/ReviewsPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

import StaffLoginPage from './pages/staff/StaffLoginPage.jsx';
import StaffLayout from './pages/staff/StaffLayout.jsx';
import StaffOverviewPage from './pages/staff/StaffOverviewPage.jsx';
import StaffMenuPage from './pages/staff/StaffMenuPage.jsx';
import StaffOrdersPage from './pages/staff/StaffOrdersPage.jsx';
import StaffReportsPage from './pages/staff/StaffReportsPage.jsx';
import StaffCustomersPage from './pages/staff/StaffCustomersPage.jsx';
import StaffFeedbackPage from './pages/staff/StaffFeedbackPage.jsx';
import StaffEmployeesPage from './pages/staff/StaffEmployeesPage.jsx';
import StaffSettingsPage from './pages/staff/StaffSettingsPage.jsx';

export default function App() {
  return (
    <>
      <ScrollToTop />

      <Routes>
        {/* Public storefront */}
        <Route element={<SiteLayout />}>
          <Route index element={<HomePage />} />
          <Route path="menu" element={<MenuPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="order/:id" element={<OrderConfirmationPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="signup" element={<SignUpPage />} />

          {/* Customer-only pages */}
          <Route
            path="account"
            element={
              <ProtectedRoute role="customer">
                <AccountPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="orders"
            element={
              <ProtectedRoute role="customer">
                <MyOrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="notifications"
            element={
              <ProtectedRoute role="customer">
                <NotificationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="reviews"
            element={
              <ProtectedRoute role="customer">
                <ReviewsPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Staff authentication */}
        <Route path="/staff/login" element={<StaffLoginPage />} />

        {/* Staff dashboard */}
        <Route
          path="/staff"
          element={
            <ProtectedRoute roles={['staff', 'admin']} redirectTo="/staff/login">
              <StaffLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<StaffOverviewPage />} />
          <Route path="menu" element={<StaffMenuPage />} />
          <Route path="orders" element={<StaffOrdersPage />} />
          <Route path="reports" element={<StaffReportsPage />} />
          <Route path="customers" element={<StaffCustomersPage />} />
          <Route path="feedback" element={<StaffFeedbackPage />} />
          <Route path="employees" element={<StaffEmployeesPage />} />
          <Route path="settings" element={<StaffSettingsPage />} />
          <Route path="*" element={<Navigate to="/staff" replace />} />
        </Route>
      </Routes>
    </>
  );
}
