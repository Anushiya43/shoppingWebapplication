import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({ message, type = 'info', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle className="text-green-500" size={20} />,
    error: <AlertCircle className="text-red-600" size={20} />,
    warning: <AlertCircle className="text-amber-500" size={20} />,
    info: <Info className="text-blue-500" size={20} />
  };

  const bgColors = {
    success: 'bg-white',
    error: 'bg-white',
    warning: 'bg-white',
    info: 'bg-white'
  };

  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[1000] animate-in slide-in-from-top-10 fade-in duration-500">
      <div className={`flex items-center gap-4 px-6 py-4 rounded-2xl border-2 border-red-500 shadow-[0_20px_50px_rgba(239,68,68,0.3)] ${bgColors[type]} min-w-[320px] max-w-md`}>
        <div className="shrink-0 scale-110">{icons[type]}</div>
        <p className="text-[15px] font-black text-primary-900 leading-tight flex-1">{message}</p>
        <button 
          onClick={onClose}
          className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-red-500"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default Toast;
