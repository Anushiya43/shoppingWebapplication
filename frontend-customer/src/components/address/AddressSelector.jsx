import React, { useState, useEffect } from 'react';
import { useNotification } from '../../context/NotificationContext';
import { Plus } from 'lucide-react';
import AddressCard from './AddressCard';
import AddressForm from './AddressForm';
import { getAddresses, createAddress, deleteAddress } from '../../api/address';

const AddressSelector = ({ onAddressSelect, selectedId }) => {
  const { showNotification } = useNotification();
  const [addresses, setAddresses] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchAddresses = async () => {
    try {
      const res = await getAddresses();
      setAddresses(res.data);
      if (res.data.length === 0) setIsAdding(true);
    } catch (err) {
      console.error('Failed to fetch addresses', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleAddAddress = async (formData) => {
    try {
      const res = await createAddress(formData);
      setIsAdding(false);
      await fetchAddresses();
      onAddressSelect(res.data.id);
    } catch (err) {
      showNotification('Failed to save address', 'error');
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      await deleteAddress(addressId);
      await fetchAddresses();
      if (selectedId === addressId) {
        onAddressSelect(null);
      }
    } catch (err) {
      showNotification('Failed to remove address', 'error');
    }
  };

  if (loading) return <div className="text-sm text-gray-500">Loading addresses...</div>;

  return (
    <div className="space-y-4">
      {!isAdding ? (
        <div className="space-y-3">
          {addresses.map(addr => (
            <AddressCard 
              key={addr.id} 
              address={addr} 
              isSelected={selectedId === addr.id}
              onClick={() => onAddressSelect(addr.id)}
              onDelete={() => handleDeleteAddress(addr.id)}
            />
          ))}
          <button 
            onClick={() => setIsAdding(true)}
            className="text-accent-blue text-sm font-black hover:text-primary-900 transition-colors flex items-center gap-2 mt-4 px-1"
          >
            <Plus size={18} strokeWidth={3} /> Add New Shipping Destination
          </button>
        </div>
      ) : (
        <div className="bg-gray-50 p-6 rounded-[24px] border border-gray-100 shadow-inner">
          <h4 className="font-black text-primary-900 uppercase tracking-widest text-xs mb-6 px-1">Register New Address</h4>
          <AddressForm 
            onSubmit={handleAddAddress} 
            onCancel={addresses.length > 0 ? () => setIsAdding(false) : null}
          />
        </div>
      )}
    </div>
  );
};

export default AddressSelector;
