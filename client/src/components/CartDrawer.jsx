import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrency } from '../context/CurrencyContext';
import { API_URL } from '../config/api';

const CartDrawer = ({ isOpen, onClose, cart, updateCartQuantity, removeFromCart }) => {
    const navigate = useNavigate();
    const { formatPrice } = useCurrency();

    const subtotal = cart.reduce((acc, item) => acc + item.price * (item.quantity || 1), 0);
    const totalItems = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);

    const handleCheckout = () => {
        onClose();
        navigate('/checkout');
    };

    const handleViewCart = () => {
        onClose();
        navigate('/cart');
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop overlay */}
            <div className="drawer-overlay" onClick={onClose}></div>

            {/* Cart Drawer */}
            <div className="cart-drawer-panel">
                <div className="cart-drawer-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.25rem' }}>🛒</span>
                        <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                            Your Cart ({totalItems})
                        </h3>
                    </div>
                    <button className="cart-drawer-close" onClick={onClose}>&times;</button>
                </div>

                <div className="cart-drawer-body">
                    {cart.length === 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60%', gap: '15px' }}>
                            <span style={{ fontSize: '3rem' }}>🛍️</span>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>Your cart is empty.</p>
                            <button className="btn-primary" onClick={onClose} style={{ borderRadius: '6px', fontSize: '0.85rem' }}>Continue Shopping</button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {cart.map((item) => (
                                <div key={item.id} className="cart-drawer-item">
                                    {item.image ? (
                                        <img 
                                            src={item.image.startsWith('http') ? item.image : `${API_URL}${item.image}`} 
                                            alt={item.name} 
                                            className="cart-drawer-item-img"
                                        />
                                    ) : (
                                        <div className="cart-drawer-item-img-placeholder">📦</div>
                                    )}
                                    <div className="cart-drawer-item-info">
                                        <h4 className="cart-drawer-item-name">{item.name}</h4>
                                        <p className="cart-drawer-item-category">{item.category}</p>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                                            {/* Quantity controls */}
                                            <div className="qty-controls">
                                                <button className="qty-btn" onClick={() => updateCartQuantity(item.id, (item.quantity || 1) - 1)}>-</button>
                                                <span className="qty-val">{item.quantity || 1}</span>
                                                <button className="qty-btn" onClick={() => updateCartQuantity(item.id, (item.quantity || 1) + 1)}>+</button>
                                            </div>
                                            <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                                                {formatPrice(item.price * (item.quantity || 1))}
                                            </span>
                                        </div>
                                    </div>
                                    <button className="cart-drawer-item-remove" onClick={() => removeFromCart(item.id)}>&times;</button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {cart.length > 0 && (
                    <div className="cart-drawer-footer">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Subtotal</span>
                            <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1.1rem' }}>{formatPrice(subtotal)}</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <button className="btn-secondary" onClick={handleViewCart} style={{ borderRadius: '6px', fontSize: '0.85rem', padding: '10px 0' }}>View Cart</button>
                            <button className="btn-primary" onClick={handleCheckout} style={{ borderRadius: '6px', fontSize: '0.85rem', padding: '10px 0' }}>Checkout</button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default CartDrawer;
