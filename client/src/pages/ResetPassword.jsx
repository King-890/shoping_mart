import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ResetPassword = () => {
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        const urlParams = new URLSearchParams(window.location.search);
        const oobCode = urlParams.get('oobCode');

        if (!oobCode) {
            alert("Invalid or expired reset link. Please request a new one.");
            navigate('/forgot-password');
            return;
        }

        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 800));
            alert('Password updated successfully! please login. ✅ (Firebase Disabled)');
            navigate('/login');
        } catch (error) {
            console.error('Update password error:', error);
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
                <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--text-primary)' }}>New Password</h2>

                <form onSubmit={handleUpdate}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>New Password</label>
                        <div style={{ position: 'relative' }}>
                             <input
                                id="reset-new-password"
                                name="new_password"
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px 45px 12px 12px',
                                    background: '#ffffff',
                                    border: '1px solid #d1d5db',
                                    color: 'var(--text-primary)',
                                    borderRadius: '8px',
                                    outline: 'none'
                                }}
                                placeholder="••••••••"
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
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Confirm Password</label>
                        <input
                            id="reset-confirm-password"
                            name="confirm_password"
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: '#ffffff',
                                border: '1px solid #d1d5db',
                                color: 'var(--text-primary)',
                                borderRadius: '8px',
                                outline: 'none'
                            }}
                            placeholder="••••••••"
                        />
                    </div>

                    <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%' }}>
                        {loading ? 'Updating...' : 'Update Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
