import React, { useState, useEffect } from 'react';
import { API_URL } from '../../config/api';
import { useToast } from '../../context/ToastContext';
import { useCurrency } from '../../context/CurrencyContext';

const OrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();
    const { formatPrice } = useCurrency();

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/payment/orders`); // Need to ensure this route exists or update logic
            // Fallback: Using Firestore directly on client if route not ready, but better to use API
            // For now, let's assume API is preferred
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setOrders(data || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
            showToast('Failed to fetch orders.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            const res = await fetch(`${API_URL}/api/payment/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (!res.ok) throw new Error('Update failed');

            setOrders(orders.map(order =>
                order.id === orderId ? { ...order, status: newStatus } : order
            ));

            showToast(`Order status updated to ${newStatus} ✨`);
        } catch (error) {
            console.error('Error updating status:', error);
            showToast('Failed to update status.', 'error');
        }
    };

    if (loading) return <div className="container" style={{ paddingTop: '2.5rem', textAlign: 'center', color: 'var(--text-primary)' }}>Loading Orders...</div>;

    return (
        <div className="container" style={{ paddingTop: '2.5rem', minHeight: '80vh', color: 'var(--text-primary)' }}>
            <h2 style={{ marginBottom: '2rem', borderLeft: '4px solid #9333ea', paddingLeft: '1rem' }}>Order Management</h2>

            <div className="glass" style={{ padding: '2rem', borderRadius: '16px', overflowX: 'auto', background: '#ffffff' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--text-secondary)', minWidth: '800px' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #eaeaea', textAlign: 'left' }}>
                            <th style={{ padding: '1rem', color: 'var(--text-primary)' }}>Order ID</th>
                            <th style={{ padding: '1rem', color: 'var(--text-primary)' }}>Customer / Email</th>
                            <th style={{ padding: '1rem', color: 'var(--text-primary)' }}>Status</th>
                            <th style={{ padding: '1rem', color: 'var(--text-primary)' }}>Total</th>
                            <th style={{ padding: '1rem', color: 'var(--text-primary)' }}>Items</th>
                            <th style={{ padding: '1rem', color: 'var(--text-primary)' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <tr key={order.id} style={{ borderBottom: '1px solid #f3f4f6', transition: '0.2s', background: 'transparent' }} onMouseOver={e => e.currentTarget.style.background = '#f9fafb'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                                <td style={{ padding: '1rem', color: '#9333ea', fontFamily: 'monospace' }}>
                                    {order.id.substring(0, 8)}...
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>{order.email}</div>
                                    <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>{order.paymentMethod}</div>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{
                                        padding: '4px 12px',
                                        borderRadius: '50px',
                                        fontSize: '0.75rem',
                                        fontWeight: '700',
                                        letterSpacing: '0.5px',
                                        background: order.status === 'Delivered' ? '#d1fae5' : (order.status === 'Cancelled' ? '#fee2e2' : '#fef3c7'),
                                        color: order.status === 'Delivered' ? '#065f46' : (order.status === 'Cancelled' ? '#991b1b' : '#b45309'),
                                        border: `1px solid ${order.status === 'Delivered' ? '#a7f3d0' : (order.status === 'Cancelled' ? '#fca5a5' : '#fde68a')}`,
                                        textTransform: 'uppercase'
                                    }}>
                                        {order.status}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>
                                    {formatPrice(order.totalAmount)}
                                </td>
                                <td style={{ padding: '1rem', fontSize: '0.85rem' }}>
                                    {order.items.length} items
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <select
                                        value={order.status}
                                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                        style={{
                                            background: '#ffffff',
                                            color: 'var(--text-primary)',
                                            border: '1px solid #d1d5db',
                                            padding: '6px 12px',
                                            borderRadius: '6px',
                                            outline: 'none',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <option value="Processing">Processing</option>
                                        <option value="Shipped">Shipped</option>
                                        <option value="Delivered">Delivered</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {orders.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>No orders found.</div>
                )}
            </div>
        </div>
    );
};

export default OrderManagement;
