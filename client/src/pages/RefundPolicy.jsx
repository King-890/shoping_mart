import React from 'react';

const RefundPolicy = () => {
    return (
        <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem', color: 'var(--text-primary)' }}>
            <div className="glass" style={{ padding: '3rem', borderRadius: '16px', background: '#ffffff' }}>
                <h1 style={{ marginBottom: '2rem', borderBottom: '2px solid #9333ea', display: 'inline-block' }}>Refund & Cancellation Policy</h1>

                <section style={{ marginBottom: '2rem' }}>
                    <h3 style={{ color: 'var(--neon-blue)', marginBottom: '1rem' }}>1. Cancellations</h3>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                        Orders can be cancelled within <strong>24 hours</strong> of placement. Once shipped, orders cannot be cancelled.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h3 style={{ color: 'var(--neon-blue)', marginBottom: '1rem' }}>2. Returns</h3>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                        We accept returns within <strong>7 days</strong> of delivery for defective or damaged items. Items must be in their original packaging.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h3 style={{ color: 'var(--neon-blue)', marginBottom: '1rem' }}>3. Refunds</h3>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                        Once your return is received and inspected, we will notify you of the approval or rejection of your refund. Approved refunds will be processed within 5-7 business days.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h3 style={{ color: 'var(--neon-blue)', marginBottom: '1rem' }}>4. Shipping Costs</h3>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                        You will be responsible for paying your own shipping costs for returning your item unless the item is defective.
                    </p>
                </section>

                <section>
                    <h3 style={{ color: 'var(--neon-blue)', marginBottom: '1rem' }}>5. Contact for Returns</h3>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                        To initiate a return, please contact us at shoppingmartgayaji@gmail.com with your order number and photos of the issue.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default RefundPolicy;
