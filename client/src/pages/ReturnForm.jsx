import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import API_URL from '../config/api';

const ReturnForm = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [status, setStatus] = useState(null); // 'loading', 'success', 'error'
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        orderNumber: '',
        phoneNumber: '',
        productName: '',
        reason: '',
        details: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');

        try {
            const res = await fetch(`${API_URL}/api/notify/return`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!res.ok) throw new Error('Submission failed');

            setStatus('success');
            showToast('Return request submitted successfully! 📦', 'success');
            setFormData({
                name: '',
                email: '',
                orderNumber: '',
                phoneNumber: '',
                productName: '',
                reason: '',
                details: ''
            });
            setTimeout(() => {
                navigate('/');
            }, 3000);
        } catch (err) {
            console.error(err);
            setStatus('error');
            showToast('Failed to submit return request. Please try again.', 'error');
        }
    };

    return (
        <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem', color: 'var(--text-primary)' }}>
            <div className="glass" style={{
                padding: '3rem',
                borderRadius: '16px',
                maxWidth: '700px',
                margin: '0 auto',
                background: '#f8fafc' // Soft light greyish blue matches the screenshot background
            }}>
                <h1 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem' }}>Return or Exchange Request</h1>
                <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2.5rem' }}>
                    Please fill out the form below to initiate your return or exchange
                </p>

                {status === 'success' ? (
                    <div style={{ textAlign: 'center', padding: '2rem', background: '#d1fae5', color: '#065f46', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
                        <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '1rem' }}>✅</span>
                        <h3 style={{ marginBottom: '0.5rem', color: '#065f46' }}>Request Received!</h3>
                        <p style={{ margin: 0, fontSize: '0.9rem' }}>We will contact you shortly via email or phone to guide you through the next steps. Redirecting to Home...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label htmlFor="name" style={labelStyle}>Name <span style={{ color: '#ef4444' }}>*</span></label>
                                <input
                                    id="name"
                                    type="text" name="name" required
                                    value={formData.name} onChange={handleChange}
                                    style={inputStyle}
                                />
                            </div>
                            <div>
                                <label htmlFor="email" style={labelStyle}>Email <span style={{ color: '#ef4444' }}>*</span></label>
                                <input
                                    id="email"
                                    type="email" name="email" required
                                    value={formData.email} onChange={handleChange}
                                    style={inputStyle}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label htmlFor="orderNumber" style={labelStyle}>Order number <span style={{ color: '#ef4444' }}>*</span></label>
                                <input
                                    id="orderNumber"
                                    type="text" name="orderNumber" required
                                    value={formData.orderNumber} onChange={handleChange}
                                    style={inputStyle}
                                />
                            </div>
                            <div>
                                <label htmlFor="phoneNumber" style={labelStyle}>Phone number <span style={{ color: '#ef4444' }}>*</span></label>
                                <input
                                    id="phoneNumber"
                                    type="tel" name="phoneNumber" required
                                    value={formData.phoneNumber} onChange={handleChange}
                                    style={inputStyle}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="productName" style={labelStyle}>Product name <span style={{ color: '#ef4444' }}>*</span></label>
                            <input
                                id="productName"
                                type="text" name="productName" required
                                value={formData.productName} onChange={handleChange}
                                style={inputStyle}
                            />
                        </div>

                        <div>
                            <label htmlFor="reason" style={labelStyle}>Reason for return <span style={{ color: '#ef4444' }}>*</span></label>
                            <select
                                id="reason"
                                name="reason" required
                                value={formData.reason} onChange={handleChange}
                                style={inputStyle}
                            >
                                <option value="">Select a reason</option>
                                <option value="Defective / does not work">Defective / does not work</option>
                                <option value="Wrong item sent">Wrong item sent</option>
                                <option value="Item damaged on arrival">Item damaged on arrival</option>
                                <option value="No longer wanted / change of mind">No longer wanted / change of mind</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="details" style={labelStyle}>Additional details <span style={{ color: '#ef4444' }}>*</span></label>
                            <textarea
                                id="details"
                                name="details" required rows="4"
                                value={formData.details} onChange={handleChange}
                                style={{ ...inputStyle, resize: 'vertical' }}
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className="btn-primary"
                            style={{
                                width: '100%',
                                padding: '14px',
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                fontWeight: '700',
                                marginTop: '1rem',
                                borderRadius: '6px'
                            }}
                        >
                            {status === 'loading' ? 'Submitting Request...' : 'Submit Request'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

const labelStyle = {
    display: 'block',
    marginBottom: '0.4rem',
    fontWeight: '600',
    fontSize: '0.82rem',
    color: 'var(--text-primary)'
};

const inputStyle = {
    width: '100%',
    padding: '11px 14px',
    background: '#ffffff',
    border: '1px solid rgba(0,0,0,0.15)',
    borderRadius: '6px',
    color: 'var(--text-primary)',
    outline: 'none',
    fontSize: '0.9rem',
    fontFamily: 'var(--font-main)'
};

export default ReturnForm;
