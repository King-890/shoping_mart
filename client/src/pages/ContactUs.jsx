import React, { useState } from 'react';

const ContactUs = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [status, setStatus] = useState(null); // 'loading', 'success', 'error'
    const [statusMsg, setStatusMsg] = useState('');
    const [settings, setSettings] = useState({ phone: '+91 9508952676', email: 'shoppingmartgayaji@gmail.com' });

    React.useEffect(() => {
        const fetchSettings = async () => {
            // Keep default settings
        };
        fetchSettings();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');

        try {
            // Trigger Email Notification via Backend
            try {
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                await fetch(`${apiUrl}/api/notify/contact`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...formData })
                });
            } catch (notifyErr) {
                console.warn('Backend notification failed');
                throw new Error("Failed connecting to server");
            }

            setStatus('success');
            setStatusMsg('Message sent successfully! We will get back to you soon.');
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch (error) {
            console.error('Contact Error:', error);
            setStatus('error');
            setStatusMsg('Failed to send message: ' + error.message);
        }
    };

    return (
        <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '2rem', color: 'var(--text-primary)' }}>
            <div className="glass" style={{ padding: '2rem', borderRadius: '12px', maxWidth: '800px', margin: '0 auto', background: '#ffffff' }}>
                <h1 style={{ marginBottom: '1.5rem', display: 'inline-block', fontSize: '2rem', textAlign: 'center', width: '100%' }}>Contact <span className="text-gradient">Us</span></h1>

                <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '2rem', textAlign: 'center' }}>
                    Have questions about your order or our products? We're here to help.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    {/* Form Section */}
                    <div>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <input
                                id="contact-name"
                                type="text" name="name" placeholder="Your Name" required
                                value={formData.name} onChange={handleChange}
                                style={inputStyle}
                            />
                            <input
                                id="contact-email"
                                type="email" name="email" placeholder="Your Email" required
                                value={formData.email} onChange={handleChange}
                                style={inputStyle}
                            />
                            <input
                                id="contact-subject"
                                type="text" name="subject" placeholder="Subject"
                                value={formData.subject} onChange={handleChange}
                                style={inputStyle}
                            />
                            <textarea
                                id="contact-message"
                                name="message" placeholder="How can we help?" rows="5" required
                                value={formData.message} onChange={handleChange}
                                style={inputStyle}
                            ></textarea>

                            <button type="submit" className="btn-primary" disabled={status === 'loading'}>
                                {status === 'loading' ? 'Sending...' : 'Send Message'}
                            </button>

                            {statusMsg && (
                                <p style={{
                                    marginTop: '1rem',
                                    color: status === 'success' ? '#4ade80' : '#ef4444',
                                    textAlign: 'center'
                                }}>
                                    {statusMsg}
                                </p>
                            )}
                        </form>
                    </div>

                    {/* Info Section */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <InfoBox icon="📞" title="Phone Support" text="Mon-Sat 9am to 6pm">
                            <a href={`tel:${settings.phone}`} style={linkStyle}>{settings.phone}</a>
                        </InfoBox>
                        <InfoBox icon="✉️" title="Email Us" text="Get in touch via email">
                            <a href={`mailto:${settings.email}`} style={linkStyle}>{settings.email}</a>
                        </InfoBox>
                        <InfoBox icon="📍" title="Visit Us" text="Gaya ji Shopping Mart HQ, Gaya, Bihar, India" />
                    </div>
                </div>
            </div>
        </div>
    );
};

const InfoBox = ({ icon, title, text, children }) => (
    <div style={{
        background: '#f9fafb',
        padding: '1.5rem',
        borderRadius: '8px',
        border: '1px solid var(--glass-border)',
        textAlign: 'center'
    }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{icon}</div>
        <h3 style={{ marginBottom: '0.25rem', fontSize: '1.1rem', color: 'var(--text-primary)' }}>{title}</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>{text}</p>
        {children}
    </div>
);

const inputStyle = {
    background: '#ffffff',
    border: '1px solid #d1d5db',
    padding: '12px',
    borderRadius: '8px',
    color: 'var(--text-primary)',
    outline: 'none',
    width: '100%',
    fontFamily: 'var(--font-main)'
};

const linkStyle = {
    color: '#9333ea',
    fontWeight: 'bold',
    textDecoration: 'none'
};

export default ContactUs;
