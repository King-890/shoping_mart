import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import API_URL from '../config/api';
import { useCurrency } from '../context/CurrencyContext';

const TrackOrder = () => {
    const { formatPrice } = useCurrency();
    const [searchParams] = useSearchParams();
    const idParam = searchParams.get('id');

    const [orderId, setOrderId] = useState(idParam || '');
    const [orderStatus, setOrderStatus] = useState(null);
    const [loading, setLoading] = useState(false);

    const trackOrderById = async (idToTrack) => {
        if (!idToTrack) return;

        setLoading(true);
        setOrderStatus(null);

        try {
            const res = await fetch(`${API_URL}/api/payment/orders/${idToTrack}`);
            if (!res.ok) throw new Error('Order not found');
            const data = await res.json();

            if (data) {
                let message = 'Your order is currently being processed.';
                let color = '#3b82f6'; // Blue
                let progress = 33;

                if (data.status === 'Processing') {
                    message = 'Your order is confirmed and being prepared.';
                    progress = 33;
                    color = '#3b82f6';
                } else if (data.status === 'Shipped') {
                    message = 'Your order is on the way!';
                    progress = 70;
                    color = '#9333ea'; // Purple
                } else if (data.status === 'Delivered') {
                    message = 'Your package has been delivered.';
                    progress = 100;
                    color = '#10b981'; // Green
                } else if (data.status === 'Cancelled') {
                    message = 'This order has been cancelled.';
                    progress = 0;
                    color = '#ef4444'; // Red
                }

                setOrderStatus({
                    id: data.id || data._id,
                    status: data.status,
                    progress,
                    message,
                    color,
                    items: data.items || [],
                    totalAmount: data.totalAmount,
                    shippingAddress: data.shippingAddress
                });
            }
        } catch (error) {
            console.error('Error tracking order:', error);
            alert('Order not found or database error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (idParam) {
            trackOrderById(idParam);
        }
    }, [idParam]);

    const handleTrack = (e) => {
        e.preventDefault();
        trackOrderById(orderId);
    };

    return (
        <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem', minHeight: '80vh', color: 'var(--text-primary)' }}>
            <div className="glass" style={{ padding: '3rem', borderRadius: '16px', maxWidth: '800px', margin: '0 auto', background: '#ffffff' }}>
                <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <h1 className="text-gradient" style={{ marginBottom: '2rem', textAlign: 'center', fontSize: '2.25rem' }}>Track Your Order</h1>

                    <form onSubmit={handleTrack} style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <label htmlFor="track-order-id" style={{ color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.9rem' }}>Enter Order Reference ID</label>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <input
                                id="track-order-id"
                                name="order_id"
                                type="text"
                                value={orderId}
                                onChange={(e) => setOrderId(e.target.value)}
                                placeholder="e.g. ORD-12345"
                                style={{
                                    flex: 1,
                                    padding: '12px 16px',
                                    background: 'var(--bg-secondary)',
                                    border: '1px solid var(--glass-border)',
                                    color: 'var(--text-primary)',
                                    borderRadius: '8px',
                                    outline: 'none',
                                    fontSize: '0.95rem'
                                }}
                            />
                            <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '12px 30px' }}>
                                {loading ? 'Searching...' : 'Track'}
                            </button>
                        </div>
                    </form>

                    {orderStatus && (
                        <div className="animate-slide-up" style={{
                            marginTop: '2.5rem',
                            padding: '2rem',
                            background: 'var(--bg-secondary)',
                            borderRadius: '12px',
                            border: `1px solid ${orderStatus.color}`
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>Order #{orderStatus.id}</h3>
                                <span style={{
                                    color: '#ffffff',
                                    background: orderStatus.color,
                                    padding: '4px 12px',
                                    borderRadius: '50px',
                                    fontWeight: 'bold',
                                    textTransform: 'uppercase',
                                    fontSize: '0.75rem'
                                }}>
                                    {orderStatus.status}
                                </span>
                            </div>

                            {/* Progress Bar */}
                            <div style={{
                                height: '8px',
                                background: 'rgba(0,0,0,0.08)',
                                borderRadius: '4px',
                                marginBottom: '1.2rem',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    height: '100%',
                                    width: `${orderStatus.progress}%`,
                                    background: orderStatus.color,
                                    transition: 'width 1s ease'
                                }}></div>
                            </div>

                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.7)', border: '1px solid var(--glass-border)', borderRadius: '8px', marginBottom: '1.5rem' }}>
                                <span style={{ fontSize: '1.2rem' }}>🚚</span>
                                <p style={{ color: 'var(--text-primary)', fontSize: '0.9rem', margin: 0, fontWeight: '500' }}>
                                    {orderStatus.message}
                                </p>
                            </div>

                            <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}>
                                <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontWeight: '700' }}>Order Details</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {orderStatus.items.map((item, i) => (
                                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                            <span>{item.name}</span>
                                            <span>{formatPrice(item.price)}</span>
                                        </div>
                                    ))}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: 'var(--text-primary)', marginTop: '10px', borderTop: '1px solid var(--glass-border)', paddingTop: '10px' }}>
                                        <span>Total Amount</span>
                                        <span>{formatPrice(orderStatus.totalAmount)}</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ borderTop: '1px solid var(--glass-border)', marginTop: '1.5rem', paddingTop: '1.5rem' }}>
                                <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', fontWeight: '700' }}>Shipping Address</h4>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
                                    {orderStatus.shippingAddress}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Infographic Steps */}
                <div style={{ marginTop: '4rem', borderTop: '1px solid var(--glass-border)', paddingTop: '3rem' }}>
                    <h2 style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '1.8rem', fontWeight: '800' }}>Gaya ji Shopping mart - Track Your Order</h2>
                    <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '3rem' }}>Stay updated every step of the way!</p>
                    
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                        gap: '2rem',
                        textAlign: 'center'
                    }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{
                                width: '60px', height: '60px', borderRadius: '50%',
                                background: '#f3e8ff', color: '#9333ea',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem'
                            }}>
                                📧
                            </div>
                            <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '0.5rem' }}>Step 1</h4>
                            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
                                Receive tracking details via Email/SMS from Gaya ji Shopping mart.
                            </p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{
                                width: '60px', height: '60px', borderRadius: '50%',
                                background: '#eff6ff', color: '#2563eb',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem'
                            }}>
                                📋
                            </div>
                            <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '0.5rem' }}>Step 2</h4>
                            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '0.5rem', marginTop: 0 }}>
                                Click on tracking link or copy tracking number.
                            </p>
                            <span style={{
                                background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px',
                                fontSize: '0.75rem', fontFamily: 'monospace', color: '#334155', border: '1px dashed #cbd5e1'
                            }}>
                                GJM123456789IN
                            </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{
                                width: '60px', height: '60px', borderRadius: '50%',
                                background: '#ecfdf5', color: '#059669',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem'
                            }}>
                                💻
                            </div>
                            <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '0.5rem' }}>Step 3</h4>
                            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
                                Enter tracking number on courier website.
                            </p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{
                                width: '60px', height: '60px', borderRadius: '50%',
                                background: '#fffbeb', color: '#d97706',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem'
                            }}>
                                📍
                            </div>
                            <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '0.5rem' }}>Step 4</h4>
                            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
                                View real-time order status and location.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrackOrder;
