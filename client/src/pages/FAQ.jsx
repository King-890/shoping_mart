import React from 'react';

const FAQ = () => {
    const faqs = [
        {
            q: "How long does shipping take?",
            a: "Most orders are processed within 24 hours. Standard shipping takes 3-5 business days across India, while express options are available at checkout."
        },
        {
            q: "Do you offer technical support for components?",
            a: "While we don't provide direct engineering services, we provide datasheets and basic pinout guides for most of our sensors and microcontrollers."
        },
        {
            q: "What is your return policy?",
            a: "We offer a 7-day return policy for defective items. Please ensure you take an unboxing video to facilitate faster claims."
        },
        {
            q: "Are the products original?",
            a: "Absolutely. We source all our microcontrollers and ICs from authorized distributors to ensure you get genuine hardware for your projects."
        },
        {
            q: "Where is my order ID?",
            a: "Your Order ID is sent to your email immediately after checkout. You can also find it in your Profile dashboard if you were logged in."
        }
    ];

    return (
        <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem', color: 'var(--text-primary)' }}>
            <div className="glass" style={{ padding: '3rem', borderRadius: '16px', maxWidth: '800px', margin: '0 auto', background: '#ffffff' }}>
                <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '2.5rem', textAlign: 'center' }}>Frequently Asked Questions</h1>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {faqs.map((faq, i) => (
                        <div key={i} className="glass" style={{ padding: '1.5rem', borderRadius: '12px', background: '#f9fafb', border: '1px solid #eaeaea' }}>
                            <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.75rem', fontSize: '1.1rem' }}>Q: {faq.q}</h4>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '0.95rem' }}>
                                A: {faq.a}
                            </p>
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: '3rem', textAlign: 'center', borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: '2rem' }}>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Still have questions?</p>
                    <a href="/contact" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>CONTACT SUPPORT</a>
                </div>
            </div>
        </div>
    );
};

export default FAQ;
