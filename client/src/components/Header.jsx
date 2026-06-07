import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { API_URL } from '../config/api';

const Header = ({ cartCount, searchQuery, setSearchQuery, clearFilters, onCartClick }) => {
    const { wishlist } = useWishlist();
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        let user = null;
        try {
            user = JSON.parse(localStorage.getItem('user'));
        } catch (e) {}

        if (user && user.id) {
            const fetchNotifications = async () => {
                try {
                    const response = await fetch(`${API_URL}/api/marketing/notifications/${user.id}`);
                    if (response.ok) {
                        const data = await response.json();
                        setNotifications(data);
                    }
                } catch (error) {
                    console.error('Failed to fetch notifications:', error);
                }
            };
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 10000);
            return () => clearInterval(interval);
        } else {
            setNotifications([]);
        }
    }, [location.pathname]);

    const markAllRead = async () => {
        let user = null;
        try {
            user = JSON.parse(localStorage.getItem('user'));
        } catch (e) {}

        if (!user || !user.id) return;

        try {
            const unreads = notifications.filter(n => !n.read);
            await Promise.all(unreads.map(n => 
                fetch(`${API_URL}/api/marketing/notifications/${n.id}/read`, { method: 'PATCH' })
            ));
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (error) {
            console.error('Failed to mark notifications read:', error);
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    let isAdmin = false;
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.role === 'admin') {
            isAdmin = true;
        }
    } catch (e) {}

    // Scroll to catalog section helper
    const handleCategoryClick = (category) => {
        if (location.pathname !== '/') {
            navigate(`/?category=${encodeURIComponent(category)}`);
        } else {
            // Update search params in URL
            const searchParams = new URLSearchParams(window.location.search);
            if (category === 'All') {
                searchParams.delete('category');
            } else {
                searchParams.set('category', category);
            }
            navigate({ search: searchParams.toString() });
            
            // Scroll to catalog
            setTimeout(() => {
                const catalogSection = document.getElementById('price-filter-range');
                if (catalogSection) {
                    catalogSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 150);
        }
    };

    return (
        <header style={{
            position: 'sticky',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            background: '#ffffff',
            borderBottom: '1px solid #eaeaea',
            boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
        }}>
            {/* ROW 1: Logo, Search Bar, Actions */}
            <div className="wide-header-container" style={{ padding: '0.8rem 4%', borderBottom: '1px solid #f3f4f6' }}>
                {/* Logo */}
                <Link to="/" onClick={clearFilters} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
                    <span style={{ fontSize: '1.75rem' }}>🛍️</span>
                    <span style={{ fontSize: '1.5rem', fontWeight: '900', letterSpacing: '1px', color: '#111827', fontFamily: 'var(--font-main)' }}>
                        Gaya ji Shopping Mart
                    </span>
                </Link>

                {/* Centered Expanded Search Bar */}
                <div style={{ flex: 1, maxWidth: '650px', margin: '0 2.5rem' }}>
                    <div className="search-container">
                        <input
                            id="search"
                            name="search"
                            type="text"
                            placeholder="Search home utilities, fashion, grocery, electronics & more..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                // If not on home page, redirect to home to show search results
                                if (location.pathname !== '/') {
                                    navigate('/');
                                }
                            }}
                            className="search-input"
                        />
                        <button aria-label="Search" className="search-btn" onClick={() => {
                            if (location.pathname !== '/') navigate('/');
                            setTimeout(() => {
                                document.getElementById('price-filter-range')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }, 100);
                        }}>
                            <span>🔍</span> Search
                        </button>
                    </div>
                </div>

                {/* Action Controls with labels */}
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0 }}>
                    {/* Admin Dashboard */}
                    {isAdmin && (
                        <Link to="/admin" className="header-action-item" title="Manage Store">
                            <span className="header-action-icon">🛠️</span>
                            <span className="header-action-label">Manage</span>
                        </Link>
                    )}

                    {/* Track Order */}
                    <Link to="/track-order" className="header-action-item" title="Track Shipment">
                        <span className="header-action-icon">📦</span>
                        <span className="header-action-label">Track</span>
                    </Link>

                    {/* Profile */}
                    <Link to="/profile" className="header-action-item" title="My Account">
                        <span className="header-action-icon">👤</span>
                        <span className="header-action-label">Profile</span>
                    </Link>

                    {/* Notifications */}
                    <div style={{ position: 'relative' }}>
                        <button className="header-action-item" onClick={() => setShowNotifications(!showNotifications)} title="Notifications">
                            <span className="header-action-icon">
                                🔔
                                {unreadCount > 0 && <span className="header-badge">{unreadCount}</span>}
                            </span>
                            <span className="header-action-label">Alerts</span>
                        </button>

                        {/* Dropdown */}
                        {showNotifications && (
                            <div className="glass" style={{
                                position: 'absolute', top: '48px', right: '0',
                                width: '280px', borderRadius: '12px', zIndex: 1001,
                                padding: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                border: '1px solid #eaeaea',
                                background: '#ffffff'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid #eaeaea', paddingBottom: '8px' }}>
                                    <h4 style={{ margin: '0', fontSize: '0.85rem', color: '#121212' }}>
                                        Recent Updates
                                    </h4>
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={markAllRead}
                                            style={{ background: 'none', border: 'none', color: '#6a6a6a', fontSize: '0.7rem', cursor: 'pointer', textDecoration: 'underline' }}
                                        >
                                            Mark all read
                                        </button>
                                    )}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto' }}>
                                    {notifications.length > 0 ? notifications.map(n => (
                                        <div key={n.id} style={{
                                            padding: '8px', background: n.read ? 'transparent' : '#f7f7f8',
                                            borderRadius: '8px', fontSize: '0.8rem', cursor: 'pointer',
                                            transition: '0.2s', borderLeft: n.read ? 'none' : '3px solid #9333ea'
                                        }} onMouseEnter={(e) => e.target.style.background = '#f1f1f1'}>
                                            <p style={{ margin: '0 0 4px 0', color: '#121212', lineHeight: '1.4', fontWeight: n.read ? 'normal' : 'bold' }}>
                                                {n.title}
                                            </p>
                                            <p style={{ margin: '0 0 4px 0', color: 'var(--text-secondary)', fontSize: '0.75rem', lineHeight: '1.3' }}>
                                                {n.message}
                                            </p>
                                            <span style={{ fontSize: '0.65rem', color: '#6a6a6a' }}>
                                                {new Date(n.created_at).toLocaleDateString()} {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    )) : <p style={{ fontSize: '0.8rem', color: '#6a6a6a', textAlign: 'center' }}>No new updates</p>}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Wishlist */}
                    <Link to="/wishlist" className="header-action-item" title="Wishlist">
                        <span className="header-action-icon">
                            ❤️
                            {wishlist.length > 0 && <span className="header-badge">{wishlist.length}</span>}
                        </span>
                        <span className="header-action-label">Wishlist</span>
                    </Link>

                    {/* Cart */}
                    <button
                        className="header-action-item"
                        title="Cart"
                        onClick={onCartClick}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                        <span className="header-action-icon">
                            🛒
                            {cartCount > 0 && <span className="header-badge">{cartCount}</span>}
                        </span>
                        <span className="header-action-label">Cart</span>
                    </button>
                </div>
            </div>

            {/* ROW 2: Sub-navigation Category Menu */}
            <div className="sub-nav-bar">
                <span className="sub-nav-link" onClick={() => handleCategoryClick('All')}>All Products</span>
                <span className="sub-nav-link" onClick={() => handleCategoryClick('Home Utilities')}>Home Utilities</span>
                <span className="sub-nav-link" onClick={() => handleCategoryClick('Personal Care')}>Personal Care</span>
                <span className="sub-nav-link" onClick={() => handleCategoryClick('Mobile & Electronics')}>Mobile & Electronics</span>
                <span className="sub-nav-link" onClick={() => handleCategoryClick('Footwear & Fashion')}>Footwear & Fashion</span>
                <span className="sub-nav-link" onClick={() => handleCategoryClick('Grocery & Essentials')}>Grocery & Essentials</span>
                <span className="sub-nav-link" onClick={() => handleCategoryClick('Toys, Sports & Fitness')}>Toys, Sports & Fitness</span>
                <span style={{ color: '#d1d5db', margin: '0 4px' }}>|</span>
                <Link to="/about-us" className="sub-nav-link" style={{ color: '#6b7280' }}>About Us</Link>
                <Link to="/contact" className="sub-nav-link" style={{ color: '#6b7280' }}>Contact Us</Link>
                <Link to="/return-form" className="sub-nav-link" style={{ color: '#6b7280' }}>Returns</Link>
            </div>
        </header>
    );
};

export default Header;
