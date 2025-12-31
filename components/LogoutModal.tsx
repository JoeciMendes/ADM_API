
import React from 'react';
import BrutalButton from './BrutalButton';

interface LogoutModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

const LogoutModal: React.FC<LogoutModalProps> = ({ onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel}></div>
      
      {/* Modal Content */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-surface-light dark:bg-zinc-800 border-4 border-black dark:border-white shadow-brutal p-8 flex flex-col items-center text-center">
          {/* Decorative Corner Dots */}
          <div className="absolute top-3 left-3 w-2 h-2 rounded-full border border-black bg-gray-400"></div>
          <div className="absolute top-3 right-3 w-2 h-2 rounded-full border border-black bg-gray-400"></div>
          <div className="absolute bottom-3 left-3 w-2 h-2 rounded-full border border-black bg-gray-400"></div>
          <div className="absolute bottom-3 right-3 w-2 h-2 rounded-full border border-black bg-gray-400"></div>
          
          <h2 className="text-3xl font-bold text-black dark:text-white uppercase tracking-tighter mb-2 border-b-4 border-black dark:border-white pb-2 px-4 w-full">
            SAIR AGORA
          </h2>
          
          <p className="text-sm text-zinc-700 dark:text-zinc-300 mt-6 mb-8 font-bold tracking-tight max-w-xs leading-relaxed uppercase">
            Você confirma e atenta agora sessões. Tem certeza que deseja encerrar?
          </p>
          
          <BrutalButton variant="danger" onClick={onConfirm} className="mb-4">
            SAIR AGORA
          </BrutalButton>
          
          <button 
            onClick={onCancel}
            className="text-xs font-bold text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white underline decoration-2 underline-offset-4 uppercase tracking-widest mt-2"
          >
            CANCELAR E VOLTAR
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;
