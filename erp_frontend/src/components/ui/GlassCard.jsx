import React from 'react';

const GlassCard = ({ children, className = '', hover = false }) => {
    const baseClasses = 'backdrop-blur-xl bg-white/80 border border-white/20 rounded-2xl shadow-premium';
    const hoverClasses = hover ? 'hover:shadow-premium-lg hover:scale-[1.02] transition-all duration-300' : '';
    
    return (
        <div className={`${baseClasses} ${hoverClasses} ${className}`}>
            {children}
        </div>
    );
};

export default GlassCard;