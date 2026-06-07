import React from 'react';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';

const Wishlist = ({ addToCart }) => {
    const { wishlist } = useWishlist();

    return (
        <div className="container" style={{ paddingTop: '2.5rem', minHeight: '80vh', paddingBottom: '4rem' }}>
            <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
                <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>Your <span className="text-gradient">Wishlist</span> ❤️</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Save your favorite items for later</p>
            </div>

            {wishlist.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem' }}>
                    <div style={{ fontSize: '5rem', marginBottom: '1rem', opacity: 0.3 }}>📪</div>
                    <h3 style={{ color: 'var(--text-secondary)' }}>Your wishlist is empty.</h3>
                    <p style={{ marginTop: '1rem' }}>
                        <a href="/" style={{ color: 'var(--neon-blue)', textDecoration: 'none', fontWeight: 'bold' }}>Browse some products →</a>
                    </p>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '2rem'
                }}>
                    {wishlist.map((product) => (
                        <ProductCard
                            key={product.id || product._id}
                            product={product}
                            onAddToCart={addToCart}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Wishlist;
