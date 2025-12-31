
import React from 'react';

interface BrutalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  children: React.ReactNode;
}

const BrutalButton: React.FC<BrutalButtonProps> = ({ variant = 'primary', children, className = '', ...props }) => {
  const variantStyles = {
    primary: 'bg-primary text-black active:bg-yellow-500',
    secondary: 'bg-white dark:bg-zinc-800 text-black dark:text-white',
    danger: 'bg-retro-red text-white active:bg-red-700',
  };

  return (
    <button 
      className={`group relative focus:outline-none w-full ${className}`}
      {...props}
    >
      <span className="absolute inset-0 w-full h-full transition duration-200 ease-out transform translate-x-1 translate-y-1 bg-black group-hover:translate-x-0 group-hover:translate-y-0"></span>
      <span className="absolute inset-0 w-full h-full bg-black border-2 border-black"></span>
      <span className={`relative flex items-center justify-center w-full h-full py-4 px-6 text-xl font-black uppercase border-2 border-black transition-transform duration-200 transform -translate-x-1 -translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0 ${variantStyles[variant]}`}>
        {children}
      </span>
    </button>
  );
};

export default BrutalButton;
