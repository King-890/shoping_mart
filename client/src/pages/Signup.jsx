import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { API_URL } from '../config/api';

const Signup = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password.length < 6) {
            showToast("Security Violation: Password must be at least 6 tokens.", "error");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            showToast("Identity Mismatch: Passwords do not correlate.", "error");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    firstName: formData.firstName,
                    lastName: formData.lastName
                })
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            showToast('Registration Successful! 🎉 Please log in.');
            navigate('/login');
        } catch (error) {
            console.error('Signup Error:', error);
            showToast(error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{
            paddingTop: '2.5rem',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden',
            background: '#f1f3f6'
        }}>
            <Link to="/" style={{
                position: 'absolute', top: '160px', left: '2rem',
                color: 'var(--text-primary)', zIndex: 10, textDecoration: 'none',
                display: 'flex', alignItems: 'center', gap: '8px',
                fontSize: '0.85rem', fontWeight: '600'
            }}>
                ← BACK TO STORE
            </Link>

            <div style={{
                padding: '3rem 2.5rem',
                borderRadius: '12px',
                width: '100%',
                maxWidth: '450px',
                position: 'relative',
                zIndex: 1,
                border: '1px solid rgba(0,0,0,0.06)',
                background: '#ffffff',
                boxShadow: '0 8px 24px rgba(0,0,0,0.03)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{
                        fontSize: '2rem',
                        fontWeight: '800',
                        color: 'var(--text-primary)',
                        marginBottom: '0.4rem',
                        letterSpacing: '-0.02em'
                    }}>
                        Gaya ji Shopping mart
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>Create your account to start shopping.</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.2rem' }}>
                        <div>
                            <label htmlFor="signup-firstName" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: '600' }}>First Name</label>
                            <input
                                id="signup-firstName"
                                name="firstName"
                                type="text"
                                required
                                autoComplete="given-name"
                                value={formData.firstName}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '10px 12px', background: '#ffffff', border: '1px solid rgba(0, 0, 0, 0.12)', color: 'var(--text-primary)', borderRadius: '6px', outline: 'none', fontSize: '0.88rem' }}
                                className="input-focus-effect"
                            />
                        </div>
                        <div>
                            <label htmlFor="signup-lastName" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: '600' }}>Last Name</label>
                            <input
                                id="signup-lastName"
                                name="lastName"
                                type="text"
                                required
                                autoComplete="family-name"
                                value={formData.lastName}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '10px 12px', background: '#ffffff', border: '1px solid rgba(0, 0, 0, 0.12)', color: 'var(--text-primary)', borderRadius: '6px', outline: 'none', fontSize: '0.88rem' }}
                                className="input-focus-effect"
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.2rem' }}>
                        <label htmlFor="signup-email" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: '600' }}>Email</label>
                        <input
                            id="signup-email"
                            name="email"
                            type="email"
                            required
                            autoComplete="email"
                            value={formData.email}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '10px 12px', background: '#ffffff', border: '1px solid rgba(0, 0, 0, 0.12)', color: 'var(--text-primary)', borderRadius: '6px', outline: 'none', fontSize: '0.88rem' }}
                            className="input-focus-effect"
                        />
                    </div>

                    <div style={{ marginBottom: '1.2rem' }}>
                        <label htmlFor="signup-password" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: '600' }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                id="signup-password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                required
                                autoComplete="new-password"
                                value={formData.password}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '10px 40px 10px 12px', background: '#ffffff', border: '1px solid rgba(0, 0, 0, 0.12)', color: 'var(--text-primary)', borderRadius: '6px', outline: 'none', fontSize: '0.88rem' }}
                                className="input-focus-effect"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--text-secondary)',
                                    cursor: 'pointer',
                                    padding: '0',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                {showPassword ? (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                                ) : (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <label htmlFor="signup-confirmPassword" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: '600' }}>Confirm Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                id="signup-confirmPassword"
                                name="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                required
                                autoComplete="new-password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="••••••••"
                                style={{ width: '100%', padding: '10px 40px 10px 12px', background: '#ffffff', border: '1px solid rgba(0, 0, 0, 0.12)', color: 'var(--text-primary)', borderRadius: '6px', outline: 'none', fontSize: '0.88rem' }}
                                className="input-focus-effect"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--text-secondary)',
                                    cursor: 'pointer',
                                    padding: '0',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                {showConfirmPassword ? (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                                ) : (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <button className="btn-primary" type="submit" style={{ width: '100%', padding: '12px', fontSize: '0.88rem', borderRadius: '6px', fontWeight: '600' }} disabled={loading}>
                        {loading ? 'Registering...' : 'Sign Up'}
                    </button>

                    <p style={{ marginTop: '1.5rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '1.5rem 0 0 0' }}>
                        Already have an account? <Link to="/login" style={{ color: 'var(--text-primary)', fontWeight: '700', textDecoration: 'underline', marginLeft: '5px' }}>Login</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Signup;
