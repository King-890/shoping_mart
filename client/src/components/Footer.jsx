import React from 'react';
import { Link } from 'react-router-dom';
import API_URL from '../config/api';
import { useCurrency } from '../context/CurrencyContext';

const Footer = () => {
    const { currency, availableCurrencies, changeCurrency } = useCurrency();
    const [socialLinks, setSocialLinks] = React.useState({ facebook: '', instagram: '', phone: '', email: '' });

    React.useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch(`${API_URL}/api/settings`);
                const data = await res.json();
                if (data) setSocialLinks(data);
            } catch (err) {
                console.error("Failed to load footer settings", err);
            }
        };
        fetchSettings();
    }, []);

    return (
        <footer style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            background: '#111111',
            color: '#eaeaea',
            padding: '5rem 0 3rem 0',
            marginTop: '6rem',
            position: 'relative'
        }}>
            <div className="container" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '2.5rem'
            }}>
                {/* Brand */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    <h3 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#ffffff', margin: 0 }}>
                        Gaya ji Shopping Mart
                    </h3>
                    <p style={{ color: '#a0a0a0', margin: 0, fontSize: '0.9rem', lineHeight: '1.6' }}>
                        Gaya ji Shopping Mart is your ultimate general retail platform, offering high-quality home utilities, personal care essentials, fashion, grocery, electronics accessories, and fitness gear.
                    </p>
                    {/* Social Icons */}
                    <div style={{ display: 'flex', gap: '1.2rem', marginTop: '0.5rem' }}>
                        <a href={socialLinks.facebook || "https://facebook.com"} target="_blank" rel="noopener noreferrer" className="footer-social-icon" aria-label="Facebook">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"></path>
                            </svg>
                        </a>
                        <a href={socialLinks.instagram || "https://instagram.com"} target="_blank" rel="noopener noreferrer" className="footer-social-icon" aria-label="Instagram">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                            </svg>
                        </a>
                    </div>
                </div>

                {/* Business Contact */}
                <div>
                    <h4 style={{ marginBottom: '1.5rem', color: '#ffffff', textTransform: 'none', letterSpacing: '0.5px', fontSize: '0.95rem', fontWeight: '700' }}>Contact Us</h4>
                    <p style={{ color: '#a0a0a0', marginBottom: '1.2rem', fontSize: '0.9rem', lineHeight: '1.6' }}>
                        Have questions? Reach out to our customer support team.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <a href={`tel:${socialLinks.phone || '+919508952676'}`} className="footer-contact-link">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#c084fc' }}>
                                <path d="M6.62 10.79a15.15 15.15 0 006.59 6.59l2.2-2.2a1 1 0 011.11-.27c1.12.37 2.33.57 3.57.57a1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57a1 1 0 01-.27 1.11l-2.2 2.2z"/>
                            </svg>
                            <span>{socialLinks.phone || '+91 9508952676'}</span>
                        </a>
                        <a href={`mailto:${socialLinks.email || 'shoppingmartgayaji@gmail.com'}`} className="footer-contact-link">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#ffffff' }}>
                                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                            </svg>
                            <span>{socialLinks.email || 'shoppingmartgayaji@gmail.com'}</span>
                        </a>
                    </div>
                </div>

                {/* Shop Links */}
                <div>
                    <h4 style={{ marginBottom: '1.5rem', color: '#ffffff', textTransform: 'none', letterSpacing: '0.5px', fontSize: '0.95rem', fontWeight: '700' }}>Categories</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        <Link to="/?category=Home%20Utilities" className="footer-link">Home Utilities</Link>
                        <Link to="/?category=Personal%20Care" className="footer-link">Personal Care</Link>
                        <Link to="/?category=Mobile%20%26%20Electronics" className="footer-link">Mobile & Electronics</Link>
                        <Link to="/?category=Footwear%20%26%20Fashion" className="footer-link">Footwear & Fashion</Link>
                        <Link to="/?category=Grocery%20%26%20Essentials" className="footer-link">Grocery & Essentials</Link>
                        <Link to="/?category=Toys%2C%20Sports%20%26%20Fitness" className="footer-link">Toys, Sports & Fitness</Link>
                    </div>
                </div>

                {/* Links */}
                <div>
                    <h4 style={{ marginBottom: '1.5rem', color: '#ffffff', textTransform: 'none', letterSpacing: '0.5px', fontSize: '0.95rem', fontWeight: '700' }}>Support</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                        <Link to="/about-us" className="footer-link">About Us</Link>
                        <Link to="/faq" className="footer-link">FAQ</Link>
                        <Link to="/shipping-policy" className="footer-link">Shipping Policy</Link>
                        <Link to="/refund-policy" className="footer-link">Refund Policy</Link>
                        <Link to="/terms" className="footer-link">Terms & Conditions</Link>
                        <Link to="/privacy" className="footer-link">Privacy Policy</Link>
                        <Link to="/contact" className="footer-link">Contact Us</Link>
                        <Link to="/track-order" className="footer-link">Track Order</Link>
                    </div>
                </div>
            </div>
            <div className="container" style={{
                marginTop: '4rem',
                paddingTop: '2rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
                color: '#a0a0a0',
                fontSize: '0.85rem'
            }}>
                <div>© 2026 Gaya ji Shopping Mart. All rights reserved.</div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: '#a0a0a0' }}>Currency:</span>
                    <select
                        id="footer-currency"
                        name="footer_currency"
                        value={currency}
                        onChange={(e) => changeCurrency(e.target.value)}
                        className="footer-select"
                    >
                        {availableCurrencies.map(cur => (
                            <option key={cur} value={cur} style={{ background: '#1c1c1c', color: '#ffffff' }}>{cur}</option>
                        ))}
                    </select>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
