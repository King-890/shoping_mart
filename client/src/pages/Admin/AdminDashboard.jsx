import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCurrency } from '../../context/CurrencyContext';
import { useToast } from '../../context/ToastContext';
import API_URL from '../../config/api';

const AdminDashboard = () => {
    const { formatPrice } = useCurrency();
    const { showToast } = useToast();
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [stats, setStats] = useState({ revenue: 0, investment: 0, profit: 0 });
    const [settings, setSettings] = useState({ facebook: '', instagram: '', phone: '+91 9508952676', email: 'shoppingmartgayaji@gmail.com' });

    // New Tab Management States
    const [activeTab, setActiveTab] = useState('operations');
    const [users, setUsers] = useState([]);
    const [reels, setReels] = useState([]);
    const [newMember, setNewMember] = useState({ email: '', password: '', firstName: '', lastName: '', role: 'user' });
    const [newReel, setNewReel] = useState({ productId: '', videoUrl: '' });
    const [memberLoading, setMemberLoading] = useState(false);
    const [reelLoading, setReelLoading] = useState(false);
    const [mediaFile, setMediaFile] = useState(null);

    // Fetch products
    const fetchProducts = async () => {
        try {
            const res = await fetch(`${API_URL}/api/products`);
            const data = await res.json();
            setProducts(data || []);
        } catch (error) {
            console.error('Error fetching products:', error);
            setProducts([]);
        }
    };

    // Fetch orders for analytics
    const fetchOrders = async () => {
        try {
            const res = await fetch(`${API_URL}/api/payment/orders`);
            const data = await res.json();

            const calculatedStats = (data || []).reduce((acc, order) => {
                acc.revenue += (order.totalAmount || 0);
                acc.investment += (order.totalCost || 0);
                return acc;
            }, { revenue: 0, investment: 0 });

            setOrders(data || []);
            setStats({ ...calculatedStats, profit: calculatedStats.revenue - calculatedStats.investment });
        } catch (error) {
            console.error('Error fetching orders for stats:', error);
        }
    };

    const fetchSettings = async () => {
        try {
            const res = await fetch(`${API_URL}/api/settings`);
            const data = await res.json();
            if (data) setSettings(data);
        } catch (error) {
            console.error('Error fetching settings:', error);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await fetch(`${API_URL}/api/auth/users`);
            const data = await res.json();
            setUsers(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const fetchReels = async () => {
        try {
            const res = await fetch(`${API_URL}/api/marketing/reels`);
            const data = await res.json();
            setReels(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching reels:', error);
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchOrders();
        fetchSettings();
        fetchUsers();
        fetchReels();
    }, []);

    const handleSettingsUpdate = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/api/settings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });

            if (!res.ok) throw new Error('Update failed');
            alert('Settings updated! ✅');
        } catch (error) {
            console.error('Error updating settings:', error);
            alert(`Error: ${error.message}.`);
        }
    };

    const handleDelete = async (id) => {
        if (!id) {
            alert('Invalid Product ID. Deletion aborted.');
            return;
        }

        if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
            try {
                const res = await fetch(`${API_URL}/api/products/${id}`, {
                    method: 'DELETE'
                });

                if (!res.ok) {
                    const err = await res.json();
                    throw new Error(err.message || 'Deletion failed');
                }

                setProducts(prev => prev.filter(p => (p.id || p._id) !== id));
                showToast('Product successfully purged! 🗑️', 'success');
            } catch (error) {
                console.error('Critical Deletion Error:', error);
                alert(`OPERATION FAILED: ${error.message}`);
            }
        }
    };

    const exportOrdersCSV = () => {
        if (orders.length === 0) {
            showToast('No orders to export!', 'error');
            return;
        }
        const headers = ['Order ID', 'Customer', 'Email', 'Items', 'Total Amount', 'Payment Method', 'Payment Status', 'Status', 'Date'];
        const rows = orders.map(order => [
            order.id,
            order.name || '',
            order.email || '',
            (order.items || []).map(i => `${i.name}${i.quantity > 1 ? ` x${i.quantity}` : ''}`).join('; '),
            order.totalAmount || 0,
            order.paymentMethod || '',
            order.paymentStatus || '',
            order.status || '',
            order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN') : ''
        ]);
        const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `gayaji_atoz_mart_orders_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('Orders exported as CSV! 📊', 'success');
    };

    // User management action handlers
    const handleRoleChange = async (userId, newRole) => {
        try {
            const res = await fetch(`${API_URL}/api/auth/users/${userId}/role`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to change role');
            setUsers(prev => prev.map(u => (u.id === userId || u._id === userId) ? { ...u, role: newRole } : u));
            showToast('Member role updated! 👑', 'success');
        } catch (error) {
            showToast(error.message, 'error');
        }
    };

    const handleAddMember = async (e) => {
        e.preventDefault();
        setMemberLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/auth/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newMember)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to add member');
            setUsers(prev => [...prev, data.user]);
            setNewMember({ email: '', password: '', firstName: '', lastName: '', role: 'user' });
            showToast('New team member registered! 🎉', 'success');
        } catch (error) {
            showToast(error.message, 'error');
        } finally {
            setMemberLoading(false);
        }
    };

    const handleDeleteMember = async (userId) => {
        if (window.confirm('Are you sure you want to remove this member?')) {
            try {
                const res = await fetch(`${API_URL}/api/auth/users/${userId}`, {
                    method: 'DELETE'
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || 'Failed to delete member');
                setUsers(prev => prev.filter(u => u.id !== userId && u._id !== userId));
                showToast('Member removed from team! 🗑️', 'success');
            } catch (error) {
                showToast(error.message, 'error');
            }
        }
    };

    // Reels management action handlers
    const handleAddReel = async (e) => {
        e.preventDefault();
        if (!newReel.productId) {
            showToast('Please select a product!', 'error');
            return;
        }
        setReelLoading(true);
        try {
            let videoUrl = newReel.videoUrl;

            if (mediaFile) {
                const uploadData = new FormData();
                uploadData.append('file', mediaFile);
                const uploadRes = await fetch(`${API_URL}/api/products/upload-media`, {
                    method: 'POST',
                    body: uploadData
                });
                if (!uploadRes.ok) throw new Error('Video upload failed');
                const uploadJson = await uploadRes.json();
                videoUrl = uploadJson.fileUrl;
            }

            if (!videoUrl) {
                throw new Error('Please select a video file to upload or enter a video URL.');
            }

            const product = products.find(p => p.id === newReel.productId || p._id === newReel.productId);
            if (!product) throw new Error('Selected product not found in catalog');

            const reelData = {
                productId: product.id || product._id,
                productName: product.name,
                productPrice: product.price,
                productImage: product.image,
                videoUrl: videoUrl
            };

            const res = await fetch(`${API_URL}/api/marketing/reels`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reelData)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to create reel');

            setReels(prev => [...prev, data]);
            setNewReel({ productId: '', videoUrl: '' });
            setMediaFile(null);
            
            const fileInput = document.getElementById('reel-video-file');
            if (fileInput) fileInput.value = '';
            
            showToast('Product video reel linked successfully! 🎥', 'success');
        } catch (error) {
            showToast(error.message, 'error');
        } finally {
            setReelLoading(false);
        }
    };

    const handleDeleteReel = async (reelId) => {
        if (window.confirm('Delete this video reel?')) {
            try {
                const res = await fetch(`${API_URL}/api/marketing/reels/${reelId}`, {
                    method: 'DELETE'
                });
                if (!res.ok) throw new Error('Deletion failed');
                setReels(prev => prev.filter(r => r.id !== reelId && r._id !== reelId));
                showToast('Reel purged! 🗑️', 'success');
            } catch (error) {
                showToast(error.message, 'error');
            }
        }
    };

    // Build weekly revenue data for chart
    const getWeeklyRevenue = () => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dayTotals = Array(7).fill(0);
        const now = new Date();
        orders.forEach(order => {
            const d = new Date(order.created_at);
            const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
            if (diffDays < 7) {
                dayTotals[d.getDay()] += (order.totalAmount || 0);
            }
        });
        const sorted = [];
        for (let i = 6; i >= 0; i--) {
            const dayIdx = ((now.getDay() - i) + 7) % 7;
            sorted.push({ label: days[dayIdx], value: dayTotals[dayIdx] });
        }
        return sorted;
    };

    const weeklyData = getWeeklyRevenue();
    const maxWeeklyVal = Math.max(...weeklyData.map(d => d.value), 1);

    const getMonthlyRevenue = () => {
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        const monthTotals = Array(12).fill(0);
        orders.forEach(order => {
            const d = new Date(order.created_at);
            if (!isNaN(d)) monthTotals[d.getMonth()] += (order.totalAmount || 0);
        });
        return months.map((label, i) => ({ label, value: monthTotals[i] }));
    };

    const [chartMode, setChartMode] = useState('weekly');
    const chartData = chartMode === 'weekly' ? weeklyData : getMonthlyRevenue();
    const maxChartVal = Math.max(...chartData.map(d => d.value), 1);

    return (
        <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem', minHeight: '100vh', color: 'var(--text-primary)' }}>
            {/* Dashboard Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.25rem', fontWeight: '800', margin: 0, letterSpacing: '-0.03em' }}>Admin Operations Hub</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '4px 0 0 0' }}>Configure settings, track store performance, and manage assets.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Link to="/admin/orders" className="btn-primary" style={{ textDecoration: 'none', background: '#9333ea', borderColor: '#9333ea', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        📦 Manage Orders
                    </Link>
                    <Link to="/admin/add" className="btn-primary" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        ➕ Add Product
                    </Link>
                </div>
            </div>

            {/* Premium Tab Bar */}
            <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid #eaeaea', marginBottom: '2rem', paddingBottom: '10px' }}>
                {[
                    { id: 'operations', label: '📊 Operations & Products' },
                    { id: 'members', label: '👥 Team Members' },
                    { id: 'reels', label: '🎥 Video Reels' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            padding: '10px 20px',
                            borderRadius: '8px',
                            border: '1px solid #e5e7eb',
                            background: activeTab === tab.id ? '#9333ea' : '#fff',
                            color: activeTab === tab.id ? '#fff' : 'var(--text-primary)',
                            cursor: 'pointer',
                            fontSize: '0.88rem',
                            fontWeight: '700',
                            transition: '0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === 'operations' && (
                <>
                    {/* Business Analytics Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
                        {/* Revenue Card */}
                        <div className="glass" style={{
                            padding: '2rem',
                            borderRadius: '16px',
                            border: '1px solid #eaeaea',
                            borderTop: '4px solid #3b82f6',
                            background: '#ffffff',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                            transition: 'transform 0.3s ease',
                            cursor: 'default'
                        }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.8rem' }}>
                                <span style={{ fontSize: '1.2rem' }}>💰</span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: '700' }}>Gross Revenue</span>
                            </div>
                            <h2 style={{ margin: 0, fontSize: '2.25rem', fontWeight: '800', color: '#111827' }}>{formatPrice(stats.revenue)}</h2>
                            <div style={{ marginTop: '0.8rem', height: '2px', background: '#3b82f6', width: '40%' }}></div>
                            <p style={{ marginTop: '0.8rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>From {orders.length} successfully completed sales</p>
                        </div>

                        {/* Investment Card */}
                        <div className="glass" style={{
                            padding: '2rem',
                            borderRadius: '16px',
                            border: '1px solid #eaeaea',
                            borderTop: '4px solid #8b5cf6',
                            background: '#ffffff',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                            transition: 'transform 0.3s ease',
                            cursor: 'default'
                        }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.8rem' }}>
                                <span style={{ fontSize: '1.2rem' }}>🏗️</span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: '700' }}>Total Cost Basis</span>
                            </div>
                            <h2 style={{ margin: 0, fontSize: '2.25rem', fontWeight: '800', color: '#111827' }}>{formatPrice(stats.investment)}</h2>
                            <div style={{ marginTop: '0.8rem', height: '2px', background: '#8b5cf6', width: '40%' }}></div>
                            <p style={{ marginTop: '0.8rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Hardware baseline inventory cost</p>
                        </div>

                        {/* Net Profit Card */}
                        <div className="glass" style={{
                            padding: '2rem',
                            borderRadius: '16px',
                            border: '1px solid #eaeaea',
                            borderTop: `4px solid ${stats.profit >= 0 ? '#10b981' : '#ef4444'}`,
                            background: '#ffffff',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                            transition: 'transform 0.3s ease',
                            cursor: 'default'
                        }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.8rem' }}>
                                <span style={{ fontSize: '1.2rem' }}>📈</span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: '700' }}>Net Profit Yield</span>
                            </div>
                            <h2 style={{ margin: 0, fontSize: '2.25rem', fontWeight: '800', color: stats.profit >= 0 ? '#10b981' : '#ef4444' }}>{formatPrice(stats.profit)}</h2>
                            <div style={{ marginTop: '0.8rem', height: '2px', background: stats.profit >= 0 ? '#10b981' : '#ef4444', width: '40%' }}></div>
                            <p style={{ marginTop: '0.8rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Surplus yield after cost clearance</p>
                        </div>
                    </div>

                    {/* SVG Revenue Chart + Quick Stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem', marginBottom: '3rem' }}>
                        {/* Revenue Chart */}
                        <div className="analytics-chart-container" style={{ background: '#ffffff', padding: '2rem', borderRadius: '16px', border: '1px solid #eaeaea' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '12px' }}>
                                <div>
                                    <h3 style={{ margin: 0, fontWeight: '800', color: 'var(--text-primary)', fontSize: '1.05rem' }}>Revenue Analytics</h3>
                                    <p style={{ margin: '2px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>Sales performance over time</p>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <button
                                        onClick={() => setChartMode('weekly')}
                                        style={{ padding: '5px 14px', borderRadius: '6px', border: '1px solid #e5e7eb', background: chartMode === 'weekly' ? '#9333ea' : '#fff', color: chartMode === 'weekly' ? '#fff' : 'var(--text-primary)', cursor: 'pointer', fontSize: '0.78rem', fontWeight: '600', transition: '0.2s' }}
                                    >7 Days</button>
                                    <button
                                        onClick={() => setChartMode('monthly')}
                                        style={{ padding: '5px 14px', borderRadius: '6px', border: '1px solid #e5e7eb', background: chartMode === 'monthly' ? '#9333ea' : '#fff', color: chartMode === 'monthly' ? '#fff' : 'var(--text-primary)', cursor: 'pointer', fontSize: '0.78rem', fontWeight: '600', transition: '0.2s' }}
                                    >12 Months</button>
                                    <button
                                        onClick={exportOrdersCSV}
                                        style={{ padding: '5px 14px', borderRadius: '6px', border: '1px solid #d8b4fe', background: '#faf5ff', color: '#7c3aed', cursor: 'pointer', fontSize: '0.78rem', fontWeight: '700', transition: '0.2s' }}
                                    >⬇️ Export CSV</button>
                                </div>
                            </div>

                            {/* SVG Bar Chart */}
                            <svg viewBox={`0 0 ${chartData.length * 60} 180`} style={{ width: '100%', height: '180px', overflow: 'visible' }}>
                                {/* Y-axis gridlines */}
                                {[0, 0.25, 0.5, 0.75, 1].map(frac => (
                                    <line key={frac} x1="0" y1={160 - frac * 140} x2="100%" y2={160 - frac * 140} stroke="#f0f0f0" strokeWidth="1" />
                                ))}
                                {chartData.map((d, i) => {
                                    const barH = maxChartVal > 0 ? (d.value / maxChartVal) * 140 : 0;
                                    const x = i * 60 + 10;
                                    const y = 160 - barH;
                                    return (
                                        <g key={i}>
                                            <rect
                                                className="chart-bar"
                                                x={x} y={y}
                                                width="40" height={barH}
                                                rx="5" ry="5"
                                                fill={barH > 0 ? '#9333ea' : '#e5e7eb'}
                                                fillOpacity="0.85"
                                            >
                                                <title>₹{d.value.toLocaleString('en-IN')}</title>
                                            </rect>
                                            <text x={x + 20} y="175" textAnchor="middle" fontSize="10" fill="#6b7280">{d.label}</text>
                                            {barH > 0 && (
                                                <text x={x + 20} y={y - 4} textAnchor="middle" fontSize="9" fill="#9333ea" fontWeight="700">
                                                    ₹{d.value > 1000 ? `${(d.value / 1000).toFixed(1)}k` : d.value}
                                                </text>
                                            )}
                                        </g>
                                    );
                                })}
                            </svg>
                        </div>

                        {/* Quick Stats Panel */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {[
                                { label: 'Total Orders', value: orders.length, icon: '📦', color: '#3b82f6' },
                                { label: 'Products Listed', value: products.length, icon: '🏷️', color: '#9333ea' },
                                { label: 'Pending Orders', value: orders.filter(o => o.status === 'Processing').length, icon: '⏳', color: '#f59e0b' },
                                { label: 'Completed Orders', value: orders.filter(o => o.status === 'Delivered').length, icon: '✅', color: '#10b981' }
                            ].map(({ label, value, icon, color }) => (
                                <div key={label} style={{ background: '#ffffff', border: '1px solid #f0f0f0', borderRadius: '10px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>{icon}</div>
                                    <div>
                                        <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-primary)', lineHeight: 1 }}>{value}</div>
                                        <div style={{ fontSize: '0.73rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{label}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Split Dashboard Layout (Side-by-side Table & Configuration Form) */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) 340px', gap: '2rem', alignItems: 'start' }}>
                        {/* Left Column: Product List Table Card */}
                        <div className="glass" style={{ padding: '2rem', borderRadius: '16px', background: '#ffffff', border: '1px solid #eaeaea', overflowX: 'auto', boxShadow: '0 4px 20px rgba(0,0,0,0.015)' }}>
                            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Products Catalog ({products.length})</h3>
                            <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--text-secondary)', minWidth: '700px' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid #eaeaea', textAlign: 'left' }}>
                                        <th style={{ padding: '1rem', color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: '700' }}>Image</th>
                                        <th style={{ padding: '1rem', color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: '700' }}>Name</th>
                                        <th style={{ padding: '1rem', color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: '700' }}>Category</th>
                                        <th style={{ padding: '1rem', color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: '700' }}>Pricing Details</th>
                                        <th style={{ padding: '1rem', color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: '700' }}>Margin</th>
                                        <th style={{ padding: '1rem', color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: '700' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map(product => {
                                        const productId = product.id || product._id;
                                        const imageSrc = product.image ? (product.image.startsWith('http') ? product.image : `${API_URL}${product.image}`) : '';
                                        const margin = product.price - (product.cost_price || 0);

                                        return (
                                            <tr key={productId} style={{ borderBottom: '1px solid #eaeaea' }}>
                                                <td style={{ padding: '1rem' }}>
                                                    {imageSrc ? (
                                                        <img src={imageSrc} alt={product.name} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #eaeaea' }} />
                                                    ) : (
                                                        <div style={{ width: '48px', height: '48px', background: '#f3f4f6', color: '#888', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>📷</div>
                                                    )}
                                                </td>
                                                <td style={{ padding: '1rem', color: 'var(--text-primary)', fontWeight: '600', fontSize: '0.9rem' }}>{product.name}</td>
                                                <td style={{ padding: '1rem' }}>
                                                    <div style={{ padding: '4px 10px', background: '#faf5ff', border: '1px solid #f3e8ff', borderRadius: '50px', fontSize: '0.72rem', display: 'inline-block', color: '#9333ea', fontWeight: '600' }}>
                                                        {product.category}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.82rem' }}>
                                                        {product.original_price && product.original_price > product.price && (
                                                            <span style={{ color: 'var(--text-secondary)', textDecoration: 'line-through' }}>{formatPrice(product.original_price)}</span>
                                                        )}
                                                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Inv: {formatPrice(product.cost_price || 0)}</span>
                                                        <span style={{ color: 'var(--text-primary)', fontWeight: '700' }}>Sell: {formatPrice(product.price)}</span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    <span style={{
                                                        color: margin > 0 ? '#065f46' : '#991b1b',
                                                        fontWeight: '700',
                                                        fontSize: '0.8rem',
                                                        background: margin > 0 ? '#d1fae5' : '#fee2e2',
                                                        padding: '4px 8px',
                                                        borderRadius: '4px',
                                                        border: `1px solid ${margin > 0 ? '#a7f3d0' : '#fca5a5'}`
                                                    }}>
                                                        {formatPrice(margin)}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                                                        <Link to={`/admin/edit/${productId}`} style={{ textDecoration: 'none', color: '#ffffff', background: '#111827', padding: '6px 12px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '600', display: 'inline-block', textAlign: 'center' }}>
                                                            Edit
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(productId)}
                                                            style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: '600' }}
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            {products.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                                    No products found. Start adding some!
                                </div>
                            )}
                        </div>

                        {/* Right Column: Settings Panel */}
                        <div className="glass" style={{ padding: '2rem', borderRadius: '16px', background: '#ffffff', border: '1px solid #eaeaea', boxShadow: '0 4px 20px rgba(0,0,0,0.015)' }}>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: 'var(--text-primary)', fontWeight: '700' }}>Global Config</h3>
                            <form onSubmit={handleSettingsUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                <div>
                                    <label htmlFor="facebook" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Facebook URL</label>
                                    <input
                                        id="facebook"
                                        name="facebook"
                                        type="text"
                                        value={settings.facebook}
                                        onChange={(e) => setSettings({ ...settings, facebook: e.target.value })}
                                        placeholder="https://facebook.com/..."
                                        style={{
                                            width: '100%',
                                            background: '#ffffff',
                                            border: '1px solid #d1d5db',
                                            padding: '10px',
                                            borderRadius: '6px',
                                            color: 'var(--text-primary)',
                                            fontSize: '0.88rem',
                                            outline: 'none'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="instagram" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Instagram URL</label>
                                    <input
                                        id="instagram"
                                        name="instagram"
                                        type="text"
                                        value={settings.instagram}
                                        onChange={(e) => setSettings({ ...settings, instagram: e.target.value })}
                                        placeholder="https://instagram.com/..."
                                        style={{
                                            width: '100%',
                                            background: '#ffffff',
                                            border: '1px solid #d1d5db',
                                            padding: '10px',
                                            borderRadius: '6px',
                                            color: 'var(--text-primary)',
                                            fontSize: '0.88rem',
                                            outline: 'none'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="phone" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Support Phone</label>
                                    <input
                                        id="phone"
                                        name="phone"
                                        type="text"
                                        value={settings.phone}
                                        onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                                        style={{
                                            width: '100%',
                                            background: '#ffffff',
                                            border: '1px solid #d1d5db',
                                            padding: '10px',
                                            borderRadius: '6px',
                                            color: 'var(--text-primary)',
                                            fontSize: '0.88rem',
                                            outline: 'none'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Support Email</label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="text"
                                        value={settings.email}
                                        onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                                        style={{
                                            width: '100%',
                                            background: '#ffffff',
                                            border: '1px solid #d1d5db',
                                            padding: '10px',
                                            borderRadius: '6px',
                                            color: 'var(--text-primary)',
                                            fontSize: '0.88rem',
                                            outline: 'none'
                                        }}
                                    />
                                </div>

                                <button type="submit" className="btn-primary" style={{ padding: '12px', marginTop: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700', borderRadius: '6px', width: '100%', border: 'none', background: '#9333ea' }}>
                                    Update Config
                                </button>
                            </form>
                        </div>
                    </div>
                </>
            )}

            {activeTab === 'members' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) 340px', gap: '2rem', alignItems: 'start' }}>
                    {/* Members List Table Card */}
                    <div className="glass" style={{ padding: '2rem', borderRadius: '16px', background: '#ffffff', border: '1px solid #eaeaea', overflowX: 'auto', boxShadow: '0 4px 20px rgba(0,0,0,0.015)' }}>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Active Team Members ({users.length})</h3>
                        <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--text-secondary)', minWidth: '600px' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #eaeaea', textAlign: 'left' }}>
                                    <th style={{ padding: '1rem', color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: '700' }}>Name</th>
                                    <th style={{ padding: '1rem', color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: '700' }}>Email</th>
                                    <th style={{ padding: '1rem', color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: '700' }}>Current Role (Power)</th>
                                    <th style={{ padding: '1rem', color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: '700' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => {
                                    const uId = user.id || user._id;
                                    const isSuperAdmin = ['shoppingmartgayaji@gmail.com', 'ugantsharma@89', 'bipiye3181@ixospace.com'].includes(user.email.toLowerCase());
                                    return (
                                        <tr key={uId} style={{ borderBottom: '1px solid #eaeaea' }}>
                                            <td style={{ padding: '1rem', color: 'var(--text-primary)', fontWeight: '600', fontSize: '0.9rem' }}>{user.firstName} {user.lastName}</td>
                                            <td style={{ padding: '1rem', fontSize: '0.85rem' }}>{user.email}</td>
                                            <td style={{ padding: '1rem' }}>
                                                {isSuperAdmin ? (
                                                    <span style={{ padding: '4px 10px', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '50px', fontSize: '0.72rem', color: '#dc2626', fontWeight: '700' }}>⭐ Super Admin</span>
                                                ) : (
                                                    <select
                                                        value={user.role || 'user'}
                                                        onChange={(e) => handleRoleChange(uId, e.target.value)}
                                                        style={{ padding: '6px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.82rem', fontWeight: '600', background: '#fff', cursor: 'pointer' }}
                                                    >
                                                        <option value="user">User (Standard Access)</option>
                                                        <option value="admin">Admin (Full Control)</option>
                                                    </select>
                                                )}
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <button
                                                    onClick={() => handleDeleteMember(uId)}
                                                    disabled={isSuperAdmin}
                                                    style={{
                                                        background: 'transparent',
                                                        border: '1px solid #ef4444',
                                                        color: '#ef4444',
                                                        padding: '6px 12px',
                                                        borderRadius: '6px',
                                                        cursor: isSuperAdmin ? 'not-allowed' : 'pointer',
                                                        fontSize: '0.78rem',
                                                        fontWeight: '600',
                                                        opacity: isSuperAdmin ? 0.4 : 1
                                                    }}
                                                >
                                                    Remove Member
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Register Member Form panel */}
                    <div className="glass" style={{ padding: '2rem', borderRadius: '16px', background: '#ffffff', border: '1px solid #eaeaea', boxShadow: '0 4px 20px rgba(0,0,0,0.015)' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: 'var(--text-primary)', fontWeight: '700' }}>Register Team Member</h3>
                        <form onSubmit={handleAddMember} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600', display: 'block', marginBottom: '6px' }}>First Name</label>
                                <input
                                    type="text"
                                    required
                                    value={newMember.firstName}
                                    onChange={(e) => setNewMember({ ...newMember, firstName: e.target.value })}
                                    style={{ width: '100%', background: '#ffffff', border: '1px solid #d1d5db', padding: '10px', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '0.88rem', outline: 'none' }}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Last Name</label>
                                <input
                                    type="text"
                                    required
                                    value={newMember.lastName}
                                    onChange={(e) => setNewMember({ ...newMember, lastName: e.target.value })}
                                    style={{ width: '100%', background: '#ffffff', border: '1px solid #d1d5db', padding: '10px', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '0.88rem', outline: 'none' }}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={newMember.email}
                                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                                    style={{ width: '100%', background: '#ffffff', border: '1px solid #d1d5db', padding: '10px', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '0.88rem', outline: 'none' }}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Password</label>
                                <input
                                    type="password"
                                    required
                                    value={newMember.password}
                                    onChange={(e) => setNewMember({ ...newMember, password: e.target.value })}
                                    style={{ width: '100%', background: '#ffffff', border: '1px solid #d1d5db', padding: '10px', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '0.88rem', outline: 'none' }}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Role Type</label>
                                <select
                                    value={newMember.role}
                                    onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                                    style={{ width: '100%', background: '#ffffff', border: '1px solid #d1d5db', padding: '10px', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '0.88rem', outline: 'none', cursor: 'pointer' }}
                                >
                                    <option value="user">Standard User Access</option>
                                    <option value="admin">Administrator Power</option>
                                </select>
                            </div>
                            <button type="submit" className="btn-primary" disabled={memberLoading} style={{ padding: '12px', marginTop: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700', borderRadius: '6px', width: '100%', border: 'none', background: '#9333ea' }}>
                                {memberLoading ? 'REGISTERING...' : 'REGISTER MEMBER'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {activeTab === 'reels' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) 340px', gap: '2rem', alignItems: 'start' }}>
                    {/* Reels Grid Catalog */}
                    <div className="glass" style={{ padding: '2rem', borderRadius: '16px', background: '#ffffff', border: '1px solid #eaeaea', boxShadow: '0 4px 20px rgba(0,0,0,0.015)' }}>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Video Reels Catalog ({reels.length})</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
                            {reels.map(reel => {
                                const rId = reel.id || reel._id;
                                return (
                                    <div key={rId} style={{ border: '1px solid #eaeaea', borderRadius: '12px', overflow: 'hidden', background: '#f9fafb', display: 'flex', flexDirection: 'column' }}>
                                        {/* Video Preview */}
                                        <div style={{ height: '240px', position: 'relative', background: '#000' }}>
                                            <video
                                                src={reel.videoUrl}
                                                controls
                                                muted
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        </div>
                                        {/* Reel Info */}
                                        <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                                            <div style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{reel.productName}</div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#b45309' }}>₹{reel.productPrice}</span>
                                                <button
                                                    onClick={() => handleDeleteReel(rId)}
                                                    style={{ border: 'none', background: 'transparent', color: '#ef4444', fontSize: '0.82rem', fontWeight: '600', cursor: 'pointer', padding: 0 }}
                                                >
                                                    🗑️ Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {reels.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                                No custom video reels uploaded yet. Create one on the right panel!
                            </div>
                        )}
                    </div>

                    {/* Add Reel Form panel */}
                    <div className="glass" style={{ padding: '2rem', borderRadius: '16px', background: '#ffffff', border: '1px solid #eaeaea', boxShadow: '0 4px 20px rgba(0,0,0,0.015)' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: 'var(--text-primary)', fontWeight: '700' }}>Create Video Reel</h3>
                        <form onSubmit={handleAddReel} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Link to Product</label>
                                <select
                                    required
                                    value={newReel.productId}
                                    onChange={(e) => setNewReel({ ...newReel, productId: e.target.value })}
                                    style={{ width: '100%', background: '#ffffff', border: '1px solid #d1d5db', padding: '10px', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '0.88rem', outline: 'none', cursor: 'pointer' }}
                                >
                                    <option value="">-- Choose Product --</option>
                                    {products.map(p => (
                                        <option key={p.id || p._id} value={p.id || p._id}>
                                            {p.name} (₹{p.price})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Option A: Upload Video File (.mp4)</label>
                                <input
                                    id="reel-video-file"
                                    type="file"
                                    accept="video/mp4,video/x-m4v,video/*"
                                    onChange={(e) => setMediaFile(e.target.files[0])}
                                    style={{ width: '100%', fontSize: '0.82rem', padding: '4px 0' }}
                                />
                            </div>
                            <div style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '-4px 0' }}>— OR —</div>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Option B: Paste Video URL</label>
                                <input
                                    type="text"
                                    value={newReel.videoUrl}
                                    onChange={(e) => setNewReel({ ...newReel, videoUrl: e.target.value })}
                                    placeholder="https://example.com/video.mp4"
                                    style={{ width: '100%', background: '#ffffff', border: '1px solid #d1d5db', padding: '10px', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '0.88rem', outline: 'none' }}
                                />
                            </div>
                            <button type="submit" className="btn-primary" disabled={reelLoading} style={{ padding: '12px', marginTop: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700', borderRadius: '6px', width: '100%', border: 'none', background: '#9333ea' }}>
                                {reelLoading ? 'UPLOADING & CREATING...' : 'PUBLISH REEL'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
