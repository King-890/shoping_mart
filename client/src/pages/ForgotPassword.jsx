import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleReset = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            await new Promise(resolve => setTimeout(resolve, 800));
            setMessage('Check your email for the password reset link! 📧 (Firebase Disabled)');
        } catch (error) {
            console.error('Reset Error:', error);
            alert(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{
            minHeight: '80vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: '2.5rem'
        }}>
            <div className="glass" style={{ padding: '3rem', borderRadius: '16px', width: '100%', maxWidth: '400px', background: '#ffffff' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--text-primary)' }}>Reset Password</h2>

                {message ? (
                    <div style={{ textAlign: 'center', color: '#9333ea', marginBottom: '1.5rem' }}>
                        {message}
                        <div style={{ marginTop: '1.5rem' }}>
                            <Link to="/login" className="btn-primary" style={{ textDecoration: 'none' }}>Back to Login</Link>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleReset}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Email Address</label>
                            <input
                                id="forgot-password-email"
                                name="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    background: '#ffffff',
                                    border: '1px solid #d1d5db',
                                    color: 'var(--text-primary)',
                                    borderRadius: '8px',
                                    outline: 'none'
                                }}
                                placeholder="name@example.com"
                            />
                        </div>
                        <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%' }}>
                            {loading ? 'Sending link...' : 'Send Reset Link'}
                        </button>
                        <p style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                            <Link to="/login" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Back to Login</Link>
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
