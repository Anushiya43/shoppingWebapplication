import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, ArrowLeft, ShieldAlert, CreditCard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';
import AddressSelector from '../components/address/AddressSelector';

const CheckoutPage = () => {
  const { user } = useAuth();
  const { cart, cartCount, cartTotal, clearCart } = useCart();
  const { showNotification } = useNotification();
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
      showNotification('Please select or add a delivery address', 'warning');
      return;
    }

    setPlacing(true);
    try {
      const { createOrder } = await import('../api/orders');
      const { getAddresses } = await import('../api/address');
      
      const addrRes = await getAddresses();
      const selected = addrRes.data.find(a => a.id === selectedAddressId);
      
      if (!selected) {
        showNotification('Selected address not found', 'error');
        return;
      }

      const formattedAddress = `${selected.fullName}, ${selected.phoneNumber}, ${selected.street}, ${selected.city}, ${selected.district}, ${selected.state} - ${selected.zipCode}, India`;
      
      await createOrder({ shippingAddress: formattedAddress });
      setPlaced(true);
      await clearCart();
      setTimeout(() => navigate('/orders'), 3000);
    } catch (err) {
      showNotification('Failed to place order: ' + (err.response?.data?.message || 'Unknown error'), 'error');
    } finally {
      setPlacing(false);
    }
  };

  if (placed) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 animate-fade-in text-center">
        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-100 animate-bounce">
          <CheckCircle2 size={48} className="text-green-500" />
        </div>
        <h1 className="text-4xl font-black text-primary-900 mb-3 tracking-tight">Order complete!</h1>
        <p className="text-text-muted text-lg max-w-sm mb-8 font-medium">Thank you for choosing ModernShop. We're preparing your premium items for delivery.</p>
        <button 
          onClick={() => navigate('/orders')} 
          className="px-8 py-3 bg-primary-900 hover:bg-primary-800 text-white rounded-2xl font-bold shadow-xl shadow-primary-900/10 transition-all active:scale-95"
        >
          View Your Orders
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-bg font-sans pb-20">
      <header className="bg-primary-900 text-white shadow-lg sticky top-0 z-50 h-16 flex items-center px-4 max-w-[1500px] mx-auto">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 hover:bg-white/10 rounded-full transition-all active:scale-90"
          aria-label="Go back"
        >
          <ArrowLeft size={24} />
        </button>
        <Link to="/" className="flex items-center gap-1 ml-4 lg:ml-0 lg:absolute lg:left-1/2 lg:-translate-x-1/2">
          <div className="text-xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-accent-cyan to-accent-blue bg-clip-text text-transparent">Modern</span>
            <span className="text-white">Shop</span>
          </div>
        </Link>
        <div className="ml-auto text-cyan-200 opacity-60">
          <ShieldAlert size={24} />
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto p-4 md:p-10 pt-8">
        <h1 className="text-3xl font-black text-primary-900 mb-10 px-1 italic">Checkout <span className="text-text-muted font-normal text-lg ml-2 not-italic">({cartCount} items)</span></h1>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-6">
          <div className="space-y-6">
            {/* Delivery Address */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-primary-900 text-white flex items-center justify-center font-black text-sm">1</span>
                  <h2 className="font-black text-primary-900 uppercase tracking-wider text-sm">Shipping Destination</h2>
                </div>
                <div className="pl-0 sm:pl-11">
                  <AddressSelector 
                    selectedId={selectedAddressId} 
                    onAddressSelect={setSelectedAddressId} 
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-primary-900 text-white flex items-center justify-center font-black text-sm">2</span>
                  <h2 className="font-black text-primary-900 uppercase tracking-wider text-sm">Secure Payment</h2>
                </div>
                <div className="pl-11 flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
                    <CreditCard size={24} className="text-accent-blue" />
                  </div>
                  <div>
                    <p className="font-black text-primary-900">Pay on Delivery</p>
                    <p className="text-xs text-text-muted font-medium">Cash, Card, or UPI on arrival</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Review Items */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-8">
                <span className="w-8 h-8 rounded-full bg-primary-900 text-white flex items-center justify-center font-black text-sm">3</span>
                <h2 className="font-black text-primary-900 uppercase tracking-wider text-sm">Review Selection</h2>
              </div>
              <div className="pl-11 space-y-6">
                {cart?.items?.map(item => (
                  <div key={item.id} className="flex gap-4 group">
                    <div className="w-20 h-20 bg-gray-50 rounded-xl p-1 flex items-center justify-center group-hover:bg-white transition-colors duration-300 border border-gray-100 shadow-sm">
                      <img src={item.product.imageUrl} className="max-w-[90%] max-h-[90%] object-contain rounded" alt={item.product.name} />
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <p className="font-bold text-primary-900 group-hover:text-accent-blue transition-colors line-clamp-1">{item.product.name}</p>
                      <div className="flex items-baseline gap-2 mt-1">
                        <p className="text-lg font-black text-primary-900">₹{item.product.price.toLocaleString()}</p>
                        <p className="text-xs text-text-muted font-bold">Qty: {item.quantity}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Place Order Box */}
          <div className="lg:w-[350px]">
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 sticky top-24">
              <button
                onClick={handlePlaceOrder}
                disabled={isPlacing || !cartCount}
                className="w-full py-5 bg-primary-900 hover:bg-primary-800 text-white rounded-2xl text-base font-black shadow-xl shadow-primary-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isPlacing ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin h-5 w-5 border-2 border-white/20 border-t-white rounded-full"></span>
                    Placing Order...
                  </span>
                ) : 'Complete Purchase'}
              </button>
              <p className="text-[11px] text-text-muted mt-6 text-center leading-relaxed font-medium">
                By completing your purchase, you agree to ModernShop's <span className="text-accent-blue hover:underline cursor-pointer">Security Standards</span> and <span className="text-accent-blue hover:underline cursor-pointer">Global Policies</span>.
              </p>
 
              <div className="mt-8 pt-8 border-t border-gray-100">
                <h4 className="font-black text-primary-900 tracking-tight mb-4 uppercase text-xs">Premium Summary</h4>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm text-text-muted font-medium"><span>Items subtotal</span><span>₹{cartTotal.toLocaleString()}</span></div>
                  <div className="flex justify-between text-sm text-text-muted font-medium"><span>Premium Delivery</span><span className="text-green-500 font-bold">FREE</span></div>
                  <div className="flex justify-between pt-4 mt-4 border-t border-gray-100 text-primary-900">
                    <span className="text-lg font-black">Grand Total</span>
                    <span className="text-2xl font-black tracking-tight">₹{cartTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex justify-center opacity-40 grayscale scale-90">
                <ShieldAlert size={16} className="text-primary-900" />
                <span className="text-[10px] font-bold text-primary-900 ml-1">SECURE TRANSACTION CERTIFIED</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CheckoutPage;
