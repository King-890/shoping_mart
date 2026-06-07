import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrency } from '../context/CurrencyContext';
import { useToast } from '../context/ToastContext';
import API_URL from '../config/api';

const loadRazorpay = () => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

const Checkout = ({ cart, clearCart }) => {
    const navigate = useNavigate();
    const { formatPrice } = useCurrency();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('cod');

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        addressLine1: '',
        city: '',
        state: '',
        zipCode: ''
    });

    // Auto-fill from Profile
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            const address = user.address || {};
            setFormData(prev => ({
                ...prev,
                fullName: `${user.firstName || ''} ${user.lastName || ''} `.trim(),
                email: user.email || '',
                phone: user.phone || '',
                addressLine1: address.street || '',
                city: address.city || '',
                state: address.state || '',
                zipCode: address.zip || ''
            }));
        }
    }, []);

    const totalINR = cart.reduce((acc, item) => acc + item.price * (item.quantity || 1), 0);
    const totalItems = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();

        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) {
            showToast('Please login first to place an order.', 'error');
            navigate('/login');
            return;
        }

        if (!formData.fullName || !formData.addressLine1 || !formData.city || !formData.zipCode || !formData.phone) {
            showToast('Please fill in all required shipping details.', 'error');
            return;
        }

        const cleanPhone = formData.phone.replace(/[\s\-\(\)\+]/g, '');
        if (cleanPhone.length < 10) {
            showToast('Please enter a valid Phone Number (minimum 10 digits).', 'error');
            return;
        }

        const cleanZip = formData.zipCode.replace(/\s/g, '');
        if (cleanZip.length < 5 || isNaN(cleanZip)) {
            showToast('Please enter a valid ZIP / PIN Code.', 'error');
            return;
        }

        const fullShippingAddress = `${formData.addressLine1}, ${formData.city}, ${formData.state} - ${formData.zipCode}`;
        const orderPayload = {
            items: cart,
            shippingAddress: fullShippingAddress,
            paymentMethod: paymentMethod.toUpperCase(),
            email: formData.email || user.email,
            user_id: user.id || null
        };

        setLoading(true);

        if (paymentMethod === 'cod') {
            try {
                // 1. Create Order via Secure Backend
                const response = await fetch(`${API_URL}/api/payment/create-order`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(orderPayload)
                });
                const result = await response.json();

                if (!response.ok) throw new Error(result.message);

                showToast(`Order Placed Successfully! 🎉 Ref: ${result.order.id}`);

                // 2. Trigger External Notifications
                try {
                    await fetch(`${API_URL}/api/notify/order`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            order: result.order,
                            email: formData.email || user.email
                        })
                    });
                } catch (notifyErr) {
                    console.warn('External notification failed');
                }

                // 3. Create In-App Notification (Optional, can be done via Firestore)
                try {
                    // This can be a separate API or client-side write to 'notifications' collection
                    await fetch(`${API_URL}/api/marketing/notifications`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            user_id: user.id,
                            title: 'Order Confirmed',
                            message: `🚀 Your order #${result.order.id} has been placed successfully!`,
                            type: 'order'
                        })
                    });
                } catch (notiErr) { console.error('Noti error:', notiErr); }

                clearCart();
                navigate(`/track-order?id=${result.order.id}`);
            } catch (err) {
                console.error('Order Error:', err);
                showToast(`Failed to place order: ${err.message}`, 'error');
            } finally {
                setLoading(false);
            }
        } else {
            // ONLINE (Razorpay)
            const res = await loadRazorpay();
            if (!res) {
                showToast('Razorpay SDK failed to load. Check your internet.', 'error');
                setLoading(false);
                return;
            }

            try {
                // 1. Create the Order Entry (Under Verification)
                const createRes = await fetch(`${API_URL}/api/payment/create-order`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(orderPayload)
                });
                const createData = await createRes.json();
                if (!createRes.ok) throw new Error(createData.message);

                // 2. Create Razorpay Order with verified amount
                const rzpRes = await fetch(`${API_URL}/api/payment/razorpay-order`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ items: cart })
                });
                const data = await rzpRes.json();

                if (!rzpRes.ok) throw new Error(data.message);

                // 3. Open Layout
                const options = {
                    key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_PLACEHOLDER',
                    amount: data.amount,
                    currency: data.currency,
                    name: "Gaya ji Shopping Mart",
                    description: "Order Checkout",
                    image: "/logo.png",
                    order_id: data.id,
                    handler: async function (response) {
                        try {
                            // 4. Verify Payment on Backend
                            const verifyRes = await fetch(`${API_URL}/api/payment/verify-payment`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    razorpay_order_id: response.razorpay_order_id,
                                    razorpay_payment_id: response.razorpay_payment_id,
                                    razorpay_signature: response.razorpay_signature,
                                    order_id: createData.order.id
                                })
                            });

                            const verifyData = await verifyRes.json();
                            if (!verifyRes.ok || !verifyData.success) {
                                throw new Error(verifyData.message || 'Payment verification failed');
                            }

                            // 5. Trigger Email Notification
                            try {
                                await fetch(`${API_URL}/api/notify/order`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        order: { ...createData.order, paymentStatus: 'Paid' },
                                        email: formData.email || user.email
                                    })
                                });
                            } catch (notifyErr) {
                                console.warn('Order notification failed');
                            }

                            // 6. Create In-App Notification
                            try {
                                await fetch(`${API_URL}/api/marketing/notifications`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        user_id: user.id,
                                        title: 'Payment Successful',
                                        message: `✅ Payment confirmed for order #${createData.order.id}. Processing now!`,
                                        type: 'order'
                                    })
                                });
                            } catch (notiErr) { console.error('Noti error:', notiErr); }

                            showToast(`Payment Successful! 🎉 Order ID: ${createData.order.id}`);
                            clearCart();
                            navigate(`/track-order?id=${createData.order.id}`);
                        } catch (err) {
                            console.error('Payment Verification/Update Error:', err);
                            showToast(`Verification Failed: ${err.message}. Please contact support with Payment ID: ${response.razorpay_payment_id}`, 'error');
                        }
                    },
                    prefill: {
                        name: formData.fullName || `${user.firstName} ${user.lastName}`,
                        email: formData.email || user.email,
                        contact: formData.phone
                    },
                    theme: { color: "#00f0ff" }
                };

                const paymentObject = new window.Razorpay(options);
                paymentObject.open();

            } catch (err) {
                console.error('Online Payment Flow Error:', err);
                showToast(err.message || 'Payment Initialization Failed', 'error');
            } finally {
                setLoading(false);
            }
        }
    };

    if (cart.length === 0) {
        return (
            <div className="container" style={{ paddingTop: '2.5rem', textAlign: 'center', minHeight: '60vh' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-primary)' }}>Your Cart is Empty</h2>
                <button onClick={() => navigate('/')} className="btn-primary" style={{ marginTop: '20px', borderRadius: '6px' }}>Go Home</button>
            </div>
        );
    }

    return (
        <div className="container" style={{ paddingTop: '2.5rem', minHeight: '90vh', paddingBottom: '4rem' }}>
            <h2 style={{ marginBottom: '2rem', borderLeft: '3px solid #121212', paddingLeft: '1rem', fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                Secure Checkout 🔐
            </h2>

            <div className="checkout-layout">
                {/* Left: Address Form */}
                <div style={{ padding: '2rem', borderRadius: '12px', background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)' }}>
                    <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)', fontSize: '1.15rem', fontWeight: '700', margin: '0 0 1.5rem 0' }}>Shipping Details</h3>
                    <form onSubmit={handlePlaceOrder} id="checkout-form">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div className="form-group">
                                <label htmlFor="fullName" style={{ display: 'block', marginBottom: '5px', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>Full Name *</label>
                                <input id="fullName" name="fullName" required value={formData.fullName} onChange={handleInputChange} autoComplete="name"
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        background: '#ffffff',
                                        border: '1px solid rgba(0,0,0,0.12)',
                                        borderRadius: '6px',
                                        color: 'var(--text-primary)',
                                        outline: 'none',
                                        transition: '0.2s',
                                        fontSize: '0.85rem'
                                    }}
                                    className="input-focus-effect"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="phone" style={{ display: 'block', marginBottom: '5px', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>Phone Number *</label>
                                <input id="phone" name="phone" required value={formData.phone} onChange={handleInputChange} autoComplete="tel"
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        background: '#ffffff',
                                        border: '1px solid rgba(0,0,0,0.12)',
                                        borderRadius: '6px',
                                        color: 'var(--text-primary)',
                                        outline: 'none',
                                        transition: '0.2s',
                                        fontSize: '0.85rem'
                                    }}
                                    className="input-focus-effect"
                                />
                            </div>
                        </div>

                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                            <label htmlFor="addressLine1" style={{ display: 'block', marginBottom: '5px', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>Address Line 1 *</label>
                            <input id="addressLine1" name="addressLine1" required value={formData.addressLine1} onChange={handleInputChange} placeholder="Street, House No." autoComplete="street-address"
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    background: '#ffffff',
                                    border: '1px solid rgba(0,0,0,0.12)',
                                    borderRadius: '6px',
                                    color: 'var(--text-primary)',
                                    outline: 'none',
                                    transition: '0.2s',
                                    fontSize: '0.85rem'
                                }}
                                className="input-focus-effect"
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div className="form-group">
                                <label htmlFor="city" style={{ display: 'block', marginBottom: '5px', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>City *</label>
                                <input id="city" name="city" required value={formData.city} onChange={handleInputChange} autoComplete="address-level2"
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        background: '#ffffff',
                                        border: '1px solid rgba(0,0,0,0.12)',
                                        borderRadius: '6px',
                                        color: 'var(--text-primary)',
                                        outline: 'none',
                                        transition: '0.2s',
                                        fontSize: '0.85rem'
                                    }}
                                    className="input-focus-effect"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="state" style={{ display: 'block', marginBottom: '5px', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>State</label>
                                <input id="state" name="state" value={formData.state} onChange={handleInputChange} autoComplete="address-level1"
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        background: '#ffffff',
                                        border: '1px solid rgba(0,0,0,0.12)',
                                        borderRadius: '6px',
                                        color: 'var(--text-primary)',
                                        outline: 'none',
                                        transition: '0.2s',
                                        fontSize: '0.85rem'
                                    }}
                                    className="input-focus-effect"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="zipCode" style={{ display: 'block', marginBottom: '5px', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>ZIP Code *</label>
                                <input id="zipCode" name="zipCode" required value={formData.zipCode} onChange={handleInputChange} autoComplete="postal-code"
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        background: '#ffffff',
                                        border: '1px solid rgba(0,0,0,0.12)',
                                        borderRadius: '6px',
                                        color: 'var(--text-primary)',
                                        outline: 'none',
                                        transition: '0.2s',
                                        fontSize: '0.85rem'
                                    }}
                                    className="input-focus-effect"
                                />
                            </div>
                        </div>

                        <div className="form-group" style={{ marginBottom: '2rem' }}>
                            <label htmlFor="email" style={{ display: 'block', marginBottom: '5px', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>Email (Optional)</label>
                            <input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} autoComplete="email"
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    background: '#ffffff',
                                    border: '1px solid rgba(0,0,0,0.12)',
                                    borderRadius: '6px',
                                    color: 'var(--text-primary)',
                                    outline: 'none',
                                    transition: '0.2s',
                                    fontSize: '0.85rem'
                                }}
                                className="input-focus-effect"
                            />
                        </div>

                        <h4 style={{ marginBottom: '1.2rem', color: 'var(--text-primary)', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '1.5rem', fontSize: '1rem', fontWeight: '700' }}>Payment Method</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                            <label style={{
                                display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '16px 20px',
                                background: paymentMethod === 'cod' ? '#f9fafb' : '#ffffff',
                                borderRadius: '12px',
                                border: paymentMethod === 'cod' ? '2px solid #121212' : '1px solid rgba(0,0,0,0.12)',
                                transition: 'all 0.2s ease',
                                boxShadow: paymentMethod === 'cod' ? '0 4px 12px rgba(0,0,0,0.04)' : 'none'
                            }}>
                                <input id="payment-cod" type="radio" name="payment_method" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} style={{ accentColor: '#121212', width: '18px', height: '18px', cursor: 'pointer' }} />
                                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                    <span style={{ fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-primary)' }}>Cash on Delivery</span>
                                    <span style={{ fontSize: '1.2rem' }}>💵</span>
                                </div>
                            </label>
                            <label style={{
                                display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '16px 20px',
                                background: paymentMethod === 'online' ? '#f9fafb' : '#ffffff',
                                borderRadius: '12px',
                                border: paymentMethod === 'online' ? '2px solid #121212' : '1px solid rgba(0,0,0,0.12)',
                                transition: 'all 0.2s ease',
                                boxShadow: paymentMethod === 'online' ? '0 4px 12px rgba(0,0,0,0.04)' : 'none'
                            }}>
                                <input id="payment-online" type="radio" name="payment_method" value="online" checked={paymentMethod === 'online'} onChange={() => setPaymentMethod('online')} style={{ accentColor: '#121212', width: '18px', height: '18px', cursor: 'pointer' }} />
                                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                    <span style={{ fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-primary)' }}>Online Payment</span>
                                    <span style={{ fontSize: '1.2rem' }}>💳</span>
                                </div>
                            </label>
                        </div>
                    </form>
                </div>

                {/* Right: Order Summary */}
                <div style={{ position: 'sticky', top: '100px', height: 'fit-content' }}>
                    <div style={{ padding: '1.5rem', borderRadius: '12px', background: '#f9fafb', border: '1px solid rgba(0,0,0,0.06)' }}>
                        <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)', fontSize: '1.10rem', fontWeight: '700', margin: '0 0 1.5rem 0' }}>Order Summary</h3>
                        {cart.map((item, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                <span>{item.name} {(item.quantity || 1) > 1 && <span style={{ color: '#9333ea', fontWeight: 600 }}>×{item.quantity || 1}</span>}</span>
                                <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{formatPrice(item.price * (item.quantity || 1))}</span>
                            </div>
                        ))}
                        <div style={{ borderTop: '1px solid rgba(0,0,0,0.08)', margin: '1rem 0' }}></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: '700', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
                            <span>Total</span>
                            <span>{formatPrice(totalINR)}</span>
                        </div>

                        <button
                            type="submit"
                            form="checkout-form"
                            className="btn-primary"
                            style={{ width: '100%', opacity: loading ? 0.7 : 1, borderRadius: '6px', padding: '12px 0', fontWeight: '600', fontSize: '0.85rem' }}
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : 'Confirm Order'}
                        </button>

                        <button onClick={() => navigate('/cart')} style={{ width: '100%', marginTop: '1rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.82rem', textDecoration: 'underline' }}>
                            Back to Cart
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
