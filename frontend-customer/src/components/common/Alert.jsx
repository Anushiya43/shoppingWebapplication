import React from 'react';
import { ShieldAlert, X } from 'lucide-react';

const Alert = ({ title, children, variant = 'error' }) => {
  const styles = {
    error: 'border-red-400 bg-white text-red-700',
    warning: 'border-amber-400 bg-white text-amber-700',
    info: 'border-blue-400 bg-white text-blue-700'
  };

  return (
    <div className={`p-3 border rounded-[4px] text-[13px] flex items-start gap-2 ${styles[variant]}`}>
      <ShieldAlert size={16} className="mt-0.5 shrink-0" />
      <div>
        {title && <div className="font-bold">{title}</div>}
        <p>{children}</p>
      </div>
    </div>
  );
};

export default Alert;
