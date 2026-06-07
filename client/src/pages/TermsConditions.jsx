import React from 'react';

const TermsConditions = () => {
    return (
        <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem', color: 'var(--text-primary)' }}>
            <div className="glass" style={{ padding: '3rem', borderRadius: '16px', background: '#ffffff' }}>
                <h1 style={{ marginBottom: '2rem', borderBottom: '2px solid #9333ea', display: 'inline-block' }}>Terms & Conditions</h1>

                <section style={{ marginBottom: '2rem' }}>
                    <h3 style={{ color: 'var(--neon-blue)', marginBottom: '1rem' }}>1. Acceptance of Terms</h3>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                        By accessing and using Gaya ji Shopping mart, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use our website.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h3 style={{ color: 'var(--neon-blue)', marginBottom: '1rem' }}>2. Use of Website</h3>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                        You may use Gaya ji Shopping mart for personal and non-commercial purposes only. Any unauthorized use, including data mining or scraping, is strictly prohibited.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h3 style={{ color: 'var(--neon-blue)', marginBottom: '1rem' }}>3. Product Information</h3>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                        We strive to provide accurate product details. However, we do not warrant that product descriptions or other content are error-free.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h3 style={{ color: 'var(--neon-blue)', marginBottom: '1rem' }}>4. Limitation of Liability</h3>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                        Gaya ji Shopping mart shall not be liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use our services.
                    </p>
                </section>

                <section>
                    <h3 style={{ color: 'var(--neon-blue)', marginBottom: '1rem' }}>5. Governing Law</h3>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                        These terms shall be governed by and construed in accordance with the laws of India.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default TermsConditions;
