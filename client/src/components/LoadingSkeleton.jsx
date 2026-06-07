import React from 'react';

const LoadingSkeleton = () => {
    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '2rem',
            width: '100%'
        }}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="glass" style={{
                    height: '400px',
                    borderRadius: '12px',
                    position: 'relative',
                    overflow: 'hidden',
                    background: 'rgba(255, 255, 255, 0.02)'
                }}>
                    <div className="skeleton-pulse" style={{ height: '200px', background: 'rgba(0, 243, 255, 0.05)', marginBottom: '1rem' }}></div>
                    <div style={{ padding: '1.5rem' }}>
                        <div className="skeleton-pulse" style={{ height: '24px', width: '70%', background: 'rgba(255, 255, 255, 0.05)', marginBottom: '1rem', borderRadius: '4px' }}></div>
                        <div className="skeleton-pulse" style={{ height: '16px', width: '90%', background: 'rgba(255, 255, 255, 0.03)', marginBottom: '0.5rem', borderRadius: '4px' }}></div>
                        <div className="skeleton-pulse" style={{ height: '16px', width: '50%', background: 'rgba(255, 255, 255, 0.03)', marginBottom: '2rem', borderRadius: '4px' }}></div>
                        <div className="skeleton-pulse" style={{ height: '40px', width: '100%', background: 'rgba(0, 243, 255, 0.1)', borderRadius: '8px' }}></div>
                    </div>
                </div>
            ))}
            <style>
                {`
                @keyframes skeletonPulse {
                    0% { opacity: 0.5; }
                    50% { opacity: 1; }
                    100% { opacity: 0.5; }
                }
                .skeleton-pulse {
                    animation: skeletonPulse 1.5s infinite ease-in-out;
                }
                `}
            </style>
        </div>
    );
};

export default LoadingSkeleton;
