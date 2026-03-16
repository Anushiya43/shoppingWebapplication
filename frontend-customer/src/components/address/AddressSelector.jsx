import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import AddressCard from './AddressCard';
import AddressForm from './AddressForm';
import { getAddresses, createAddress } from '../../api/address';

const AddressSelector = ({ onAddressSelect, selectedId }) => {
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
      alert('Failed to save address');
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
            />
          ))}
          <button 
            onClick={() => setIsAdding(true)}
            className="text-amazon-blue text-sm hover:text-amazon-orange hover:underline flex items-center gap-1 mt-2"
          >
            <Plus size={16} /> Add a new address
          </button>
        </div>
      ) : (
        <div className="bg-gray-50 p-4 rounded border border-gray-200">
          <h4 className="font-bold text-sm mb-4">Add a new address</h4>
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
