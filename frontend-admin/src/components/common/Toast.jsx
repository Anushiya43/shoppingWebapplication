import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X, ShieldCheck, ShieldAlert } from 'lucide-react';

const Toast = ({ message, type = 'info', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      shadow: 'shadow-emerald-500/20',
      text: 'text-emerald-900',
      icon: <CheckCircle className="text-emerald-500" size={20} />
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      shadow: 'shadow-red-500/20',
      text: 'text-red-900',
      icon: <AlertCircle className="text-red-500" size={20} />
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      shadow: 'shadow-amber-500/20',
      text: 'text-amber-900',
      icon: <AlertCircle className="text-amber-500" size={20} />
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      shadow: 'shadow-blue-500/20',
      text: 'text-blue-900',
      icon: <Info className="text-blue-500" size={20} />
    }
  };

  const style = colors[type] || colors.info;

  return (
    <div className="fixed top-6 right-6 z-[2000] animate-in slide-in-from-right-10 fade-in duration-500">
      <div className={`flex items-center gap-4 px-6 py-4 rounded-2xl border ${style.border} shadow-2xl ${style.shadow} ${style.bg} min-w-[320px] max-w-md backdrop-blur-md`}>
        <div className="shrink-0 scale-110">{style.icon}</div>
        <p className={`text-[15px] font-black ${style.text} leading-tight flex-1`}>{message}</p>
        <button 
          onClick={onClose}
          className="p-1.5 hover:bg-white/50 rounded-full transition-colors text-gray-400 hover:text-primary-900"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default Toast;
