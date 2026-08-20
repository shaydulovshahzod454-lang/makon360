import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { lazy, Suspense } from 'react';
import Header from './components/Header';
import FeedbackForm from './components/FeedbackForm';
import PageSpinner from './components/PageSpinner';

const HomePage = lazy(() => import('./pages/HomePage'));
const CreditCalculatorPage = lazy(() => import('./pages/CreditCalculatorPage'));
const ListingDetailPage = lazy(() => import('./pages/ListingDetailPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const CreateListingPage = lazy(() => import('./pages/CreateListingPage'));
const AddRoomPage = lazy(() => import('./pages/AddRoomPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ManageHotspotsPage = lazy(() => import('./pages/ManageHotspotsPage'));
const FavoritesPage = lazy(() => import('./pages/FavoritesPage'));
const CatalogPage = lazy(() => import('./pages/CatalogPage'));

function GlobalBackground() {
  return (
    <div className="global-blobs" aria-hidden="true">
      <span className="blob blob-1" />
      <span className="blob blob-2" />
      <span className="blob blob-3" />
      <span className="blob blob-4" />
    </div>
  );
}

function App() {
  return (
    <HelmetProvider>
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
        <Suspense fallback={<PageSpinner />}>
        <GlobalBackground />
        <Header />
        <main>
        <Suspense fallback={<PageSpinner />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/calculator" element={<CreditCalculatorPage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/listing/:id" element={<ListingDetailPage />} />
          <Route path="/listing/:id/edit" element={<CreateListingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/create-listing" element={<CreateListingPage />} />
          <Route path="/listing/:id/add-room" element={<AddRoomPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/listing/:id/hotspots" element={<ManageHotspotsPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
                </Routes>
        </Suspense>
        </main>
        <FeedbackForm />
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
    </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;