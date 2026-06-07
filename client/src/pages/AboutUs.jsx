import React from 'react';

const AboutUs = () => {
    return (
        <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem', color: 'var(--text-primary)' }}>
            <div className="glass" style={{ padding: '3rem', borderRadius: '16px', maxWidth: '900px', margin: '0 auto' }}>
                <h1 className="text-gradient" style={{ fontSize: '3rem', marginBottom: '2rem', textAlign: 'center' }}>Our Story</h1>

                <section style={{ marginBottom: '3rem' }}>
                    <h3 style={{ color: 'var(--text-primary)', marginBottom: '1.5rem', fontSize: '1.5rem' }}>Our Mission</h3>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', fontSize: '1.1rem' }}>
                        At <strong>Gaya ji Shopping Mart</strong>, we bring high-quality home utilities, personal care products, fashion wear, groceries, electronics, and daily essentials right to your doorstep. We are committed to delivering top-notch retail solutions that simplify your everyday life, with the convenience of Cash on Delivery and reliable customer support.
                    </p>
                </section>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
                    <div className="glass" style={{ padding: '2rem', borderRadius: '12px' }}>
                        <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Premium Quality</h4>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                            We curate our catalog with precision, ensuring every product meets high standards of durability and performance.
                        </p>
                    </div>
                    <div className="glass" style={{ padding: '2rem', borderRadius: '12px' }}>
                        <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Customer First</h4>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                            From seamless browsing to swift doorstep delivery and a simple replacement policy, your satisfaction is our priority.
                        </p>
                    </div>
                </div>

                <section>
                    <h3 style={{ color: 'var(--text-primary)', marginBottom: '1.5rem', fontSize: '1.5rem', textAlign: 'center' }}>Gaya ji Shopping Mart // Trust & Convenience</h3>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', textAlign: 'center', opacity: 0.8 }}>
                        Founded with the vision to provide the best online shopping experience, our team is dedicated to fast shipping and responsive support. We're here to build a reliable relationship with every customer.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default AboutUs;
