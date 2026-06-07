import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
// Product fetching now uses the consolidated API
import LoadingSkeleton from '../components/LoadingSkeleton';
import { useCurrency } from '../context/CurrencyContext';

import { useToast } from '../context/ToastContext';
import { API_URL } from '../config/api';

const CATEGORIES = [
    'All',
    'Home Utilities',
    'Personal Care',
    'Footwear & Fashion',
    'Grocery & Essentials',
    'Toys, Sports & Fitness',
    'Home & Furniture'
];

const Home = ({ addToCart, searchQuery, setSearchQuery }) => {
    const [searchParams] = useSearchParams();
    const categoryParam = searchParams.get('category');

    const [activeCategory, setActiveCategory] = useState(categoryParam || 'All');
    const [products, setProducts] = useState([]);
    const [reels, setReels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [timeLeft, setTimeLeft] = useState({ hours: 12, minutes: 0, seconds: 0 });
    const [sortBy, setSortBy] = useState('newest'); // 'price-low', 'price-high', 'newest', 'rating'
    const [priceRange, setPriceRange] = useState({ min: 0, max: 200000 });
    const [selectedRatings, setSelectedRatings] = useState([]); // [4, 3, 2, etc.]
    const [filterSidebarOpen, setFilterSidebarOpen] = useState(true);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [blenderSlideIndex, setBlenderSlideIndex] = useState(0);
    const [activeReelMuted, setActiveReelMuted] = useState({
        'reel-1': true,
        'reel-2': true,
        'reel-3': true
    });

    const { showToast } = useToast();
    const { formatPrice } = useCurrency();
    const productSectionRef = useRef(null);

    const slides = [
        {
            title: "Trending Kitchen Appliances",
            subtitle: "Premium blenders, smart electric kettles, and modern kitchen helpers that make cooking perfect.",
            tag: "DAILY ESSENTIALS",
            cta: "SHOP NOW",
            bg: "#fef8f3",
            image: "/kitchen_appliances.png"
        },
        {
            title: "Personal Care & Grooming",
            subtitle: "Sleek shavers, facial brushes, and essential personal care tools for your daily routine.",
            tag: "NEW ARRIVALS",
            cta: "BROWSE TOOLS",
            bg: "#faf5ff",
            image: "/personal_care.png"
        },
        {
            title: "Smart Electronics & Tech",
            subtitle: "Next-gen smartwatches, wireless earbuds, and premium tech gadgets for the modern lifestyle.",
            tag: "TECH ACCESSORIES",
            cta: "SHOP DEALS",
            bg: "#f0fdfa",
            image: "/smart_electronics.png"
        }
    ];

    // Auto-slide effect
    useEffect(() => {
        const slideInterval = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(slideInterval);
    }, [slides.length]);

    const blenderImages = [
        `${API_URL}/uploads/blender.png`,
        `${API_URL}/uploads/blender_2.png`,
        `${API_URL}/uploads/blender_3.png`
    ];

    // Auto-slide effect for promotional blender banner images
    useEffect(() => {
        const interval = setInterval(() => {
            setBlenderSlideIndex(prev => (prev + 1) % blenderImages.length);
        }, 3500);
        return () => clearInterval(interval);
    }, [blenderImages.length]);

    // Flash Sale Timer (Persistent)
    useEffect(() => {
        const targetDate = new Date();
        targetDate.setHours(23, 59, 59, 999); // End of today

        const calculateTimeLeft = () => {
            const now = new Date();
            const difference = targetDate - now;

            if (difference > 0) {
                return {
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60)
                };
            }
            return { hours: 0, minutes: 0, seconds: 0 };
        };

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const handleSubscribe = async (e) => {
        e.preventDefault();
        if (!email) return;
        setSubmitting(true);
        try {
            const res = await fetch(`${API_URL}/api/marketing/subscribe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, type: 'general' })
            });
            if (res.ok) {
                showToast('Welcome to the inner circle! 💌', 'success');
                setEmail('');
            } else {
                throw new Error('Failed to subscribe');
            }
        } catch (err) {
            showToast('Unable to subscribe. Please try again later.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    // Update activeCategory when URL param changes
    useEffect(() => {
        if (categoryParam) {
            setActiveCategory(categoryParam);
            if (productSectionRef.current) {
                productSectionRef.current.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, [categoryParam]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch(`${API_URL}/api/products`);
                if (!res.ok) throw new Error('Failed to fetch products');
                const data = await res.json();
                setProducts(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Error fetching products from API:', error);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        const fetchReels = async () => {
            try {
                const res = await fetch(`${API_URL}/api/marketing/reels`);
                if (!res.ok) throw new Error('Failed to fetch reels');
                const data = await res.json();
                setReels(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Error fetching reels:', error);
                setReels([]);
            }
        };

        fetchProducts();
        fetchReels();
    }, []);

    const scrollToProducts = () => {
        productSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    let filteredProducts = products.filter(p => {
        const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.category.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesPrice = p.price >= priceRange.min && p.price <= priceRange.max;
        const matchesRating = selectedRatings.length === 0 || selectedRatings.some(r => Math.floor(p.rating || 0) >= r);
        return matchesCategory && matchesSearch && matchesPrice && matchesRating;
    });

    const clearAllFilters = () => {
        setActiveCategory('All');
        setPriceRange({ min: 0, max: 200000 });
        setSelectedRatings([]);
        setSortBy('newest');
    };

    // Apply Sorting
    filteredProducts = [...filteredProducts].sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        if (sortBy === 'newest') return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        return 0;
    });



    return (
        <div className="home-container" style={{ paddingBottom: '4rem' }}>
            {/* Flash Sale Bar */}
            <div className="flash-sale-bar" style={{
                background: '#fef2f2',
                color: '#991b1b',
                padding: '10px 0',
                textAlign: 'center',
                fontWeight: '600',
                fontSize: '0.82rem',
                position: 'sticky',
                top: '102px',
                zIndex: 998,
                borderBottom: '1px solid #fee2e2',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '12px'
            }}>
                <span style={{ letterSpacing: '0.5px' }}>⚡ LIMITED FLASH SALE ENDS IN</span>
                <span style={{
                    background: '#fee2e2',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    border: '1px solid #fca5a5',
                    color: '#991b1b',
                    fontFamily: 'monospace',
                    fontSize: '0.9rem',
                    fontWeight: 'bold'
                }}>
                    {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#b91c1c' }}>| CASH ON DELIVERY AVAILABLE</span>
            </div>

            <main className="container" style={{ minHeight: '60vh' }}>
                {/* Hero Slider */}
                <div className="hero-slider-container">
                    {slides.map((slide, idx) => (
                        <div
                            key={idx}
                            className={`hero-slide ${currentSlide === idx ? 'active' : 'inactive'}`}
                            style={{
                                background: slide.bg,
                                zIndex: currentSlide === idx ? 1 : 0
                            }}
                        >
                            <div className="hero-slide-content">
                                <span style={{
                                    fontSize: '0.72rem',
                                    fontWeight: '700',
                                    letterSpacing: '1px',
                                    color: 'var(--text-secondary)',
                                    textTransform: 'uppercase',
                                    marginBottom: '0.8rem',
                                    display: 'block'
                                }}>
                                    {slide.tag}
                                </span>
                                <h2 style={{
                                    fontSize: '2.25rem',
                                    fontWeight: '800',
                                    color: 'var(--text-primary)',
                                    marginBottom: '0.8rem',
                                    lineHeight: '1.2',
                                    maxWidth: '600px',
                                    letterSpacing: '-0.02em'
                                }}>
                                    {slide.title}
                                </h2>
                                <p style={{
                                    fontSize: '0.98rem',
                                    color: 'var(--text-secondary)',
                                    marginBottom: '1.8rem',
                                    maxWidth: '550px',
                                    lineHeight: '1.5'
                                }}>
                                    {slide.subtitle}
                                </p>
                                <div>
                                    <button
                                        className="btn-primary"
                                        onClick={scrollToProducts}
                                        style={{
                                            padding: '11px 28px',
                                            borderRadius: '6px',
                                            fontWeight: '600',
                                            background: '#f97316',
                                            borderColor: '#f97316'
                                        }}
                                        onMouseOver={(e) => { e.currentTarget.style.background = '#ea580c'; e.currentTarget.style.borderColor = '#ea580c'; }}
                                        onMouseOut={(e) => { e.currentTarget.style.background = '#f97316'; e.currentTarget.style.borderColor = '#f97316'; }}
                                    >
                                        {slide.cta}
                                    </button>
                                </div>
                            </div>
                            <div className="hero-slide-image-container">
                                <img
                                    src={slide.image}
                                    alt={slide.title}
                                    className="hero-slide-image"
                                />
                            </div>
                        </div>
                    ))}
                    
                    {/* Dots Indicator */}
                    <div style={{
                        position: 'absolute',
                        bottom: '15px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        display: 'flex',
                        gap: '6px',
                        zIndex: 10
                    }}>
                        {slides.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentSlide(idx)}
                                style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    border: 'none',
                                    background: currentSlide === idx ? 'var(--text-primary)' : '#d1d5db',
                                    cursor: 'pointer',
                                    transition: 'background 0.3s ease'
                                }}
                            />
                        ))}
                    </div>
                </div>



                {/* Collections Section */}
                <section className="section-card" style={{ marginTop: '2.5rem' }}>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '1.5rem', textAlign: 'center' }}>Explore Our Collections</h2>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                        gap: '1.5rem'
                    }}>
                        <div className="glass" style={{ padding: '1.5rem', borderRadius: '12px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', minHeight: '220px', cursor: 'pointer' }} onClick={() => setActiveCategory('Home Utilities')}>
                            <img src={`${API_URL}/uploads/cleaner.png`} alt="Home Utilities" style={{ width: '80px', height: '80px', objectFit: 'contain', marginBottom: '1rem', borderRadius: '8px' }} />
                            <div>
                                <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '4px' }}>Home Utilities</h4>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Best Sellers</span>
                            </div>
                        </div>

                        <div className="glass" style={{ padding: '1.5rem', borderRadius: '12px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', minHeight: '220px', cursor: 'pointer' }} onClick={() => setActiveCategory('Personal Care')}>
                            <img src={`${API_URL}/uploads/groomer.png`} alt="Personal Care" style={{ width: '80px', height: '80px', objectFit: 'contain', marginBottom: '1rem', borderRadius: '8px' }} />
                            <div>
                                <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '4px' }}>Personal Care</h4>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Grooming Kits</span>
                            </div>
                        </div>

                        <div className="glass" style={{ padding: '1.5rem', borderRadius: '12px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', minHeight: '220px', cursor: 'pointer' }} onClick={() => setActiveCategory('Mobile & Electronics')}>
                            <img src="/smart_electronics.png" alt="Mobile & Electronics" style={{ width: '80px', height: '80px', objectFit: 'contain', marginBottom: '1rem', borderRadius: '8px' }} />
                            <div>
                                <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '4px' }}>Mobiles & Tech</h4>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>New Arrivals</span>
                            </div>
                        </div>

                        <div className="glass" style={{ padding: '1.5rem', borderRadius: '12px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', minHeight: '220px', cursor: 'pointer' }} onClick={() => setActiveCategory('All')}>
                            <div style={{ width: '80px', height: '80px', background: '#e5e7eb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', marginBottom: '1rem' }}>🛍️</div>
                            <div>
                                <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '4px' }}>All Products</h4>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Browse Catalog</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Promotional Blender Banner */}
                <section className="promo-banner" style={{ margin: '3rem 0' }}>
                    <div className="promo-banner-text">
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <span style={{
                                background: '#b45309',
                                color: '#ffffff',
                                padding: '3px 8px',
                                borderRadius: '4px',
                                fontSize: '0.65rem',
                                fontWeight: 'bold',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}>
                                Launch Offer
                            </span>
                            <span style={{ fontSize: '0.8rem', color: '#b45309', fontWeight: '600' }}>⭐ 4.9 Rated by 400+ Users</span>
                        </div>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#1e293b', lineHeight: '1.2', margin: 0 }}>
                            AGARO Cosmic Portable Personal Blender
                        </h2>
                        <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.5', margin: 0, maxWidth: '500px' }}>
                            Powerful 120W motor & 6 stainless steel blades blend fresh juices, shakes, and smoothies in 30 seconds. Features USB-C charging and a leak-proof BPA-free travel bottle.
                        </p>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginTop: '0.2rem' }}>
                            <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#b45309' }}>₹999</span>
                            <span style={{ fontSize: '0.9rem', color: '#64748b', textDecoration: 'line-through' }}>₹1,999</span>
                            <span style={{ fontSize: '0.75rem', color: '#b91c1c', fontWeight: '700' }}>(50% OFF)</span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                            <button
                                onClick={() => {
                                    const blenderProduct = products.find(p => p.id === 'prod-7') || {
                                        id: 'prod-7',
                                        name: 'AGARO Cosmic Portable Personal Blender',
                                        category: 'Home Utilities',
                                        price: 999,
                                        original_price: 1999,
                                        image: '/uploads/blender.png',
                                        description: 'Powerful 120W rechargeable portable blender with USB-C, 6 stainless steel blades, and 400ml BPA-free travel jar.'
                                    };
                                    addToCart(blenderProduct);
                                }}
                                className="btn-primary"
                                style={{
                                    padding: '10px 20px',
                                    fontSize: '0.8rem',
                                    fontWeight: '700',
                                    background: '#b45309',
                                    borderColor: '#b45309'
                                }}
                                onMouseOver={(e) => { e.currentTarget.style.background = '#78350f'; e.currentTarget.style.borderColor = '#78350f'; }}
                                onMouseOut={(e) => { e.currentTarget.style.background = '#b45309'; e.currentTarget.style.borderColor = '#b45309'; }}
                            >
                                ADD TO CART 🛒
                            </button>
                            <Link
                                to="/product/prod-7"
                                style={{
                                    padding: '9px 18px',
                                    fontSize: '0.8rem',
                                    fontWeight: '700',
                                    borderRadius: '8px',
                                    background: 'transparent',
                                    border: '1px solid rgba(180, 83, 9, 0.4)',
                                    color: '#b45309',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    textDecoration: 'none',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(180, 83, 9, 0.05)'; e.currentTarget.style.borderColor = '#b45309'; }}
                                onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(180, 83, 9, 0.4)'; }}
                            >
                                VIEW DETAILS
                            </Link>
                        </div>
                    </div>
                    <div className="promo-banner-image-container" style={{ position: 'relative', width: '100%', height: '220px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        {blenderImages.map((imgUrl, idx) => (
                            <img
                                key={idx}
                                src={imgUrl}
                                alt={`AGARO Cosmic Portable Blender View ${idx + 1}`}
                                style={{
                                    position: 'absolute',
                                    maxHeight: '220px',
                                    maxWidth: '100%',
                                    objectFit: 'contain',
                                    borderRadius: '8px',
                                    filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.06))',
                                    opacity: blenderSlideIndex === idx ? 1 : 0,
                                    transition: 'opacity 0.8s ease-in-out',
                                    zIndex: blenderSlideIndex === idx ? 2 : 1
                                }}
                            />
                        ))}
                    </div>
                </section>

                {/* Catalog Section */}
                <section ref={productSectionRef} className="section-card">
                    <div style={{ marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                            <h3 style={{ fontSize: '1.35rem', fontWeight: '700', margin: 0 }}>Featured Catalog</h3>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                {/* Sort By */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    background: '#f9fafb',
                                    padding: '6px 14px',
                                    borderRadius: '6px',
                                    border: '1px solid rgba(0, 0, 0, 0.08)'
                                }}>
                                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Sort:</span>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        style={{ background: 'transparent', color: 'var(--text-primary)', border: 'none', outline: 'none', cursor: 'pointer', fontSize: '0.78rem', fontWeight: '600' }}
                                    >
                                        <option value="newest">Newest Arrivals</option>
                                        <option value="price-low">Price: Low to High</option>
                                        <option value="price-high">Price: High to Low</option>
                                        <option value="rating">Top Rated</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Category Filter Pills */}
                        <div style={{
                            display: 'flex',
                            gap: '0.6rem',
                            overflowX: 'auto',
                            paddingBottom: '0.6rem',
                            marginTop: '1.2rem',
                            scrollbarWidth: 'none'
                        }}>
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    style={{
                                        background: activeCategory === cat ? '#9333ea' : '#f3f4f6',
                                        color: activeCategory === cat ? '#ffffff' : 'var(--text-secondary)',
                                        border: activeCategory === cat ? '1px solid #9333ea' : '1px solid rgba(0,0,0,0.04)',
                                        padding: '6px 16px',
                                        borderRadius: '6px',
                                        whiteSpace: 'nowrap',
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                        fontSize: '0.78rem',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseOver={e => {
                                        if (activeCategory !== cat) {
                                            e.currentTarget.style.background = '#e5e7eb';
                                        }
                                    }}
                                    onMouseOut={e => {
                                        if (activeCategory !== cat) {
                                            e.currentTarget.style.background = '#f3f4f6';
                                        }
                                    }}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Catalog Layout with Sidebar */}
                    <div className="catalog-layout">
                        {/* Filter Sidebar */}
                        <div className="filter-sidebar">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <span style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-primary)' }}>Filters</span>
                                <button className="filter-clear-btn" onClick={clearAllFilters} style={{ width: 'auto', padding: '4px 10px' }}>Clear All</button>
                            </div>

                            {/* Categories */}
                            <div className="filter-section-title">Category</div>
                            {CATEGORIES.filter(c => c !== 'All').map(cat => (
                                <label key={cat} className="filter-option">
                                    <input
                                        type="checkbox"
                                        checked={activeCategory === cat}
                                        onChange={() => setActiveCategory(activeCategory === cat ? 'All' : cat)}
                                    />
                                    {cat}
                                </label>
                            ))}

                            {/* Price Range */}
                            <div className="filter-section-title" style={{ marginTop: '16px' }}>Price Range</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: '600', marginBottom: '6px' }}>
                                Up to {formatPrice(priceRange.max)}
                            </div>
                            <input
                                className="price-range-slider"
                                type="range"
                                min="0"
                                max="200000"
                                step="500"
                                value={priceRange.max}
                                onChange={e => setPriceRange({ ...priceRange, max: parseInt(e.target.value) })}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                <span>₹0</span>
                                <span>₹2L+</span>
                            </div>

                            {/* Rating Filter */}
                            <div className="filter-section-title" style={{ marginTop: '16px' }}>Customer Rating</div>
                            {[4, 3, 2, 1].map(r => (
                                <label key={r} className="star-filter-row">
                                    <input
                                        type="checkbox"
                                        checked={selectedRatings.includes(r)}
                                        onChange={() => setSelectedRatings(prev =>
                                            prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r]
                                        )}
                                    />
                                    {'⭐'.repeat(r)} & up
                                </label>
                            ))}
                        </div>

                        {/* Product Grid */}
                        <div className="catalog-grid-area">
                    {loading ? (
                        <LoadingSkeleton />
                    ) : (
                        <>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                                gap: '2rem'
                            }}>
                                {filteredProducts.map((product, index) => (
                                    <ProductCard
                                        key={product.id || product._id || index}
                                        product={product}
                                        onAddToCart={addToCart}
                                    />
                                ))}
                            </div>

                            {filteredProducts.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
                                    <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔍</div>
                                    <p style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>No products found.</p>
                                    <button
                                        className="btn-primary"
                                        onClick={clearAllFilters}
                                        style={{ padding: '10px 24px', borderRadius: '6px' }}
                                    >
                                        Clear All Filters
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                        </div>
                    </div>
                </section>

                {/* Brand Showcase Section */}
                <section className="section-card">
                    <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: '900', marginBottom: '2.5rem', letterSpacing: '2px' }}>GAYA JI SHOPPING MART FEATURED</h2>
                    
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                        gap: '1.5rem'
                    }}>
                        <div className="glass" style={{ overflow: 'hidden', borderRadius: '12px', position: 'relative', height: '320px' }}>
                            <img src={`${API_URL}/uploads/cleaner.png`} alt="Featured Cleaners" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', padding: '1.5rem', color: '#ffffff' }}>
                                <h4 style={{ fontSize: '1rem', fontWeight: '700', margin: '0 0 5px 0', color: '#fff' }}>Power Scrubbers</h4>
                                <p style={{ fontSize: '0.75rem', margin: 0, opacity: 0.8 }}>Revolving heat & speed settings knob helpers.</p>
                            </div>
                        </div>

                        <div className="glass" style={{ overflow: 'hidden', borderRadius: '12px', position: 'relative', height: '320px' }}>
                            <img src={`${API_URL}/uploads/groomer.png`} alt="Featured Groomers" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', padding: '1.5rem', color: '#ffffff' }}>
                                <h4 style={{ fontSize: '1rem', fontWeight: '700', margin: '0 0 5px 0', color: '#fff' }}>Grooming Trimmers</h4>
                                <p style={{ fontSize: '0.75rem', margin: 0, opacity: 0.8 }}>Smooth & precise facial care styling.</p>
                            </div>
                        </div>

                        <div className="glass" style={{ overflow: 'hidden', borderRadius: '12px', position: 'relative', height: '320px' }}>
                            <img src={`${API_URL}/uploads/scrubber.png`} alt="Skincare Scrubber" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', padding: '1.5rem', color: '#ffffff' }}>
                                <h4 style={{ fontSize: '1rem', fontWeight: '700', margin: '0 0 5px 0', color: '#fff' }}>Ultrasonic Scrubber</h4>
                                <p style={{ fontSize: '0.75rem', margin: 0, opacity: 0.8 }}>Professional skin peeling & face lifting.</p>
                            </div>
                        </div>

                        <div className="glass" style={{ overflow: 'hidden', borderRadius: '12px', position: 'relative', height: '320px' }}>
                            <img src={`${API_URL}/uploads/straightener.png`} alt="Hair Straightener" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', padding: '1.5rem', color: '#ffffff' }}>
                                <h4 style={{ fontSize: '1rem', fontWeight: '700', margin: '0 0 5px 0', color: '#fff' }}>Precision Stylers</h4>
                                <p style={{ fontSize: '0.75rem', margin: 0, opacity: 0.8 }}>Ceramic heating plates for perfect hair styling.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Product Reels Section */}
                <section className="section-card">
                    <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: '900', marginBottom: '0.5rem', letterSpacing: '2px', textTransform: 'uppercase' }}>
                        Gaya ji Shopping Mart Reels
                    </h2>
                    <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2.5rem' }}>
                        See our trending utilities in action! Hover to play, tap speaker to unmute, and shop instantly.
                    </p>

                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '2rem',
                        flexWrap: 'wrap',
                        margin: '2rem 0'
                    }}>
                        {reels.map(reel => (
                            <div
                                key={reel.id}
                                className="glass"
                                style={{
                                    width: '280px',
                                    height: '460px',
                                    borderRadius: '16px',
                                    overflow: 'hidden',
                                    position: 'relative',
                                    background: '#121212',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                                    transition: 'transform 0.3s ease'
                                }}
                                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                                onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                {/* Video element */}
                                <video
                                    src={reel.videoUrl}
                                    loop
                                    muted={activeReelMuted[reel.id]}
                                    autoPlay
                                    playsInline
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                    }}
                                />

                                {/* Floating Mute/Unmute Toggle */}
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setActiveReelMuted(prev => ({
                                            ...prev,
                                            [reel.id]: !prev[reel.id]
                                        }));
                                    }}
                                    style={{
                                        position: 'absolute',
                                        top: '15px',
                                        right: '15px',
                                        background: 'rgba(0, 0, 0, 0.5)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        color: '#ffffff',
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        zIndex: 5,
                                        fontSize: '0.9rem',
                                        backdropFilter: 'blur(4px)',
                                        transition: 'background 0.2s'
                                    }}
                                    onMouseOver={e => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.7)'}
                                    onMouseOut={e => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.5)'}
                                    title={activeReelMuted[reel.id] ? "Unmute" : "Mute"}
                                >
                                    {activeReelMuted[reel.id] ? '🔇' : '🔊'}
                                </button>

                                {/* Floating Reel Indicator Tag */}
                                <div style={{
                                    position: 'absolute',
                                    top: '15px',
                                    left: '15px',
                                    background: 'rgba(239, 68, 68, 0.85)',
                                    color: '#ffffff',
                                    padding: '3px 8px',
                                    borderRadius: '4px',
                                    fontSize: '0.62rem',
                                    fontWeight: 'bold',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    zIndex: 5,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }}>
                                    <span style={{ display: 'inline-block', width: '6px', height: '6px', background: '#fff', borderRadius: '50%', animation: 'pulse 1.5s infinite' }}></span>
                                    Reel
                                </div>

                                {/* Overlaid Product Info Drawer at bottom */}
                                <div style={{
                                    position: 'absolute',
                                    bottom: '16px',
                                    left: '16px',
                                    right: '16px',
                                    background: 'rgba(255, 255, 255, 0.92)',
                                    backdropFilter: 'blur(10px)',
                                    borderRadius: '12px',
                                    padding: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    border: '1px solid rgba(255, 255, 255, 0.3)',
                                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                                    zIndex: 4
                                }}>
                                    <img
                                        src={reel.productImage}
                                        alt={reel.productName}
                                        style={{
                                            width: '40px',
                                            height: '40px',
                                            objectFit: 'cover',
                                            borderRadius: '6px',
                                            border: '1px solid rgba(0,0,0,0.06)'
                                        }}
                                    />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <h5 style={{
                                            fontSize: '0.8rem',
                                            fontWeight: '700',
                                            color: '#1e293b',
                                            margin: 0,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {reel.productName}
                                        </h5>
                                        <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#b45309' }}>₹{reel.productPrice}</span>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            const productObj = products.find(p => p.id === reel.productId) || {
                                                id: reel.productId,
                                                name: reel.productName,
                                                price: reel.productPrice,
                                                image: reel.productImage
                                            };
                                            addToCart(productObj);
                                        }}
                                        style={{
                                            background: '#121212',
                                            color: '#ffffff',
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: '32px',
                                            height: '32px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            fontSize: '0.8rem',
                                            transition: 'transform 0.2s'
                                        }}
                                        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
                                        onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                                        title="Quick Buy"
                                    >
                                        🛒
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Customer Reviews Section */}
                <section className="section-card">
                    <h3 style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: '800', marginBottom: '2.5rem', letterSpacing: '-0.02em' }}>What Our Customers Say</h3>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '1.5rem'
                    }}>
                        <div style={{ background: '#f9fafb', border: '1px solid rgba(0, 0, 0, 0.06)', borderRadius: '12px', padding: '1.5rem' }}>
                            <div style={{ display: 'flex', color: '#fbbf24', gap: '2px', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                            </div>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontStyle: 'italic', marginBottom: '1rem', lineHeight: '1.5' }}>
                                "Excellent experience. Ordered a smart kitchen blender and personal grooming trimmer, they arrived super fast in perfect packaging. Everything worked right out of the box."
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '0.78rem', fontWeight: '700' }}>Aarav S.</span>
                                <span style={{ background: '#d1fae5', color: '#065f46', fontSize: '0.62rem', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>✓ VERIFIED BUYER</span>
                            </div>
                        </div>
                        <div style={{ background: '#f9fafb', border: '1px solid rgba(0, 0, 0, 0.06)', borderRadius: '12px', padding: '1.5rem' }}>
                            <div style={{ display: 'flex', color: '#fbbf24', gap: '2px', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                            </div>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontStyle: 'italic', marginBottom: '1rem', lineHeight: '1.5' }}>
                                "Highly satisfied with the product quality. The 5-in-1 electric cleaning brush makes cleaning stoves and tiles incredibly easy. Customer support is friendly and helpful."
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '0.78rem', fontWeight: '700' }}>Priya M.</span>
                                <span style={{ background: '#d1fae5', color: '#065f46', fontSize: '0.62rem', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>✓ VERIFIED BUYER</span>
                            </div>
                        </div>
                        <div style={{ background: '#f9fafb', border: '1px solid rgba(0, 0, 0, 0.06)', borderRadius: '12px', padding: '1.5rem' }}>
                            <div style={{ display: 'flex', color: '#fbbf24', gap: '2px', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                            </div>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontStyle: 'italic', marginBottom: '1rem', lineHeight: '1.5' }}>
                                "Quick shipping and competitive prices. Got my skin scrubber delivered next day. The product build quality is very solid."
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '0.78rem', fontWeight: '700' }}>Vikram K.</span>
                                <span style={{ background: '#d1fae5', color: '#065f46', fontSize: '0.62rem', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>✓ VERIFIED BUYER</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Customer Support & Self-Service Portal Section */}
                <section className="section-card" style={{ textAlign: 'center' }}>
                    <h3 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
                        Customer Support & Self-Service
                    </h3>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem auto', lineHeight: '1.5' }}>
                        Need assistance with a purchase? You can initiate replacements, track your order shipping status, or contact our support desk directly from here.
                    </p>
                    
                    <div className="support-portal-grid">
                        {/* Column 1: Returns & Replacement */}
                        <div className="glass" style={{ padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem', background: '#ffffff' }}>
                            <span style={{ fontSize: '2.2rem' }}>🔄</span>
                            <h4 style={{ fontSize: '1.05rem', fontWeight: '700', margin: 0 }}>Returns & Replacement</h4>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4', margin: 0, minHeight: '40px' }}>
                                Initiate a returns or exchange request under our 7-day policy.
                            </p>
                            <Link to="/return-form" className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.78rem', marginTop: 'auto', textTransform: 'uppercase', fontWeight: 'bold' }}>
                                Request Return
                            </Link>
                        </div>

                        {/* Column 2: Track Shipments */}
                        <div className="glass" style={{ padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem', background: '#ffffff' }}>
                            <span style={{ fontSize: '2.2rem' }}>🚚</span>
                            <h4 style={{ fontSize: '1.05rem', fontWeight: '700', margin: 0 }}>Track Your Order</h4>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4', margin: 0, minHeight: '40px' }}>
                                View real-time shipping progress and status of your package.
                            </p>
                            <Link to="/track-order" className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.78rem', marginTop: 'auto', textTransform: 'uppercase', fontWeight: 'bold' }}>
                                Track Order
                            </Link>
                        </div>

                        {/* Column 3: Contact Support */}
                        <div className="glass" style={{ padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem', background: '#ffffff' }}>
                            <span style={{ fontSize: '2.2rem' }}>💬</span>
                            <h4 style={{ fontSize: '1.05rem', fontWeight: '700', margin: 0 }}>Direct Support</h4>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4', margin: 0, minHeight: '40px' }}>
                                Have questions? Speak to our customer care team 24/7.
                            </p>
                            <Link to="/contact" className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.78rem', marginTop: 'auto', textTransform: 'uppercase', fontWeight: 'bold' }}>
                                Contact Us
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Home;
