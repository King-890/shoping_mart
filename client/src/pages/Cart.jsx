import { useNavigate } from 'react-router-dom';
import { useCurrency } from '../context/CurrencyContext';
import { useToast } from '../context/ToastContext';

const Cart = ({ cart, updateCartQuantity, removeFromCart }) => {
    const navigate = useNavigate();
    const { formatPrice } = useCurrency();
    const { showToast } = useToast();

    // Calculate total using quantities
    const totalINR = cart.reduce((acc, item) => acc + item.price * (item.quantity || 1), 0);
    const totalItems = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);

    const handleProceed = () => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) {
            showToast('Please login to proceed to checkout.', 'error');
            navigate('/login');
            return;
        }
        navigate('/checkout');
    };

    return (
        <div className="container" style={{ paddingTop: '2.5rem', minHeight: '80vh', paddingBottom: '4rem' }}>
            <h2 style={{ marginBottom: '2rem', borderLeft: '3px solid #121212', paddingLeft: '1rem', fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                Your Cart {totalItems > 0 && <span style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--text-secondary)' }}>({totalItems} items)</span>}
            </h2>

            {cart.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '12px', background: '#f9fafb' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '1rem' }}>Your cart is empty.</p>
                    <a href="/" style={{
                        display: 'inline-block',
                        textDecoration: 'underline',
                        color: 'var(--text-primary)',
                        fontWeight: '600',
                        fontSize: '0.9rem'
                    }}>Continue Shopping</a>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 2fr)) 1fr', gap: '2rem' }}>
                    {/* Cart Items */}
                    <div style={{ padding: '1.5rem', borderRadius: '12px', background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)' }}>
                        {cart.map((item) => (
                            <div key={item.id} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '1rem',
                                marginBottom: '1rem',
                                background: '#f9fafb',
                                border: '1px solid rgba(0,0,0,0.04)',
                                borderRadius: '8px',
                                gap: '1rem',
                                transition: 'all 0.2s ease'
                            }}>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <h4 style={{ color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: '700', margin: '0 0 4px 0' }}>{item.name}</h4>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 10px 0' }}>{item.category}</p>
                                    {/* Quantity Controls */}
                                    <div className="qty-controls">
                                        <button className="qty-btn" onClick={() => updateCartQuantity(item.id, (item.quantity || 1) - 1)}>−</button>
                                        <span className="qty-val">{item.quantity || 1}</span>
                                        <button className="qty-btn" onClick={() => updateCartQuantity(item.id, (item.quantity || 1) + 1)}>+</button>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '1rem' }}>
                                            {formatPrice(item.price * (item.quantity || 1))}
                                        </div>
                                        {(item.quantity || 1) > 1 && (
                                            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                                                {formatPrice(item.price)} each
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        style={{
                                            background: '#fee2e2',
                                            border: 'none',
                                            color: '#dc2626',
                                            cursor: 'pointer',
                                            width: '28px',
                                            height: '28px',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: '0.2s',
                                            fontWeight: 'bold',
                                            fontSize: '0.75rem'
                                        }}
                                        onMouseOver={e => e.currentTarget.style.background = '#fca5a5'}
                                        onMouseOut={e => e.currentTarget.style.background = '#fee2e2'}
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Checkout Summary */}
                    <div style={{ padding: '1.5rem', borderRadius: '12px', background: '#f9fafb', border: '1px solid rgba(0,0,0,0.06)', height: 'fit-content' }}>
                        <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)', fontSize: '1.10rem', fontWeight: '700', margin: '0 0 1.5rem 0' }}>Order Summary</h3>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                            <span>Subtotal ({totalItems} items)</span>
                            <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{formatPrice(totalINR)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                            <span>Shipping</span>
                            <span style={{ color: '#16a34a', fontWeight: '600' }}>Free</span>
                        </div>
                        <div style={{ borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: '1rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                            <span>Total</span>
                            <span>{formatPrice(totalINR)}</span>
                        </div>

                        <button
                            className="btn-primary"
                            style={{ width: '100%', borderRadius: '6px', padding: '12px 0', fontWeight: '600', fontSize: '0.85rem' }}
                            onClick={handleProceed}
                        >
                            Proceed to Checkout ➡️
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;
