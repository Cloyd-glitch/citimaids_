import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Customer Layout & Pages
import RootLayout from './layouts/RootLayout';
import HomePage from './pages/HomePage';
import ServicesPage from './pages/ServicesPage';
import ServiceDetailPage from './pages/ServiceDetailPage';
import MaintenancePage from './pages/MaintenancePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import BookingPage from './pages/BookingPage';
import BookingConfirmationPage from './pages/BookingConfirmationPage';
import TrackBookingPage from './pages/TrackBookingPage';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import Bookings from './pages/admin/Bookings';
import BookingDetail from './pages/admin/BookingDetail';
import Payments from './pages/admin/Payments';
import Clients from './pages/admin/Clients';
import ClientDetail from './pages/admin/ClientDetail';
import Services from './pages/admin/Services';
import Reports from './pages/admin/Reports';
import Settings from './pages/admin/Settings';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Customer Portal */}
          <Route path="/" element={<RootLayout />}>
            <Route index element={<HomePage />} />
            <Route path="services" element={<ServicesPage />} />
            <Route path="services/:serviceId" element={<ServiceDetailPage />} />
            <Route path="maintenance" element={<MaintenancePage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="book" element={<BookingPage />} />
            <Route path="booking-confirmation" element={<BookingConfirmationPage />} />
            <Route path="track-booking" element={<TrackBookingPage />} />
          </Route>

          {/* Admin Login */}
          <Route path="/admin/login" element={<Login />} />

          {/* Protected Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="bookings/:id" element={<BookingDetail />} />
            <Route path="payments" element={<Payments />} />
            <Route path="billing" element={<Payments defaultTab="payments" />} />
            <Route path="transactions" element={<Payments defaultTab="transactions" />} />
            <Route path="clients" element={<Clients />} />
            <Route path="clients/:id" element={<ClientDetail />} />
            <Route path="services" element={<Services />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
            <Route path="settings/:tab" element={<Settings />} />
          </Route>

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
