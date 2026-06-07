import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { API_URL } from '../config/api';

const Login = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password
                })
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Invalid email or password');
            }

            showToast('Login Successful! Welcome back. ✨');

            const userSession = {
                id: data.user._id,
                email: data.user.email,
                role: data.user.role,
                firstName: data.user.firstName || '',
                lastName: data.user.lastName || '',
                address: data.user.address || {}
            };

            localStorage.setItem('user', JSON.stringify(userSession));
            navigate('/');
        } catch (error) {
            console.error('Login Error:', error);
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
                maxWidth: '420px',
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
                        Gaya ji Shopping Mart
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>Please enter your details to sign in.</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.2rem' }}>
                        <label htmlFor="login-email" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: '600' }}>Email Address</label>
                        <input
                            id="login-email"
                            name="email"
                            type="email"
                            required
                            autoComplete="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="name@example.com"
                            className="input-focus-effect"
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                background: '#ffffff',
                                border: '1px solid rgba(0, 0, 0, 0.12)',
                                color: 'var(--text-primary)',
                                borderRadius: '6px',
                                outline: 'none',
                                transition: 'all 0.2s ease',
                                fontSize: '0.88rem'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <label htmlFor="login-password" style={{ display: 'block', color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: '600' }}>Password</label>
                            <Link to="/forgot-password" style={{ color: 'var(--text-primary)', fontSize: '0.8rem', textDecoration: 'underline' }}>Forgot password?</Link>
                        </div>
                        <div style={{ position: 'relative' }}>
                            <input
                                id="login-password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                required
                                autoComplete="current-password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className="input-focus-effect"
                                style={{
                                    width: '100%',
                                    padding: '10px 40px 10px 12px',
                                    background: '#ffffff',
                                    border: '1px solid rgba(0, 0, 0, 0.12)',
                                    color: 'var(--text-primary)',
                                    borderRadius: '6px',
                                    outline: 'none',
                                    transition: 'all 0.2s ease',
                                    fontSize: '0.88rem'
                                }}
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
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                {showPassword ? (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                        <line x1="1" y1="1" x2="23" y2="23"></line>
                                    </svg>
                                ) : (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                        <circle cx="12" cy="12" r="3"></circle>
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <button
                        className="btn-primary"
                        type="submit"
                        style={{
                            width: '100%',
                            padding: '12px',
                            fontSize: '0.88rem',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '8px',
                            borderRadius: '6px',
                            fontWeight: '600'
                        }}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span style={{ animation: 'spin 1s linear infinite', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', width: '14px', height: '14px', display: 'inline-block' }}></span>
                                Signing In...
                            </>
                        ) : (
                            <>
                                Sign In <span>→</span>
                            </>
                        )}
                    </button>

                    <p style={{ marginTop: '1.8rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '1.8rem 0 0 0' }}>
                        Don't have an account? <Link to="/signup" style={{ color: 'var(--text-primary)', fontWeight: '700', textDecoration: 'underline', marginLeft: '5px' }}>Sign Up</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;
