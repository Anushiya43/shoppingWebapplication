import React from 'react';
import { Trash2 } from 'lucide-react';

const AddressCard = ({ address, isSelected, onClick, onDelete }) => {
  return (
    <div 
      className={`p-4 rounded-2xl border-2 transition-all relative group cursor-pointer ${isSelected ? 'border-accent-blue bg-indigo-50/30 ring-4 ring-accent-blue/5' : 'border-gray-100 hover:border-accent-blue/30 bg-white'}`}
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        <div className={`mt-1.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'border-accent-blue' : 'border-gray-200'}`}>
          {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-accent-blue animate-pulse-slow" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <p className="font-black text-primary-900 text-sm">{address.fullName}</p>
            {address.label && (
              <span className="px-2 py-0.5 bg-primary-900 text-white rounded-lg text-[9px] uppercase font-black tracking-widest">
                {address.label}
              </span>
            )}
            {address.isDefault && (
              <span className="px-2 py-0.5 bg-accent-cyan/10 text-accent-blue rounded-lg text-[9px] uppercase font-black tracking-widest border border-accent-cyan/20">
                Primary
              </span>
            )}
          </div>
          <p className="text-text-muted text-[13px] font-medium leading-relaxed break-words">
            {address.street}, {address.city}, {address.district}, {address.state} - {address.zipCode}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-primary-900/40 font-bold text-[11px]">
            <span className="uppercase tracking-tighter opacity-50">CONTACT:</span>
            <span>{address.phoneNumber}</span>
          </div>
        </div>
      </div>

      {onDelete && (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            if (window.confirm('Are you sure you want to remove this address?')) {
              onDelete(address.id);
            }
          }}
          className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all ml-auto self-start"
          title="Remove address"
        >
          <Trash2 size={16} />
        </button>
      )}
    </div>
  );
};

export default AddressCard;
