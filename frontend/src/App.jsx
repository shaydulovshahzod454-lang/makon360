import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import HomePage from './pages/HomePage';
import CreditCalculatorPage from './pages/CreditCalculatorPage';
import ListingDetailPage from './pages/ListingDetailPage';
import LoginPage from './pages/LoginPage';
import Header from './components/Header';
import FeedbackForm from './components/FeedbackForm';
import CreateListingPage from './pages/CreateListingPage';
import AddRoomPage from './pages/AddRoomPage';
import RegisterPage from './pages/RegisterPage';
import ManageHotspotsPage from './pages/ManageHotspotsPage';
import FavoritesPage from './pages/FavoritesPage';
import CatalogPage from './pages/CatalogPage';

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
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
        <GlobalBackground />
        <Header />
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
        <FeedbackForm />
      </BrowserRouter>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;