import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import ListingsPage from "./pages/ListingsPage.jsx";
import NewListingPage from "./pages/NewListingPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import OrdersPage from "./pages/OrdersPage.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <nav className="navbar">
        <Link to="/" className="navbar-brand">🌾 Agri Marketplace</Link>
        <div className="navbar-links">
          <Link to="/">Browse Produce</Link>
          <Link to="/new">Post a Listing</Link>
          <Link to="/login">Log In</Link>
          <Link to="/register">Register</Link>
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<ListingsPage />} />
        <Route path="/new" element={<NewListingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/orders" element={<OrdersPage />} />
      </Routes>
    </BrowserRouter>
  );
}
