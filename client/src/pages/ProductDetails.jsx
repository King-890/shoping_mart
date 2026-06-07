import React, { useState, useEffect } from 'react';
import API_URL from '../config/api';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { useCurrency } from '../context/CurrencyContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import LoadingSkeleton from '../components/LoadingSkeleton';

const ProductDetails = ({ addToCart }) => {
    const { id } = useParams();
    const { formatPrice } = useCurrency();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [recentlyViewedProducts, setRecentlyViewedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reviews, setReviews] = useState([]);
    const [reviewLoading, setReviewLoading] = useState(false);
    const [alertLoading, setAlertLoading] = useState(false);
    const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
    const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
    const [isZoomed, setIsZoomed] = useState(false);
    const { showToast } = useToast();
    const navigate = useNavigate();

    const handleMouseMove = (e) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;
        setZoomPos({ x, y });
    };

    const isSaved = product ? isInWishlist(product.id || product._id) : false;

    useEffect(() => {
        const fetchProductData = async () => {
            setLoading(true);
            try {
                // Fetch main product via API
                const res = await fetch(`${API_URL}/api/products`);
                const allProducts = await res.json();
                const mainProduct = allProducts.find(p => p.id === id);

                if (!mainProduct) throw new Error('Product not found');
                setProduct(mainProduct);

                // Track Recently Viewed
                try {
                    const recent = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
                    const filtered = recent.filter(p => (p.id || p._id) !== (mainProduct.id || mainProduct._id));
                    const updated = [mainProduct, ...filtered].slice(0, 10);
                    localStorage.setItem('recentlyViewed', JSON.stringify(updated));
                    setRecentlyViewedProducts(filtered.slice(0, 4));
                } catch (err) {
                    console.error('Recently Viewed Error:', err);
                }

                // Fetch related products
                const related = allProducts.filter(p => p.category === mainProduct.category && p.id !== id).slice(0, 4);
                setRelatedProducts(related);

            } catch (error) {
                console.error('Error fetching details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProductData();
        fetchReviews();
        window.scrollTo(0, 0);
    }, [id]);

    const fetchReviews = async () => {
        try {
            // Using API if available or direct Firestore Client
            const res = await fetch(`${API_URL}/api/marketing/reviews/${id}`); // Assumes we add this
            if (res.ok) {
                const data = await res.json();
                setReviews(data || []);
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) {
            showToast('Please login to submit a review.', 'error');
            return;
        }

        setReviewLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/marketing/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    product_id: id,
                    user_id: user.id,
                    user_name: `${user.firstName} ${user.lastName}`,
                    rating: newReview.rating,
                    comment: newReview.comment
                })
            });

            if (!res.ok) throw new Error('Failed to submit review');

            showToast('Review submitted! Thank you. ✨');
            setNewReview({ rating: 5, comment: '' });
            fetchReviews();
        } catch (error) {
            console.error('Error submitting review:', error);
            showToast('Failed to submit review.', 'error');
        } finally {
            setReviewLoading(false);
        }
    };

    const handleJoinWaitlist = async (type) => {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            showToast('Please login to set product alerts.', 'error');
            return;
        }

        const user = JSON.parse(userStr);
        setAlertLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/marketing/waitlist`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: user.email,
                    product_id: product.id,
                    alert_type: type
                })
            });
            const data = await res.json();
            if (res.ok) {
                showToast(data.message, 'success');
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            showToast('Failed to join waitlist.', 'error');
        } finally {
            setAlertLoading(false);
        }
    };

    if (loading) return (
        <div className="container" style={{ paddingTop: '2.5rem' }}>
            <LoadingSkeleton />
        </div>
    );
    if (!product) return <div style={{ color: 'var(--text-primary)', textAlign: 'center', padding: '100px' }}>Product not found.</div>;

    return (
        <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem', marginBottom: '4rem' }}>
                {/* Image Section */}
                <div 
                    onMouseMove={handleMouseMove}
                    onMouseEnter={() => setIsZoomed(true)}
                    onMouseLeave={() => setIsZoomed(false)}
                    style={{
                        background: '#f9fafb',
                        padding: '2rem',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '400px',
                        border: '1px solid rgba(0,0,0,0.06)',
                        position: 'relative',
                        overflow: 'hidden',
                        cursor: 'zoom-in'
                    }}
                >
                    {product.image ? (
                        <img
                            src={product.image.startsWith('http') ? product.image : (product.image.startsWith('/') ? `${API_URL}${product.image}` : product.image)}
                            alt={product.name}
                            style={{ 
                                maxWidth: '100%', 
                                maxHeight: '420px', 
                                objectFit: 'contain', 
                                borderRadius: '8px',
                                transition: isZoomed ? 'none' : 'transform 0.3s ease, transform-origin 0.3s ease',
                                transform: isZoomed ? 'scale(1.8)' : 'scale(1)',
                                transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`
                            }}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/450x450?text=Product+Image';
                            }}
                        />
                    ) : (
                        <div style={{ fontSize: '4rem', color: '#9ca3af' }}>📷</div>
                    )}
                </div>

                {/* Details Section */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ marginBottom: '0.8rem' }}>
                        <span style={{
                            background: '#f3f4f6',
                            color: 'var(--text-primary)',
                            padding: '4px 12px',
                            borderRadius: '4px',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            border: '1px solid rgba(0,0,0,0.06)'
                        }}>
                            {product.category}
                        </span>
                    </div>

                    <h1 style={{ fontSize: '2.25rem', marginBottom: '0.8rem', color: 'var(--text-primary)', fontWeight: '800', letterSpacing: '-0.02em' }}>{product.name}</h1>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <span style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                            {formatPrice(product.price)}
                        </span>
                        {product.original_price && product.original_price > product.price && (
                            <>
                                <span style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', textDecoration: 'line-through' }}>
                                    {formatPrice(product.original_price)}
                                </span>
                                <span style={{ background: '#fee2e2', color: '#991b1b', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700' }}>
                                    SAVE {Math.round(((product.original_price - product.price) / product.original_price) * 100)}%
                                </span>
                            </>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => handleJoinWaitlist('price-drop')}
                            disabled={alertLoading}
                            style={{
                                padding: '6px 14px', borderRadius: '6px', background: '#ffffff',
                                border: '1px solid rgba(0,0,0,0.1)', color: 'var(--text-secondary)',
                                fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px',
                                fontWeight: '500'
                            }}
                        >
                            🔔 Price Alert
                        </button>
                        {product.stock <= 0 && (
                            <button
                                onClick={() => handleJoinWaitlist('restock')}
                                disabled={alertLoading}
                                style={{
                                    padding: '6px 14px', borderRadius: '6px', background: '#fee2e2',
                                    border: '1px solid #fca5a5', color: '#991b1b',
                                    fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px',
                                    fontWeight: '500'
                                }}
                            >
                                📦 Notify Restock
                            </button>
                        )}
                    </div>

                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', lineHeight: '1.6', marginBottom: '2rem' }}>
                        {product.description}
                    </p>

                    <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '2.5rem' }}>
                        <button
                            className="btn-primary"
                            onClick={() => addToCart(product)}
                            style={{ padding: '12px 30px', fontSize: '0.95rem', flex: 1, textTransform: 'uppercase', borderRadius: '6px' }}
                        >
                            Add to Cart 🛒
                        </button>
                        <button
                            className="btn-primary"
                            onClick={() => {
                                addToCart(product);
                                navigate('/checkout');
                            }}
                            style={{
                                padding: '12px 30px', fontSize: '0.95rem', flex: 1,
                                textTransform: 'uppercase', background: '#374151',
                                border: '1px solid #374151', borderRadius: '6px'
                            }}
                        >
                            Buy Now ⚡
                        </button>
                        <button
                            onClick={() => toggleWishlist(product)}
                            style={{
                                background: isSaved ? '#fee2e2' : '#ffffff',
                                border: `1px solid ${isSaved ? '#fca5a5' : 'rgba(0,0,0,0.1)'}`,
                                color: isSaved ? '#ef4444' : 'var(--text-primary)',
                                padding: '12px 16px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                transition: '0.2s',
                                fontSize: '1.1rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            title={isSaved ? "Remove from Wishlist" : "Add to Wishlist"}
                        >
                            {isSaved ? '❤️' : '🤍'}
                        </button>
                    </div>

                    {/* Technical Specifications */}
                    <div style={{ marginTop: '1rem' }}>
                        <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: '700' }}>Specifications</h3>
                        <div style={{ border: '1px solid rgba(0,0,0,0.06)', borderRadius: '8px', overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                <tbody>
                                    <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                                        <td style={{ padding: '10px 14px', color: 'var(--text-secondary)', width: '40%', background: '#f9fafb' }}>Category</td>
                                        <td style={{ padding: '10px 14px', color: 'var(--text-primary)', fontWeight: '500' }}>{product.category}</td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                                        <td style={{ padding: '10px 14px', color: 'var(--text-secondary)', background: '#f9fafb' }}>Availability</td>
                                        <td style={{ padding: '10px 14px', color: product.stock > 0 ? '#16a34a' : '#dc2626', fontWeight: '600' }}>
                                            {product.stock > 0 ? `In Stock (${product.stock} units)` : 'Out of Stock'}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: '10px 14px', color: 'var(--text-secondary)', background: '#f9fafb' }}>Warranty</td>
                                        <td style={{ padding: '10px 14px', color: 'var(--text-primary)', fontWeight: '500' }}>1 Year Brand Warranty</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
                <div style={{ marginTop: '5rem', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '3rem' }}>
                    <h2 style={{ marginBottom: '2rem', borderLeft: '3px solid #121212', paddingLeft: '1rem', fontSize: '1.35rem', fontWeight: '700' }}>You May Also Like</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
                        {relatedProducts.map(rp => (
                            <ProductCard key={rp.id || rp._id} product={rp} onAddToCart={addToCart} />
                        ))}
                    </div>
                </div>
            )}

            {/* Recently Viewed Products */}
            {recentlyViewedProducts.length > 0 && (
                <div style={{ marginTop: '5rem', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '3rem' }}>
                    <h2 style={{ marginBottom: '2rem', borderLeft: '3px solid #121212', paddingLeft: '1rem', fontSize: '1.35rem', fontWeight: '700' }}>Recently Viewed</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
                        {recentlyViewedProducts.map(rp => (
                            <ProductCard key={rp.id || rp._id} product={rp} onAddToCart={addToCart} />
                        ))}
                    </div>
                </div>
            )}

            {/* Reviews Section */}
            <div style={{ marginTop: '5rem', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '3rem' }}>
                <h2 style={{ marginBottom: '2rem', borderLeft: '3px solid #121212', paddingLeft: '1rem', fontSize: '1.35rem', fontWeight: '700' }}>Customer Reviews</h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
                    {/* Submit Review */}
                    <div style={{ background: '#f9fafb', border: '1px solid rgba(0,0,0,0.06)', padding: '2rem', borderRadius: '12px', height: 'fit-content' }}>
                        <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: '700' }}>Share your feedback</h3>
                        <form onSubmit={handleReviewSubmit}>
                            <div style={{ marginBottom: '1.2rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Rating</label>
                                <div style={{ display: 'flex', gap: '0.4rem', fontSize: '1.3rem' }}>
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <span
                                            key={star}
                                            onClick={() => setNewReview({ ...newReview, rating: star })}
                                            style={{ cursor: 'pointer', color: star <= newReview.rating ? '#fbbf24' : '#e5e7eb', transition: '0.2s' }}
                                        >
                                            ★
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div style={{ marginBottom: '1.2rem' }}>
                                <label htmlFor="comment" style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Your Review</label>
                                <textarea
                                    id="comment"
                                    value={newReview.comment}
                                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                    required
                                    style={{
                                        width: '100%',
                                        background: '#ffffff',
                                        border: '1px solid rgba(0,0,0,0.12)',
                                        padding: '10px 12px',
                                        borderRadius: '6px',
                                        color: 'var(--text-primary)',
                                        outline: 'none',
                                        fontSize: '0.85rem'
                                    }}
                                    rows="4"
                                    placeholder="What did you like or dislike?..."
                                    className="input-focus-effect"
                                ></textarea>
                            </div>
                            <button className="btn-primary" type="submit" disabled={reviewLoading} style={{ width: '100%', borderRadius: '6px' }}>
                                {reviewLoading ? 'SUBMITTING...' : 'POST REVIEW'}
                            </button>
                        </form>
                    </div>

                    {/* Review List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                        {reviews.length === 0 ? (
                            <div style={{
                                padding: '3rem',
                                textAlign: 'center',
                                border: '1px dashed rgba(0,0,0,0.15)',
                                borderRadius: '12px',
                                color: 'var(--text-secondary)',
                                fontSize: '0.85rem'
                            }}>
                                No reviews yet. Be the first to review this product!
                            </div>
                        ) : (
                            reviews.map(review => (
                                <div key={review.id || review._id} style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)', padding: '1.5rem', borderRadius: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <h4 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '0.9rem', fontWeight: '700' }}>{review.user_name}</h4>
                                        <div style={{ color: '#fbbf24', fontSize: '0.8rem' }}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</div>
                                    </div>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.5', margin: '0 0 0.5rem 0' }}>{review.comment}</p>
                                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', opacity: 0.8 }}>
                                        {new Date(review.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
