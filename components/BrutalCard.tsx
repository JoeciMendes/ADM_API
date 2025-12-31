
import React from 'react';

interface BrutalCardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  variant?: 'dark' | 'orange' | 'cyan' | 'mustard' | 'grey';
  className?: string;
  footer?: string;
}

const BrutalCard: React.FC<BrutalCardProps> = ({ title, subtitle, children, variant = 'grey', className = '', footer }) => {
  const variantStyles = {
    dark: 'bg-stone-900 dark:bg-black text-white border-white',
    orange: 'bg-accent-orange text-white',
    cyan: 'bg-accent-cyan text-black',
    mustard: 'bg-primary text-black',
    grey: 'bg-gray-300 dark:bg-gray-700 text-black dark:text-white',
  };

  return (
    <div className={`border-4 border-black dark:border-white shadow-brutal p-6 flex flex-col justify-between min-h-[250px] ${variantStyles[variant]} ${className}`}>
      <div>
        {title && <h2 className="text-2xl font-bold uppercase leading-tight mb-1">{title}</h2>}
        {subtitle && (
          <p className={`text-sm font-mono border-l-2 pl-3 mb-6 ${variant === 'dark' ? 'border-primary text-gray-400' : 'border-black opacity-70'}`}>
            {subtitle}
          </p>
        )}
        <div className="flex-1">
          {children}
        </div>
      </div>
      {footer && (
        <p className="text-xs font-bold font-mono uppercase border-t-2 border-current pt-2 mt-4">
          {footer}
        </p>
      )}
    </div>
  );
};

export default BrutalCard;
