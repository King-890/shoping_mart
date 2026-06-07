import React from 'react';

const PrivacyPolicy = () => {
    return (
        <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem', color: 'var(--text-primary)' }}>
            <div className="glass" style={{ padding: '3rem', borderRadius: '16px', background: '#ffffff' }}>
                <h1 style={{ marginBottom: '2rem', borderBottom: '2px solid #9333ea', display: 'inline-block' }}>Privacy Policy</h1>

                <section style={{ marginBottom: '2rem' }}>
                    <h3 style={{ color: 'var(--neon-blue)', marginBottom: '1rem' }}>1. Data Collection</h3>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                        We collect information such as your name, email, and shipping address when you place an order or create an account.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h3 style={{ color: 'var(--neon-blue)', marginBottom: '1rem' }}>2. Use of Information</h3>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                        Your information is used to process orders, improve our services, and communicate with you about updates or promotions.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h3 style={{ color: 'var(--neon-blue)', marginBottom: '1rem' }}>3. Data Security</h3>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                        We implement strict security measures to protect your personal data. We do not sell or share your information with third parties for marketing purposes.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h3 style={{ color: 'var(--neon-blue)', marginBottom: '1rem' }}>4. Cookies</h3>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                        We use cookies to enhance your browsing experience and analyze website traffic.
                    </p>
                </section>

                <section>
                    <h3 style={{ color: 'var(--neon-blue)', marginBottom: '1rem' }}>5. Contact Us</h3>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                        If you have questions about our privacy practices, please contact us at shoppingmartgayaji@gmail.com.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
