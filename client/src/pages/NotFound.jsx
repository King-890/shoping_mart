import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div className="container tech-scanner" style={{
            paddingTop: '2.5rem',
            textAlign: 'center',
            minHeight: '80vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            <h1 className="text-gradient" style={{ fontSize: '8rem', marginBottom: '0', letterSpacing: '10px' }}>404</h1>
            <div style={{
                background: 'var(--neon-blue)',
                height: '2px',
                width: '100px',
                margin: '1rem auto',
                boxShadow: '0 0 10px var(--neon-blue)'
            }}></div>
            <h2 style={{ color: 'var(--text-primary)', marginBottom: '1.5rem' }}>Page Not Found</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', marginBottom: '2.5rem', lineHeight: '1.6' }}>
                The page you are looking for does not exist or has been moved in the Gaya ji Shopping Mart store.
            </p>
            <Link to="/" className="btn-primary" style={{
                textDecoration: 'none',
                padding: '12px 40px',
                borderRadius: '6px'
            }}>
                Return to Home
            </Link>
        </div>
    );
};

export default NotFound;
