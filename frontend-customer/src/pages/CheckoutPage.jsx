import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, ArrowLeft, ShieldAlert, CreditCard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import AddressSelector from '../components/address/AddressSelector';

const CheckoutPage = () => {
  const { user } = useAuth();
  const { cart, cartCount, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [isPlacing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  if (!user) return null;

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      alert('Please select or add a delivery address');
      return;
    }

    setPlacing(true);
    try {
      const { createOrder } = await import('../api/orders');
      const { getAddresses } = await import('../api/address');
      
      const addrRes = await getAddresses();
      const selected = addrRes.data.find(a => a.id === selectedAddressId);
      
      if (!selected) {
        alert('Selected address not found');
        return;
      }

      const formattedAddress = `${selected.fullName}, ${selected.phoneNumber}, ${selected.street}, ${selected.city}, ${selected.district}, ${selected.state} - ${selected.zipCode}, India`;
      
      await createOrder({ shippingAddress: formattedAddress });
      setPlaced(true);
      await clearCart();
      setTimeout(() => navigate('/orders'), 3000);
    } catch (err) {
      alert('Failed to place order: ' + (err.response?.data?.message || 'Unknown error'));
    } finally {
      setPlacing(false);
    }
  };

  if (placed) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <CheckCircle2 size={64} className="text-green-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Order placed, thank you!</h1>
        <p className="text-gray-600 text-center mb-6">Confirmation will be sent to your email shortly.</p>
        <button onClick={() => navigate('/orders')} className="text-amazon-blue hover:underline">Go to your orders</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EAEDED] font-sans">
      <header className="bg-amazon-navy-900 text-white p-4 h-16 flex items-center justify-between lg:justify-center relative">
        <button 
          onClick={() => navigate(-1)} 
          className="p-1 hover:bg-white/10 rounded-full transition-colors lg:hidden mr-auto"
          aria-label="Go back"
        >
          <ArrowLeft size={24} />
        </button>
        <Link to="/" className="text-xl font-bold absolute left-1/2 -translate-x-1/2 lg:static lg:transform-none">amazon<span className="text-amazon-orange text-[10px] italic">.in</span></Link>
        <div className="text-gray-400 ml-auto lg:absolute lg:right-4">
          <ShieldAlert size={20} />
        </div>
      </header>

      <main className="max-w-[1100px] mx-auto p-4 md:p-8">
        <h1 className="text-2xl font-normal text-amazon-text mb-6">Checkout ({cartCount} item{cartCount !== 1 ? 's' : ''})</h1>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-6">
          <div className="space-y-4">
            {/* Delivery Address */}
            <div className="bg-white p-5 rounded border border-gray-300">
              <div className="flex flex-col md:flex-row gap-4 md:gap-10">
                <span className="font-bold w-40 text-sm shrink-0">1. Delivery address</span>
                <div className="flex-1">
                  <AddressSelector 
                    selectedId={selectedAddressId} 
                    onAddressSelect={setSelectedAddressId} 
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white p-5 rounded border border-gray-300 flex flex-col md:flex-row gap-4 md:gap-10">
              <span className="font-bold w-40 text-sm">2. Payment method</span>
              <div className="flex-1 text-[13px] flex items-center gap-2">
                <CreditCard size={20} className="text-gray-500" />
                <p className="font-bold">Pay on Delivery (Cash/Card)</p>
              </div>
            </div>

            {/* Review Items */}
            <div className="bg-white p-5 rounded border border-gray-300">
              <h3 className="font-bold text-sm mb-4">3. Review items and delivery</h3>
              <div className="space-y-4">
                {cart?.items?.map(item => (
                  <div key={item.id} className="flex gap-4">
                    <img src={item.product.imageUrl} className="w-16 h-16 object-contain" alt={item.product.name} />
                    <div className="text-[13px]">
                      <p className="font-bold truncate max-w-[400px]">{item.product.name}</p>
                      <p className="text-[#B12704] font-bold">₹{item.product.price}</p>
                      <p className="text-gray-500">Quantity: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Place Order Box */}
          <div className="space-y-4">
            <div className="bg-white p-4 rounded border border-gray-300 sticky top-20">
              <button
                onClick={handlePlaceOrder}
                disabled={isPlacing || !cartCount}
                className="w-full py-2 bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] rounded-[8px] text-xs font-medium shadow-sm transition-all disabled:opacity-50"
              >
                {isPlacing ? 'Placing order...' : 'Place your order'}
              </button>
              <p className="text-[11px] text-gray-500 mt-2 text-center leading-tight">
                By placing your order, you agree to Amazon's privacy notice and conditions of use.
              </p>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="font-bold text-sm mb-2">Order Summary</h4>
                <div className="text-[12px] space-y-1">
                  <div className="flex justify-between"><span>Items:</span><span>₹{cartTotal.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>Delivery:</span><span>₹0.00</span></div>
                  <div className="flex justify-between pt-2 mt-2 border-t border-gray-200 text-[#B12704] text-base font-bold">
                    <span>Order Total:</span>
                    <span>₹{cartTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CheckoutPage;
