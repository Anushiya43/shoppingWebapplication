import React from 'react';
import { MapPin } from 'lucide-react';

const AddressCard = ({ address, isSelected, onClick }) => {
  return (
    <div 
      className={`p-3 rounded border cursor-pointer transition-all ${isSelected ? 'border-amazon-orange bg-orange-50/30 ring-1 ring-amazon-orange' : 'border-gray-200 hover:border-gray-300'}`}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-1 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? 'border-amazon-orange' : 'border-gray-400'}`}>
          {isSelected && <div className="w-2 h-2 rounded-full bg-amazon-orange" />}
        </div>
        <div className="text-[13px]">
          <p className="font-bold">
            {address.fullName} 
            {address.label && (
              <span className="ml-2 px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded text-[10px] uppercase font-medium">
                {address.label}
              </span>
            )}
            {address.isDefault && (
              <span className="ml-1 px-1.5 py-0.5 bg-green-50 text-green-700 rounded text-[10px] uppercase font-medium">
                Default
              </span>
            )}
          </p>
          <p className="text-gray-600 truncate">
            {address.street}, {address.city}, {address.district}, {address.state} - {address.zipCode}
          </p>
          <p className="text-gray-500">Phone: {address.phoneNumber}</p>
        </div>
      </div>
    </div>
  );
};

export default AddressCard;
