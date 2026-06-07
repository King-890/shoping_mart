import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { useCurrency } from '../context/CurrencyContext';
import { API_URL } from '../config/api';

const Profile = () => {
    const { formatPrice } = useCurrency();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('profile');
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [expandedOrderId, setExpandedOrderId] = useState(null);
    const [userReviews, setUserReviews] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const [profileData, setProfileData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        email: ''
    });

    const [address, setAddress] = useState({
        street: '',
        city: '',
        state: '',
        zip: '',
        country: 'India'
    });

    const [preferences, setPreferences] = useState({
        inApp: true,
        email: true,
        sms: false
    });

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const userData = JSON.parse(storedUser);
                setUser(userData);
                setProfileData({
                    firstName: userData.firstName || '',
                    lastName: userData.lastName || '',
                    phone: userData.phone || '',
                    email: userData.email || ''
                });
                if (userData.address) {
                    setAddress({
                        street: userData.address.street || '',
                        city: userData.address.city || '',
                        state: userData.address.state || '',
                        zip: userData.address.zip || '',
                        country: userData.address.country || 'India'
                    });
                }
                if (userData.preferences) {
                    setPreferences(userData.preferences);
                }
            } catch (e) {
                console.error("Local user parse error", e);
                setUser(null);
            }
        } else {
            setUser(null);
        }
    }, []);

    useEffect(() => {
        if (user && activeTab === 'orders') {
            fetchUserOrders();
        }
        if (user && activeTab === 'reviews') {
            fetchUserReviews();
        }
    }, [user, activeTab]);

    const fetchUserOrders = async () => {
        setLoadingOrders(true);
        try {
            const email = user.email || '';
            const userId = user.id || '';
            const res = await fetch(`${API_URL}/api/payment/user-orders/${encodeURIComponent(email)}?userId=${encodeURIComponent(userId)}`);
            if (res.ok) {
                const data = await res.json();
                setOrders(data || []);
            } else {
                setOrders([]);
            }
        } catch (error) {
            console.error('Error fetching user orders:', error);
            setOrders([]);
        } finally {
            setLoadingOrders(false);
        }
    };

    const fetchUserReviews = async () => {
        setLoadingReviews(true);
        try {
            setUserReviews([]);
        } catch (error) {
            console.error('Error fetching user reviews:', error);
        } finally {
            setLoadingReviews(false);
        }
    };

    const handleCancelOrder = async (orderId) => {
        if (window.confirm('Are you sure you want to cancel this order?')) {
            try {
                const res = await fetch(`${API_URL}/api/payment/orders/${orderId}/status`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'Cancelled' })
                });
                if (res.ok) {
                    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Cancelled' } : o));
                    showToast('Order cancelled successfully. 🛑');
                } else {
                    showToast('Failed to cancel order. Please try again.', 'error');
                }
            } catch (err) {
                showToast('Network error. Please try again.', 'error');
            }
        }
    };

    const handleProfileChange = (e) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const handleAddressChange = (e) => {
        setAddress({ ...address, [e.target.name]: e.target.value });
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        try {
            const updatedUser = { ...user, ...profileData };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            setIsEditing(false);
            showToast('Profile Updated Successfully! ✨', 'success');
        } catch (error) {
            console.error('Profile Update Error:', error);
            showToast(`Update Failed: ${error.message}`, 'error');
        }
    };

    const handleSaveAddress = async (e) => {
        e.preventDefault();
        try {
            const updatedUser = { ...user, address };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            showToast('Shipping Address Saved! 📦', 'success');
        } catch (error) {
            console.error('Address Update Error:', error);
            showToast(`Save Failed: ${error.message}`, 'error');
        }
    };

    const handleSavePreferences = async () => {
        try {
            const updatedUser = { ...user, preferences };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            showToast('Preferences Saved! 🔔', 'success');
        } catch (error) {
            console.error('Preferences Update Error:', error);
            showToast('Failed to save preferences.', 'error');
        }
    };

    const handleLogout = async () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    if (!user) {
        return (
            <div className="container" style={{ paddingTop: '2.5rem', textAlign: 'center', minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="glass" style={{ padding: '3rem 2rem', maxWidth: '420px', width: '100%', margin: '0 auto', borderRadius: '16px', background: '#ffffff', border: '1px solid #eaeaea' }}>
                    <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>👤</span>
                    <h2 style={{ marginBottom: '0.8rem', color: '#111827', fontSize: '1.5rem', fontWeight: '800' }}>Welcome to Gaya ji Shopping Mart!</h2>
                    <p style={{ color: '#6b7280', marginBottom: '2rem', fontSize: '0.88rem', lineHeight: '1.5' }}>Please log in to manage your profile, shipping addresses, track shipments, and view order history.</p>
                    <button
                        onClick={() => navigate('/login')}
                        className="btn-primary"
                        style={{ width: '100%', padding: '12px', fontWeight: 'bold' }}
                    >
                        Login Now
                    </button>
                    <p style={{ marginTop: '1.2rem', color: '#6b7280', fontSize: '0.85rem' }}>
                        New to Gaya ji Shopping Mart? <span onClick={() => navigate('/signup')} style={{ color: '#9333ea', cursor: 'pointer', fontWeight: '600' }}>Create Account</span>
                    </p>
                </div>
            </div>
        );
    }

    const getStatusStep = (status) => {
        const steps = ['Processing', 'Shipped', 'Delivered'];
        if (status === 'Cancelled') return -1;
        return steps.indexOf(status);
    };

    const OrderTimeline = ({ status }) => {
        const steps = [
            { label: 'Order Confirmed', desc: 'Your order has been received.', icon: '✓' },
            { label: 'Shipped', desc: 'Your package is on the way.', icon: '🚚' },
            { label: 'Delivered', desc: 'Package delivered successfully!', icon: '🎉' }
        ];
        const currentStep = getStatusStep(status);

        return (
            <div className="order-track-timeline">
                {steps.map((step, idx) => {
                    const isDone = currentStep > idx;
                    const isActive = currentStep === idx;
                    const dotClass = isDone ? 'done' : isActive ? 'active' : '';
                    const stepClass = isDone ? 'completed' : '';
                    return (
                        <div key={idx} className={`timeline-step ${stepClass}`}>
                            <div className={`timeline-dot ${dotClass}`}>{isDone ? '✓' : isActive ? step.icon : ''}</div>
                            <div className="timeline-content">
                                <h5>{step.label}</h5>
                                <p>{isActive ? step.desc : isDone ? 'Completed' : 'Pending'}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderOrders = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {loadingOrders ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                    <div style={{ width: '32px', height: '32px', border: '3px solid #e5e7eb', borderTopColor: '#9333ea', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }}></div>
                    <p>Loading your orders...</p>
                </div>
            ) : orders.length === 0 ? (
                <div className="glass" style={{ padding: '3rem 1.5rem', textAlign: 'center', borderRadius: '16px', background: '#ffffff', border: '1px solid #eaeaea' }}>
                    <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '1rem' }}>📦</span>
                    <p style={{ color: '#6b7280', marginBottom: '1.5rem', fontSize: '0.88rem' }}>You haven't placed any orders yet.</p>
                    <button className="btn-primary" onClick={() => navigate('/')} style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>START SHOPPING</button>
                </div>
            ) : (
                orders.map(order => (
                    <div key={order.id} className="glass" style={{ padding: '1.5rem', borderRadius: '12px', background: '#ffffff', border: '1px solid #eaeaea', borderLeft: `4px solid ${order.status === 'Cancelled' ? '#ef4444' : '#9333ea'}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <div>
                                <h4 style={{ color: '#111827', margin: '0 0 4px 0', fontFamily: 'monospace', fontSize: '0.9rem' }}>Order #{order.id.slice(0, 12)}...</h4>
                                <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: 0 }}>Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: '2px 0 0 0' }}>Payment: {order.paymentMethod} — {order.paymentStatus}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <span style={{
                                    padding: '4px 12px', borderRadius: '50px', fontSize: '0.72rem', fontWeight: 'bold',
                                    background: order.status === 'Cancelled' ? '#fef2f2' : order.status === 'Delivered' ? '#f0fdf4' : '#f5f3ff',
                                    color: order.status === 'Cancelled' ? '#b91c1c' : order.status === 'Delivered' ? '#15803d' : '#6b21a8',
                                    border: `1px solid ${order.status === 'Cancelled' ? '#fca5a5' : order.status === 'Delivered' ? '#86efac' : '#d8b4fe'}`
                                }}>{order.status.toUpperCase()}</span>
                                <p style={{ marginTop: '8px', color: '#111827', fontWeight: '800', margin: '8px 0 0 0', fontSize: '1rem' }}>{formatPrice(order.totalAmount)}</p>
                            </div>
                        </div>

                        <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '0.8rem', marginBottom: '0.8rem' }}>
                            <p style={{ fontSize: '0.82rem', color: '#4b5563', margin: '0 0 8px 0' }}>
                                <strong>Items:</strong> {order.items.map(i => `${i.name}${i.quantity > 1 ? ` ×${i.quantity}` : ''}`).join(', ')}
                            </p>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                            {order.status !== 'Cancelled' && (
                                <button
                                    onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                                    style={{ background: '#f5f3ff', border: '1px solid #d8b4fe', color: '#7c3aed', padding: '6px 14px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer', transition: '0.2s' }}
                                >
                                    {expandedOrderId === order.id ? 'HIDE TRACKING' : '📍 TRACK ORDER'}
                                </button>
                            )}
                            {order.status === 'Processing' && (
                                <button
                                    onClick={() => handleCancelOrder(order.id)}
                                    style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '6px 14px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '600', cursor: 'pointer', transition: '0.2s' }}
                                >
                                    CANCEL ORDER
                                </button>
                            )}
                        </div>

                        {expandedOrderId === order.id && order.status !== 'Cancelled' && (
                            <OrderTimeline status={order.status} />
                        )}
                    </div>
                ))
            )}
        </div>
    );



    const labelStyle = {
        display: 'block',
        marginBottom: '0.5rem',
        color: '#374151',
        fontWeight: '600',
        fontSize: '0.82rem'
    };

    const displayName = (user.firstName || user.lastName)
        ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
        : (user.email ? user.email.split('@')[0] : 'Valued Customer');

    const userInitials = user.firstName
        ? user.firstName[0].toUpperCase()
        : (user.email ? user.email[0].toUpperCase() : 'U');

    return (
        <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem', minHeight: '85vh' }}>
            <div className="glass" style={{ 
                padding: '2.5rem 2rem', 
                marginBottom: '2rem', 
                borderRadius: '16px', 
                background: 'linear-gradient(135deg, #faf5ff 0%, #ffffff 100%)', 
                border: '1px solid #f3e8ff',
                boxShadow: '0 4px 20px rgba(147, 51, 234, 0.015)'
            }}>
                <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '900', color: '#111827', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#9333ea' }}>⚙️</span> My Account Dashboard
                </h2>
                <p style={{ margin: '0.4rem 0 0 0', color: '#6b7280', fontSize: '0.88rem', paddingLeft: '1.8rem' }}>
                    Manage your personal security settings, address directory, and transaction histories.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem' }}>
                {/* Sidebar Menu */}
                <div className="glass" style={{
                    padding: '1.8rem',
                    borderRadius: '16px',
                    height: 'fit-content',
                    background: '#ffffff',
                    border: '1px solid #eaeaea',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.015)'
                }}>
                    <div style={{ textAlign: 'center', marginBottom: '2rem', borderBottom: '1px solid #f3f4f6', paddingBottom: '1.5rem' }}>
                        <div style={{
                            width: '74px', height: '74px', 
                            background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)',
                            borderRadius: '50%', margin: '0 auto 0.8rem', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem',
                            color: '#ffffff', fontWeight: 'bold', border: '3px solid #f3e8ff',
                            boxShadow: '0 4px 12px rgba(147, 51, 234, 0.15)'
                        }}>
                            {userInitials}
                        </div>
                        <h3 style={{ color: '#111827', fontSize: '1.1rem', fontWeight: '800', margin: '0 0 4px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={displayName}>
                            {displayName}
                        </h3>
                        <p style={{ fontSize: '0.78rem', color: '#6b7280', margin: 0 }}>Customer since 2026</p>

                        {user.totalSpent >= 5000 && (
                            <div style={{
                                marginTop: '0.8rem', background: 'linear-gradient(45deg, #fbbf24, #f59e0b)',
                                color: '#ffffff', padding: '4px 12px', borderRadius: '50px',
                                fontSize: '0.68rem', fontWeight: 'bold', display: 'inline-block'
                            }}>
                                🏆 Gaya ji Shopping Mart GOLD MEMBER
                            </div>
                        )}
                        {user.role === 'admin' && (
                            <div style={{ marginTop: '0.6rem' }}>
                                <span style={{ background: '#111827', color: '#ffffff', padding: '4px 10px', borderRadius: '50px', fontSize: '0.68rem', fontWeight: 'bold', display: 'inline-block' }}>
                                    ADMIN
                                </span>
                            </div>
                        )}
                    </div>
                    
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {[
                            { id: 'profile', label: '👤 Profile & Security' },
                            { id: 'address', label: '📍 Address Directory' },
                            { id: 'orders', label: '📦 Order History' },
                            { id: 'reviews', label: '⭐ Product Reviews' },
                            { id: 'refer', label: '🎁 Refer & Earn' },
                            { id: 'notifications', label: '🔔 Notifications' }
                        ].map(tab => (
                            <li
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    padding: '10px 14px',
                                    color: activeTab === tab.id ? '#9333ea' : '#4b5563',
                                    background: activeTab === tab.id ? '#faf5ff' : 'transparent',
                                    fontWeight: activeTab === tab.id ? '700' : '500',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseOver={(e) => { if (activeTab !== tab.id) e.currentTarget.style.background = '#f9fafb'; }}
                                onMouseOut={(e) => { if (activeTab !== tab.id) e.currentTarget.style.background = 'transparent'; }}
                            >
                                {tab.label}
                            </li>
                        ))}
                        <li style={{ padding: '1.2rem 0 0 0', borderTop: '1px solid #f3f4f6', marginTop: '0.8rem' }}>
                            <button onClick={handleLogout} style={{ background: 'transparent', border: '1px solid #fca5a5', color: '#ef4444', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', width: '100%', fontSize: '0.82rem', fontWeight: '700', transition: '0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#fef2f2'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>Logout</button>
                        </li>
                    </ul>
                </div>

                {/* Main Content Area */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* Tab 1: Profile Details */}
                    {activeTab === 'profile' && (
                        <div className="glass" style={{ padding: '2.5rem', borderRadius: '16px', background: '#ffffff', border: '1px solid #eaeaea' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.8rem', borderBottom: '1px solid #f3f4f6', paddingBottom: '0.8rem' }}>
                                <h3 style={{ color: '#111827', fontSize: '1.15rem', fontWeight: '800', margin: 0 }}>Personal Information</h3>
                                <button onClick={() => setIsEditing(!isEditing)} style={{ background: 'none', border: 'none', color: '#9333ea', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '700' }}>
                                    {isEditing ? 'Cancel' : 'Edit Info'}
                                </button>
                            </div>
                            <form onSubmit={handleSaveProfile}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.2rem' }}>
                                    <div>
                                        <label htmlFor="firstName" style={labelStyle}>First Name</label>
                                        <input id="firstName" type="text" name="firstName" value={profileData.firstName} onChange={handleProfileChange} disabled={!isEditing} autoComplete="given-name"
                                            className="profile-input" />
                                    </div>
                                    <div>
                                        <label htmlFor="lastName" style={labelStyle}>Last Name</label>
                                        <input id="lastName" type="text" name="lastName" value={profileData.lastName} onChange={handleProfileChange} disabled={!isEditing} autoComplete="family-name"
                                            className="profile-input" />
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.8rem' }}>
                                    <div>
                                        <label htmlFor="profilePhone" style={labelStyle}>Phone Number</label>
                                        <input id="profilePhone" name="phone" type="tel" value={profileData.phone} onChange={handleProfileChange} disabled={!isEditing} autoComplete="tel"
                                            className="profile-input" />
                                    </div>
                                    <div>
                                        <label htmlFor="profileEmail" style={labelStyle}>Email (Non-Editable)</label>
                                        <input id="profileEmail" name="email" type="email" value={profileData.email} disabled
                                            className="profile-input" />
                                    </div>
                                </div>
                                {isEditing && <button className="btn-primary" type="submit" style={{ padding: '10px 24px', fontWeight: 'bold' }}>Save Changes</button>}
                            </form>
                        </div>
                    )}

                    {/* Tab 2: Address Directory */}
                    {activeTab === 'address' && (
                        <div className="glass" style={{ padding: '2.5rem', borderRadius: '16px', background: '#ffffff', border: '1px solid #eaeaea' }}>
                            <h3 style={{ marginBottom: '1.8rem', color: '#111827', fontSize: '1.15rem', fontWeight: '800', borderBottom: '1px solid #f3f4f6', paddingBottom: '0.8rem' }}>Delivery Address Book</h3>
                            <form onSubmit={handleSaveAddress}>
                                <div style={{ marginBottom: '1.2rem' }}>
                                    <label htmlFor="street" style={labelStyle}>Street Address</label>
                                    <input id="street" type="text" name="street" value={address.street} onChange={handleAddressChange} autoComplete="street-address" className="profile-input" />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.2rem', marginBottom: '1.2rem' }}>
                                    <div>
                                        <label htmlFor="city" style={labelStyle}>City</label>
                                        <input id="city" type="text" name="city" value={address.city} onChange={handleAddressChange} autoComplete="address-level2" className="profile-input" />
                                    </div>
                                    <div>
                                        <label htmlFor="state" style={labelStyle}>State</label>
                                        <input id="state" type="text" name="state" value={address.state} onChange={handleAddressChange} autoComplete="address-level1" className="profile-input" />
                                    </div>
                                    <div>
                                        <label htmlFor="zip" style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: '600', fontSize: '0.82rem' }}>ZIP / Postal Code</label>
                                        <input id="zip" type="text" name="zip" value={address.zip} onChange={handleAddressChange} autoComplete="postal-code" className="profile-input" />
                                    </div>
                                </div>
                                <div style={{ marginBottom: '2rem' }}>
                                    <label htmlFor="country" style={labelStyle}>Country</label>
                                    <input id="country" type="text" name="country" value={address.country} onChange={handleAddressChange} autoComplete="country-name" className="profile-input" />
                                </div>
                                <button className="btn-primary" type="submit" style={{ padding: '10px 24px', fontWeight: 'bold' }}>Save Address</button>
                            </form>
                        </div>
                    )}

                    {/* Tab 3: Orders List */}
                    {activeTab === 'orders' && renderOrders()}

                    {/* Tab 4: Product Reviews */}
                    {activeTab === 'reviews' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {loadingReviews ? (
                                <p style={{ color: '#4b5563', textAlign: 'center' }}>Loading reviews...</p>
                            ) : userReviews.length === 0 ? (
                                <div className="glass" style={{ padding: '3rem 1.5rem', textAlign: 'center', borderRadius: '16px', background: '#ffffff', border: '1px solid #eaeaea' }}>
                                    <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '1rem' }}>⭐</span>
                                    <p style={{ color: '#6b7280', fontSize: '0.88rem' }}>You haven't reviewed any products yet.</p>
                                </div>
                            ) : (
                                userReviews.map(review => (
                                    <div key={review.id} className="glass" style={{ padding: '1.5rem', borderRadius: '12px', background: '#ffffff', border: '1px solid #eaeaea' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <h4 style={{ color: '#9333ea', margin: 0 }}>{review.products?.name}</h4>
                                            <div style={{ color: '#fbbf24' }}>{'★'.repeat(review.rating)}</div>
                                        </div>
                                        <p style={{ color: '#4b5563', fontSize: '0.9rem', margin: '0.4rem 0' }}>{review.comment}</p>
                                        <span style={{ fontSize: '0.72rem', color: '#9ca3af' }}>{new Date(review.created_at).toLocaleDateString()}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* Tab 5: Refer and Earn */}
                    {activeTab === 'refer' && (
                        <div className="glass animate-slide-up" style={{
                            padding: '3rem 2rem',
                            borderRadius: '16px',
                            textAlign: 'center',
                            border: '1px solid #e9d5ff',
                            background: 'radial-gradient(circle at top right, #faf5ff, #ffffff)'
                        }}>
                            <div style={{ fontSize: '3.5rem', marginBottom: '1.2rem' }}>💎</div>
                            <h3 style={{ color: '#111827', fontSize: '1.35rem', fontWeight: '800', marginBottom: '0.8rem', letterSpacing: '-0.01em' }}>Refer & Earn Program</h3>
                            <p style={{ color: '#4b5563', marginBottom: '2rem', maxWidth: '420px', margin: '0 auto 2rem', fontSize: '0.88rem', lineHeight: '1.5' }}>
                                Share your love for Gaya ji Shopping mart! Invite your friends to register and receive <strong>{formatPrice(100)}</strong> in shopping credits on their first purchase.
                            </p>

                            <div style={{
                                background: '#f9fafb',
                                border: '2px dashed #c084fc',
                                padding: '1.2rem 2rem',
                                borderRadius: '12px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '1.5rem',
                                marginBottom: '1.5rem',
                                maxWidth: '100%',
                                flexWrap: 'wrap',
                                justifyContent: 'center'
                            }}>
                                <span style={{
                                    fontFamily: 'monospace',
                                    fontSize: '1.25rem',
                                    color: '#6b21a8',
                                    letterSpacing: '2px',
                                    fontWeight: 'bold'
                                }}>
                                    GJM-{user.firstName?.toUpperCase() || 'USER'}-2026
                                </span>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(`GJM-${user.firstName?.toUpperCase() || 'USER'}-2026`);
                                        showToast('Referral Code Copied! 📡', 'success');
                                    }}
                                    style={{
                                        background: '#9333ea', color: '#ffffff', border: 'none',
                                        borderRadius: '6px', padding: '8px 16px', fontSize: '0.78rem',
                                        fontWeight: 'bold', cursor: 'pointer', transition: '0.2s'
                                    }}
                                    onMouseOver={(e) => e.target.style.background = '#7e22ce'}
                                    onMouseOut={(e) => e.target.style.background = '#9333ea'}
                                >COPY CODE</button>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', marginTop: '2rem', borderTop: '1px solid #f3f4f6', paddingTop: '1.5rem' }}>
                                <div>
                                    <p style={{ fontSize: '0.7rem', color: '#6b7280', textTransform: 'uppercase', margin: '0 0 4px 0', fontWeight: 'bold' }}>Credits Earned</p>
                                    <p style={{ fontSize: '1.3rem', color: '#111827', fontWeight: '800', margin: 0 }}>{formatPrice(0)}</p>
                                </div>
                                <div style={{ borderLeft: '1px solid #e5e7eb' }}></div>
                                <div>
                                    <p style={{ fontSize: '0.7rem', color: '#6b7280', textTransform: 'uppercase', margin: '0 0 4px 0', fontWeight: 'bold' }}>Successful Referrals</p>
                                    <p style={{ fontSize: '1.3rem', color: '#111827', fontWeight: '800', margin: 0 }}>0</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab 6: Notifications Preferences */}
                    {activeTab === 'notifications' && (
                        <div className="glass" style={{ padding: '2.5rem', borderRadius: '16px', background: '#ffffff', border: '1px solid #eaeaea' }}>
                            <h3 style={{ marginBottom: '1rem', color: '#111827', fontSize: '1.15rem', fontWeight: '800', borderBottom: '1px solid #f3f4f6', paddingBottom: '0.8rem' }}>Notification Settings</h3>
                            <p style={{ color: '#6b7280', marginBottom: '2.2rem', fontSize: '0.85rem' }}>Control how you receive system transaction statements, order shipping updates, and custom campaign reminders.</p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1.2rem', borderBottom: '1px solid #f3f4f6' }}>
                                    <div>
                                        <h4 style={{ color: '#111827', margin: '0 0 4px 0', fontSize: '0.92rem', fontWeight: '700' }}>In-App Notifications</h4>
                                        <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: 0 }}>Get real-time updates inside the browser app for order statuses and support messages.</p>
                                    </div>
                                    <input
                                        id="pref-in-app"
                                        name="pref_in_app"
                                        type="checkbox"
                                        checked={preferences.inApp}
                                        onChange={(e) => setPreferences({ ...preferences, inApp: e.target.checked })}
                                        style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#9333ea' }}
                                    />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h4 style={{ color: '#111827', margin: '0 0 4px 0', fontSize: '0.92rem', fontWeight: '700' }}>SMS Alerts</h4>
                                        <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: 0 }}>Get high-priority tracking alerts and dispatch alerts sent straight to your phone.</p>
                                    </div>
                                    <input
                                        id="pref-sms"
                                        name="pref_sms"
                                        type="checkbox"
                                        checked={preferences.sms}
                                        onChange={(e) => setPreferences({ ...preferences, sms: e.target.checked })}
                                        style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#9333ea' }}
                                    />
                                </div>
                            </div>

                            <button className="btn-primary" onClick={handleSavePreferences} style={{ marginTop: '2.5rem', width: '100%', fontWeight: 'bold' }}>SAVE PREFERENCES</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
