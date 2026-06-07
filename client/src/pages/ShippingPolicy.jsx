import React from 'react';

const ShippingPolicy = () => {
    return (
        <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem', color: 'var(--text-primary)' }}>
            <div className="glass" style={{ padding: '3rem', borderRadius: '16px', background: '#ffffff' }}>
                <h1 style={{ marginBottom: '2rem', borderBottom: '2px solid #9333ea', display: 'inline-block' }}>Shipping Policy</h1>

                <section style={{ marginBottom: '2rem' }}>
                    <h3 style={{ color: 'var(--neon-blue)', marginBottom: '1rem' }}>1. Order Processing</h3>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                        All orders are processed within <strong>1-2 business days</strong>. Orders are not shipped or delivered on weekends or holidays.
                        If we are experiencing a high volume of orders, shipments may be delayed by a few days. Please allow additional days in transit for delivery.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h3 style={{ color: 'var(--neon-blue)', marginBottom: '1rem' }}>2. Shipping Rates & Delivery Estimates</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                        Shipping charges for your order will be calculated and displayed at checkout.
                    </p>
                    <ul style={{ color: 'var(--text-secondary)', paddingLeft: '20px', lineHeight: '1.8' }}>
                        <li><strong>Standard Shipping:</strong> 5-7 Business Days - Free for orders over ₹999.</li>
                        <li><strong>Express Shipping:</strong> 2-3 Business Days - ₹150.</li>
                        <li><strong>Same Day Delivery:</strong> Available for select pin codes in Metro cities - ₹250.</li>
                    </ul>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h3 style={{ color: 'var(--neon-blue)', marginBottom: '1rem' }}>3. Shipment Confirmation & Order Tracking</h3>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                        You will receive a Shipment Confirmation email once your order has shipped containing your tracking number(s).
                        The tracking number will be active within 24 hours.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h3 style={{ color: 'var(--neon-blue)', marginBottom: '1rem' }}>4. Damages</h3>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                        We are not liable for any products damaged or lost during shipping. If you received your order damaged, please contact the shipment carrier to file a claim.
                        Please save all packaging materials and damaged goods before filing a claim.
                    </p>
                </section>

                <section>
                    <h3 style={{ color: 'var(--neon-blue)', marginBottom: '1rem' }}>5. International Shipping</h3>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                        We currently do not ship outside of India.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default ShippingPolicy;
