import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import Home from './pages/Home';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import AdminDashboard from './pages/Admin/AdminDashboard';
import ProductForm from './pages/Admin/ProductForm';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ProductDetails from './pages/ProductDetails';
import OrderManagement from './pages/Admin/OrderManagement';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';

import TrackOrder from './pages/TrackOrder';
import AboutUs from './pages/AboutUs';
import FAQ from './pages/FAQ';
import { CurrencyProvider } from './context/CurrencyContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { WishlistProvider } from './context/WishlistContext';
import Wishlist from './pages/Wishlist';

import TermsConditions from './pages/TermsConditions';
import PrivacyPolicy from './pages/PrivacyPolicy';
import RefundPolicy from './pages/RefundPolicy';
import ShippingPolicy from './pages/ShippingPolicy';
import ContactUs from './pages/ContactUs';
import ReturnForm from './pages/ReturnForm';

function AnnouncementBar() {
  const tickerText = "⚡ GREAT SUMMER SALE IS LIVE: FLAT 38% OFF ON ALL ITEMS TODAY! — 🚚 FREE SHIPPING & CASH ON DELIVERY (COD) ON ALL ORDERS! — ⚡ FLASH DEALS: PREMIUM UTILITIES & GADGETS AT BEST PRICE! — 38% OFF THIS WEEK ONLY!";
  return (
    <div className="ticker-wrap">
      <div className="ticker-content">
        <span className="ticker-item">{tickerText}</span>
        <span className="ticker-item">{tickerText}</span>
      </div>
    </div>
  );
}

function AppContent() {
  // Quantity-based cart: [{ ...product, quantity: N }]
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { showToast } = useToast();

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: (item.quantity || 1) + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    showToast(`${product.name} added to cart! 🛒`);
    setIsCartOpen(true);
  };

  const updateCartQuantity = (productId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.id === productId ? { ...item, quantity: newQty } : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);

  return (
    <CurrencyProvider>
      <Router>
        <div className="app">
          <AnnouncementBar />
          <Header
            cartCount={cartCount}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onCartClick={() => setIsCartOpen(true)}
            clearFilters={() => {
              setSearchQuery('');
            }}
          />

          <CartDrawer
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            cart={cart}
            updateCartQuantity={updateCartQuantity}
            removeFromCart={removeFromCart}
          />

          <Routes>
            <Route path="/" element={<Home addToCart={addToCart} searchQuery={searchQuery} />} />
            <Route path="/product/:id" element={<ProductDetails addToCart={addToCart} />} />
            <Route path="/cart" element={<Cart cart={cart} updateCartQuantity={updateCartQuantity} removeFromCart={removeFromCart} />} />
            <Route path="/checkout" element={<Checkout cart={cart} clearCart={clearCart} />} />
            <Route path="/shipping-policy" element={<ShippingPolicy />} />
            <Route path="/terms" element={<TermsConditions />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/refund-policy" element={<RefundPolicy />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/track-order" element={<TrackOrder />} />
            <Route path="/return-form" element={<ReturnForm />} />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/wishlist" element={<Wishlist addToCart={addToCart} />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/orders" element={
              <ProtectedRoute>
                <OrderManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/add" element={
              <ProtectedRoute>
                <ProductForm />
              </ProtectedRoute>
            } />
            <Route path="/admin/edit/:id" element={
              <ProtectedRoute>
                <ProductForm />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>

          <Footer />
        </div>
      </Router>
    </CurrencyProvider>
  );
}
function SupportChatDrawer() {
  const [isOpen, setIsOpen] = useState(false);

  const options = [
    { label: '🚚 Track My Order', action: () => { window.location.href = '/track-order'; setIsOpen(false); } },
    { label: '🔄 Request Return / Exchange', action: () => { window.location.href = '/return-form'; setIsOpen(false); } },
    { label: '💬 Live WhatsApp Support', action: () => { window.open('https://wa.me/919508952676?text=Hello%20Gaya%20ji%20Shopping%20Mart%20Support!%20I%20need%20assistance.', '_blank'); } },
    { label: '✉️ Email Support Desk', action: () => { window.location.href = '/contact'; setIsOpen(false); } }
  ];

  return (
    <>
      {/* Floating launcher */}
      <div 
        className="whatsapp-launcher" 
        onClick={() => setIsOpen(!isOpen)}
        title="Customer Support Chat Desk"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <span className="whatsapp-tooltip">Need Help? Chat with us!</span>
      </div>

      {/* Chat Drawer Panel */}
      <div className={`chat-drawer ${isOpen ? 'open' : ''}`}>
        <div className="chat-header">
          <div className="chat-header-info">
            <div className="chat-avatar">👩‍💼</div>
            <div className="chat-header-text">
              <h4>Gaya ji Shopping Mart Support Desk</h4>
              <div className="chat-status">
                <span className="chat-status-dot"></span>
                Active Support Agent Online
              </div>
            </div>
          </div>
          <button className="chat-close-btn" onClick={() => setIsOpen(false)}>&times;</button>
        </div>

        <div className="chat-body">
          <div className="chat-message-bubble">
            👋 Hello! Welcome to Gaya ji Shopping Mart Customer Care. We are here to help you.
          </div>
          <div className="chat-message-bubble" style={{ marginTop: '-8px' }}>
            What can we assist you with today? Please select one of the self-service options below or chat directly with us on WhatsApp:
          </div>

          <div className="chat-options-container">
            {options.map((opt, idx) => (
              <button key={idx} className="chat-option-button" onClick={opt.action}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function App() {
  return (
    <ToastProvider>
      <WishlistProvider>
        <AppContent />
        <SupportChatDrawer />
      </WishlistProvider>
    </ToastProvider>
  );
}

export default App;
