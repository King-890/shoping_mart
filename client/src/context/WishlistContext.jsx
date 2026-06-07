import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
    const [wishlist, setWishlist] = useState([]);
    const { showToast } = useToast();

    // Load from localStorage on init
    useEffect(() => {
        const saved = localStorage.getItem('wishlist');
        if (saved) {
            try {
                setWishlist(JSON.parse(saved));
            } catch (e) {
                setWishlist([]);
            }
        }
    }, []);

    // Save to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }, [wishlist]);

    const toggleWishlist = (product) => {
        const isWishlisted = wishlist.some(item => (item.id || item._id) === (product.id || product._id));

        if (isWishlisted) {
            setWishlist(prev => prev.filter(item => (item.id || item._id) !== (product.id || product._id)));
            showToast(`${product.name} removed from wishlist.`, 'success');
        } else {
            setWishlist(prev => [...prev, product]);
            showToast(`${product.name} saved to wishlist! ❤️`);
        }
    };

    const isInWishlist = (productId) => {
        return wishlist.some(item => (item.id || item._id) === productId);
    };

    return (
        <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => useContext(WishlistContext);
