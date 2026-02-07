import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import Layout from "@/components/Layout";
import HomePage from "@/pages/HomePage";
import BuyPage from "@/pages/BuyPage";
import RentalsPage from "@/pages/RentalsPage";
import PropertyDetailsPage from "@/pages/PropertyDetailsPage";
import RequestListingPage from "@/pages/RequestListingPage";
import EnquiryPage from "@/pages/EnquiryPage";
import LoginPage from "@/pages/LoginPage";
import AboutPage from "@/pages/AboutPage";
import ContactPage from "@/pages/ContactPage";
import AdminDashboard from "@/pages/AdminDashboard";
import FavoritesPage from "@/pages/FavoritesPage";
import "@/App.css";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="buy" element={<BuyPage />} />
              <Route path="rentals" element={<RentalsPage />} />
              <Route path="property/:id" element={<PropertyDetailsPage />} />
              <Route path="request-listing" element={<RequestListingPage />} />
              <Route path="enquiry" element={<EnquiryPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="contact" element={<ContactPage />} />
              <Route path="favorites" element={<FavoritesPage />} />
              <Route path="admin" element={<AdminDashboard />} />
            </Route>
          </Routes>
          <Toaster position="top-center" richColors />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
