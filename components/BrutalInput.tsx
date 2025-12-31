
import React from 'react';

interface BrutalInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: string;
}

const BrutalInput: React.FC<BrutalInputProps> = ({ label, icon, className = '', ...props }) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-bold uppercase text-black dark:text-gray-300">
          {label}
        </label>
      )}
      <div className="relative group">
        <input 
          className="block w-full bg-gray-200 dark:bg-zinc-900 border-2 border-black dark:border-gray-500 text-black dark:text-white px-4 py-3 focus:outline-none focus:border-primary focus:ring-0 placeholder-gray-500 transition-colors shadow-brutal-sm focus:shadow-brutal focus:-translate-y-0.5 focus:-translate-x-0.5"
          {...props}
        />
        {icon && (
          <div className="absolute right-3 top-3 text-black dark:text-gray-400">
            <span className="material-icons text-lg">{icon}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrutalInput;
