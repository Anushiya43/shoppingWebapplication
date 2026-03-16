import React, { useState, useEffect } from 'react';
import { STATES, getDistricts } from '../../utils/geography';

const AddressForm = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState(initialData || {
    fullName: '',
    phoneNumber: '',
    street: '',
    city: '',
    district: '',
    state: '',
    zipCode: '',
    label: 'Home',
    isDefault: false
  });

  const [localDistricts, setLocalDistricts] = useState([]);
  const [isOtherState, setIsOtherState] = useState(false);
  const [isOtherDistrict, setIsOtherDistrict] = useState(false);
  const [manualState, setManualState] = useState('');
  const [manualDistrict, setManualDistrict] = useState('');

  useEffect(() => {
    if (formData.state && formData.state !== 'OTHER') {
      setLocalDistricts(getDistricts(formData.state));
      setIsOtherState(false);
    } else if (formData.state === 'OTHER') {
      setIsOtherState(true);
      setLocalDistricts([]);
    }
  }, [formData.state]);

  useEffect(() => {
    if (formData.district === 'OTHER') {
      setIsOtherDistrict(true);
    } else if (formData.district && formData.district !== 'OTHER') {
      setIsOtherDistrict(false);
    }
  }, [formData.district]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate
    if (!formData.fullName || !formData.phoneNumber || !formData.street || !formData.city || !formData.zipCode) {
      alert('Please fill in all required fields');
      return;
    }

    const finalState = isOtherState ? manualState : formData.state;
    const finalDistrict = (isOtherState || isOtherDistrict) ? manualDistrict : formData.district;

    if (!finalState || !finalDistrict) {
      alert('Please specify both State and District');
      return;
    }

    onSubmit({
      ...formData,
      state: finalState,
      district: finalDistrict
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <div className="grid grid-cols-1 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-700">Full name</label>
          <input
            type="text"
            placeholder="Recipient's name"
            className="w-full px-3 py-1.5 border border-gray-300 rounded focus:border-amazon-orange focus:shadow-amazon-outline outline-none text-[13px]"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-700">Mobile number</label>
          <div className="flex">
            <div className="px-3 py-1.5 bg-gray-100 border border-gray-300 border-r-0 rounded-l text-[13px] text-gray-500 font-medium">+91</div>
            <input
              type="tel"
              placeholder="10-digit number"
              maxLength={10}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-r focus:border-amazon-orange focus:shadow-amazon-outline outline-none text-[13px]"
              value={formData.phoneNumber.replace('+91', '')}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                setFormData({ ...formData, phoneNumber: val ? `+91${val}` : '' });
              }}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-700">Street address</label>
          <input
            type="text"
            placeholder="Flat, House no., Building, Company, Apartment"
            className="w-full px-3 py-1.5 border border-gray-300 rounded focus:border-amazon-orange focus:shadow-amazon-outline outline-none text-[13px]"
            value={formData.street}
            onChange={(e) => setFormData({ ...formData, street: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700">Town/City</label>
            <input
              type="text"
              placeholder="City"
              className="w-full px-3 py-1.5 border border-gray-300 rounded focus:border-amazon-orange focus:shadow-amazon-outline outline-none text-[13px]"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700">Pincode</label>
            <input
              type="text"
              placeholder="6 digits"
              maxLength={6}
              className="w-full px-3 py-1.5 border border-gray-300 rounded focus:border-amazon-orange focus:shadow-amazon-outline outline-none text-[13px]"
              value={formData.zipCode}
              onChange={(e) => setFormData({ ...formData, zipCode: e.target.value.replace(/\D/g, '') })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700">State</label>
            {isOtherState ? (
              <div className="flex flex-col gap-1">
                <input
                  type="text"
                  placeholder="Enter state"
                  className="w-full px-3 py-1.5 border border-gray-300 rounded focus:border-amazon-orange focus:shadow-amazon-outline outline-none text-[13px]"
                  value={manualState}
                  onChange={(e) => setManualState(e.target.value)}
                />
                <button type="button" onClick={() => { setIsOtherState(false); setFormData({...formData, state: ''}) }} className="text-amazon-blue text-[10px] text-left hover:underline">Select from list</button>
              </div>
            ) : (
              <select
                className="w-full px-3 py-1.5 border border-gray-300 rounded focus:border-amazon-orange focus:shadow-amazon-outline outline-none text-[13px] bg-white"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              >
                <option value="">Choose a state</option>
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                <option value="OTHER">Other (Manual Entry)</option>
              </select>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700">District</label>
            {isOtherState || isOtherDistrict ? (
              <div className="flex flex-col gap-1">
                <input
                  type="text"
                  placeholder="Enter district"
                  className="w-full px-3 py-1.5 border border-gray-300 rounded focus:border-amazon-orange focus:shadow-amazon-outline outline-none text-[13px]"
                  value={manualDistrict}
                  onChange={(e) => setManualDistrict(e.target.value)}
                />
                {!isOtherState && (
                  <button type="button" onClick={() => { setIsOtherDistrict(false); setFormData({...formData, district: ''}) }} className="text-amazon-blue text-[10px] text-left hover:underline">Select from list</button>
                )}
              </div>
            ) : (
              <select
                disabled={!formData.state}
                className="w-full px-3 py-1.5 border border-gray-300 rounded focus:border-amazon-orange focus:shadow-amazon-outline outline-none text-[13px] bg-white disabled:bg-gray-50"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
              >
                <option value="">Select district</option>
                {localDistricts.map(d => <option key={d} value={d}>{d}</option>)}
                <option value="OTHER">Other</option>
              </select>
            )}
          </div>
        </div>

        <div className="flex gap-4 pt-2">
          {['Home', 'Work'].map(lbl => (
            <div key={lbl} className="flex items-center gap-2">
              <input 
                type="radio" 
                id={`label-${lbl}`} 
                name="label" 
                checked={formData.label === lbl} 
                onChange={() => setFormData({...formData, label: lbl})}
              />
              <label htmlFor={`label-${lbl}`} className="text-xs">{lbl}</label>
            </div>
          ))}
        </div>

        <div className="flex gap-3 pt-4">
          <button type="submit" className="px-4 py-1.5 bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] rounded text-xs font-medium">
            Save Address
          </button>
          {onCancel && (
            <button type="button" onClick={onCancel} className="px-4 py-1.5 bg-white border border-gray-300 rounded text-xs font-medium hover:bg-gray-50">
              Cancel
            </button>
          )}
        </div>
      </div>
    </form>
  );
};

export default AddressForm;
