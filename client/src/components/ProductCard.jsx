import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCurrency } from '../context/CurrencyContext';
import { API_URL } from '../config/api';

const ProductCard = ({ product, onAddToCart }) => {
    const { formatPrice } = useCurrency();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const isSaved = isInWishlist(product.id || product._id);

    // Helper to get an icon based on category
    const getIcon = (cat) => {
        if (!cat) return '⚡';
        if (cat.includes('Phone')) return '📱';
        if (cat.includes('Audio')) return '🎧';
        if (cat.includes('Battery')) return '🔋';
        if (cat.includes('Display')) return '🖥️';
        if (cat.includes('Charger')) return '🔌';
        if (cat === 'Microcontrollers') return '🤖';
        return '⚡';
    };

    const reviewCount = (product.id?.charCodeAt(0) || 5) % 40 + 12;

    return (
        <div className="product-card">
            {/* Image Container - Clickable */}
            <Link to={`/product/${product.id || product._id}`} className="product-image-container" style={{ textDecoration: 'none', display: 'block' }}>
                {product.image ? (
                    <img
                        src={product.image.startsWith('http') ? product.image : (product.image.startsWith('/') ? `${API_URL}${product.image}` : product.image)}
                        alt={product.name}
                        className="product-image-placeholder"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/300x300?text=Product+Image';
                        }}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transition: 'transform 0.4s ease'
                        }}
                    />
                ) : (
                    <div
                        className="product-image-placeholder"
                        style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#888',
                            fontSize: '3rem',
                            background: '#f3f4f6',
                            transition: 'transform 0.4s ease'
                        }}
                    >
                        {getIcon(product.category)}
                    </div>
                )}

                <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    zIndex: 2
                }}>
                    <span className="category-tag">{product.category}</span>
                </div>

                {/* Wishlist Heart */}
                <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product); }}
                    style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        zIndex: 3,
                        background: '#ffffff',
                        border: '1px solid rgba(0,0,0,0.08)',
                        borderRadius: '50%',
                        width: '34px',
                        height: '34px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: isSaved ? '#ef4444' : '#6b7280',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
                    }}
                    title={isSaved ? "Remove from Wishlist" : "Add to Wishlist"}
                    onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                    {isSaved ? '❤️' : '🤍'}
                </button>

                {/* Badges Stack */}
                <div style={{ position: 'absolute', bottom: '12px', left: '12px', display: 'flex', flexDirection: 'column', gap: '6px', zIndex: 2 }}>
                    {/* Bestseller Badge */}
                    {(product.id?.length % 5 === 0) && (
                        <div style={{
                            background: '#fef08a', color: '#854d0e', padding: '3px 8px',
                            borderRadius: '4px', fontSize: '0.62rem', fontWeight: 'bold',
                            border: '1px solid #fef08a'
                        }}>
                            🏆 BESTSELLER
                        </div>
                    )}

                    {/* New Badge */}
                    {(product.id?.slice(-1) % 3 === 0) && (
                        <div style={{
                            background: '#121212', color: '#fff', padding: '3px 8px',
                            borderRadius: '4px', fontSize: '0.62rem', fontWeight: 'bold'
                        }}>
                            NEW
                        </div>
                    )}

                    {/* Low Stock Badge */}
                    {product.stock > 0 && product.stock <= 5 && (
                        <div style={{
                            background: '#fee2e2', color: '#991b1b', padding: '3px 8px',
                            borderRadius: '4px', fontSize: '0.62rem', fontWeight: 'bold',
                            border: '1px solid #fca5a5'
                        }}>
                            ⏳ {product.stock} LEFT
                        </div>
                    )}
                </div>
            </Link>

            {/* Content */}
            <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ marginBottom: '0.4rem' }}>
                    <Link to={`/product/${product.id || product._id}`} style={{ textDecoration: 'none' }}>
                        <h3 style={{
                            fontSize: '0.95rem',
                            fontWeight: '600',
                            color: 'var(--text-primary)',
                            lineHeight: '1.4',
                            margin: '0 0 0.25rem 0',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        }}>{product.name}</h3>
                    </Link>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: '#fbbf24' }}>
                        <span>★</span><span>4.8</span>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginLeft: '4px' }}>({reviewCount} reviews)</span>
                    </div>
                </div>

                <p style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.8rem',
                    marginBottom: '1rem',
                    flex: 1,
                    lineHeight: '1.4',
                    display: '-webkit-box',
                    WebkitLineClamp: '2',
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                }}>
                    {product.description}
                </p>

                <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                        <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                            {formatPrice(product.price)}
                        </span>
                        {product.original_price && product.original_price > product.price && (
                            <>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textDecoration: 'line-through' }}>
                                    {formatPrice(product.original_price)}
                                </span>
                                <span style={{ fontSize: '0.75rem', color: '#b91c1c', fontWeight: '600' }}>
                                    -{Math.round(((product.original_price - product.price) / product.original_price) * 100)}%
                                </span>
                            </>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                    <button
                        className="btn-primary"
                        style={{
                            flex: 1,
                            padding: '10px 0',
                            fontSize: '0.82rem',
                            borderRadius: '6px',
                            fontWeight: '600',
                            textAlign: 'center',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}
                        onClick={() => onAddToCart(product)}
                    >
                        Add to Cart
                    </button>
                    {(() => {
                        try {
                            const user = JSON.parse(localStorage.getItem('user'));
                            if (user && user.role === 'admin') {
                                return (
                                    <Link
                                        to={`/admin/edit/${product.id || product._id}`}
                                        className="btn-primary"
                                        style={{
                                            padding: '10px 12px',
                                            fontSize: '0.9rem',
                                            borderRadius: '6px',
                                            background: 'transparent',
                                            border: '1px solid rgba(0,0,0,0.08)',
                                            color: 'var(--text-primary)',
                                            textDecoration: 'none',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                        title="Edit Product"
                                    >
                                        ✏️
                                    </Link>
                                );
                            }
                        } catch (e) { return null; }
                    })()}
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
