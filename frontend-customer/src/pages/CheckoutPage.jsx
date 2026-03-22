import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, ArrowLeft, ShieldAlert, CreditCard, Ticket } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import useCartStore from '../store/useCartStore';
import { useNotification } from '../context/NotificationContext';
import AddressSelector from '../components/address/AddressSelector';

const CheckoutPage = () => {
  const user = useAuthStore(state => state.user);
  const cart = useCartStore(state => state.cart);
  const cartCount = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
  const cartTotalRaw = cart?.items?.reduce((acc, item) => {
    const discountedPrice = item.product.discountPercentage 
        ? item.product.price * (1 - item.product.discountPercentage / 100)
        : item.product.price;
    return acc + (discountedPrice * item.quantity);
  }, 0) || 0;
  const cartTotal = Math.round(cartTotalRaw * 100) / 100;
  const clearCart = useCartStore(state => state.clearCart);
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const [isPlacing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [showOffers, setShowOffers] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('COD');

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    // Auto-select default address
    const fetchAndSelectDefault = async () => {
      try {
        const { getAddresses } = await import('../api/address');
        const res = await getAddresses();
        const defaultAddr = res.data.find(a => a.isDefault);
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);
        } else if (res.data.length > 0) {
          // Fallback to first address if no default found
          setSelectedAddressId(res.data[0].id);
        }
      } catch (err) {
        console.error('Failed to pre-select address', err);
      }
    };

    const fetchActiveCoupons = async () => {
      try {
        const { getActiveCoupons } = await import('../api/coupons');
        const res = await getActiveCoupons();
        setAvailableCoupons(res.data);
      } catch (err) {
        console.error('Failed to fetch active coupons', err);
      }
    };

    fetchAndSelectDefault();
    fetchActiveCoupons();
  }, [user, navigate]);

  if (!user) return null;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsValidating(true);
    try {
      const { validateCoupon } = await import('../api/coupons');
      const roundedAmount = Math.round(cartTotal * 100) / 100;
      const res = await validateCoupon(couponCode, roundedAmount);
      setAppliedCoupon(res.data);
      showNotification(`Coupon ${res.data.code} applied successfully!`, 'success');
    } catch (err) {
      setAppliedCoupon(null);
      showNotification(err.response?.data?.message || 'Invalid coupon code', 'error');
    } finally {
      setIsValidating(false);
    }
  };

  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.type === 'PERCENTAGE') {
      return (cartTotal * Number(appliedCoupon.value)) / 100;
    }
    return Number(appliedCoupon.value);
  };

  const discountAmount = calculateDiscount();
  
  const shippingThreshold = Number(import.meta.env.VITE_SHIPPING_THRESHOLD) || 500;
  const shippingFee = cartTotal >= shippingThreshold ? 0 : (Number(import.meta.env.VITE_SHIPPING_COST) || 50);
  
  const grandTotal = Math.max(0, cartTotal - discountAmount + shippingFee);

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      showNotification('Please select or add a delivery address', 'warning');
      return;
    }

    setPlacing(true);
    try {
      const { createOrder } = await import('../api/orders');
      const { getAddresses } = await import('../api/address');
      const api = (await import('../api/index')).default;
      
      const addrRes = await getAddresses();
      const selected = addrRes.data.find(a => a.id === selectedAddressId);
      
      if (!selected) {
        showNotification('Selected address not found', 'error');
        return;
      }

      const formattedAddress = `${selected.fullName}, ${selected.phoneNumber}, ${selected.street}, ${selected.city}, ${selected.district}, ${selected.state} - ${selected.zipCode}, India`;
      
      const res = await createOrder({ 
        shippingAddress: formattedAddress,
        couponId: appliedCoupon?.id,
        paymentMethod: paymentMethod
      });

      if (paymentMethod === 'ONLINE') {
        const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
        
        // DEVELOPMENT MOCK MODE
        if (!razorpayKey || razorpayKey === 'rzp_test_placeholder') {
          showNotification('Development Mode: Simulating Payment...', 'info');
          setTimeout(async () => {
            try {
              await api.post('/orders/verify-payment', {
                orderId: res.data.id,
                razorpay_order_id: res.data.razorpayOrderId || 'mock_order_id',
                razorpay_payment_id: 'mock_payment_id',
                razorpay_signature: 'mock_signature',
              });
              await clearCart();
              navigate(`/order-success/${res.data.id}`);
            } catch (err) {
              showNotification('Mock payment failed to verify. check backend logs.', 'error');
              setPlacing(false);
            }
          }, 1500);
          return;
        }

        const isLoaded = await loadRazorpay();
        if (!isLoaded) {
          showNotification('Razorpay SDK failed to load. Are you online?', 'error');
          setPlacing(false);
          return;
        }

        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
          amount: Number(res.data.totalAmount) * 100,
          currency: 'INR',
          name: import.meta.env.VITE_APP_NAME || 'ModernShop',
          description: `Order #${res.data.id}`,
          order_id: res.data.razorpayOrderId,
          handler: async (response) => {
            try {
              // Verify payment on backend (this also updates status to PAID)
              await api.post('/orders/verify-payment', {
                orderId: res.data.id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });

              await clearCart();
              navigate(`/order-success/${res.data.id}`);
            } catch (err) {
              showNotification('Payment verification failed. Please contact support.', 'error');
            }
          },
          prefill: {
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            contact: user.phoneNumber,
          },
          theme: {
            color: '#0f172a',
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        await clearCart();
        navigate(`/order-success/${res.data.id}`);
      }
    } catch (err) {
      showNotification('Failed to place order: ' + (err.response?.data?.message || 'Unknown error'), 'error');
    } finally {
      if (paymentMethod !== 'ONLINE') {
        setPlacing(false);
      }
    }
  };


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
                <div className="pl-11 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button 
                    onClick={() => setPaymentMethod('COD')}
                    className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${paymentMethod === 'COD' ? 'bg-accent-blue/5 border-accent-blue ring-2 ring-accent-blue/10' : 'bg-gray-50 border-gray-100 hover:bg-gray-100'}`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${paymentMethod === 'COD' ? 'bg-accent-blue text-white' : 'bg-white text-accent-blue'}`}>
                      <CreditCard size={24} />
                    </div>
                    <div className="text-left">
                      <p className="font-black text-primary-900 text-sm">Pay on Delivery</p>
                      <p className="text-[10px] text-text-muted font-medium">Cash/UPI at your door</p>
                    </div>
                  </button>

                  <button 
                    onClick={() => setPaymentMethod('ONLINE')}
                    className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${paymentMethod === 'ONLINE' ? 'bg-accent-blue/5 border-accent-blue ring-2 ring-accent-blue/10' : 'bg-gray-50 border-gray-100 hover:bg-gray-100'}`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${paymentMethod === 'ONLINE' ? 'bg-accent-blue text-white' : 'bg-white text-accent-blue'}`}>
                      <ShieldAlert size={24} />
                    </div>
                    <div className="text-left">
                      <p className="font-black text-primary-900 text-sm">Online Payment</p>
                      <p className="text-[10px] text-text-muted font-medium">Secure Card/UPI Pay</p>
                    </div>
                  </button>
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
                <div className="flex flex-col gap-3 mb-6 relative">
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-primary-900 tracking-tight uppercase text-[10px] mb-1">Promotional Code</h4>
                    {availableCoupons.length > 0 && (
                      <button 
                        onClick={() => setShowOffers(!showOffers)}
                        className="text-[10px] font-black text-accent-blue hover:underline uppercase flex items-center gap-1"
                      >
                        <Ticket size={10} /> View Offers
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="ENTER CODE"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-accent-blue/10 focus:border-accent-blue outline-none transition-all uppercase"
                    />
                    <button 
                      onClick={handleApplyCoupon}
                      disabled={isValidating || !couponCode}
                      className="px-4 py-2 bg-primary-900 text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-primary-800 transition-all disabled:opacity-50"
                    >
                      {isValidating ? '...' : 'Apply'}
                    </button>
                  </div>

                  {showOffers && availableCoupons.length > 0 && (
                    <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-100 shadow-2xl rounded-2xl z-[60] p-4 animate-in slide-in-from-bottom-2 duration-200">
                      <div className="flex items-center justify-between mb-3 border-b border-gray-50 pb-2">
                        <h5 className="text-[10px] font-black text-primary-900 uppercase tracking-widest">Available Coupons</h5>
                        <button onClick={() => setShowOffers(false)} className="text-[10px] font-black text-text-muted hover:text-red-500">✕</button>
                      </div>
                      <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                        {availableCoupons.map(coupon => (
                          <div 
                            key={coupon.id} 
                            onClick={() => {
                              setCouponCode(coupon.code);
                              setShowOffers(false);
                            }}
                            className="p-3 bg-gray-50 rounded-xl hover:bg-accent-blue/5 border border-transparent hover:border-accent-blue/20 cursor-pointer transition-all group"
                          >
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-xs font-black text-primary-900 group-hover:text-accent-blue tracking-wider">{coupon.code}</span>
                              <span className="text-[10px] font-black text-emerald-600">
                                {coupon.type === 'PERCENTAGE' ? `${coupon.value}% OFF` : `₹${coupon.value} OFF`}
                              </span>
                            </div>
                            <p className="text-[9px] font-bold text-text-muted">Min. spend: ₹{coupon.minAmount}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {appliedCoupon && (
                    <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-xl">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={12} className="text-emerald-500" />
                        <span className="text-[10px] font-black text-emerald-700 uppercase">{appliedCoupon.code} Applied</span>
                      </div>
                      <button 
                        onClick={() => { setAppliedCoupon(null); setCouponCode(''); }}
                        className="text-[10px] font-bold text-emerald-700 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                <h4 className="font-black text-primary-900 tracking-tight mb-4 uppercase text-[10px]">Premium Summary</h4>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm text-text-muted font-medium font-bold"><span>Items subtotal</span><span>₹{cartTotal.toLocaleString()}</span></div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-sm text-emerald-600 font-bold">
                      <span>Coupon Discount</span>
                      <span>-₹{discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm text-text-muted font-medium font-bold">
                    <span>Premium Delivery</span>
                    {shippingFee === 0 ? (
                      <span className="text-green-500 font-bold">FREE</span>
                    ) : (
                      <span className="text-primary-900 font-bold">₹{shippingFee}</span>
                    )}
                  </div>
                  <div className="flex justify-between pt-4 mt-4 border-t border-gray-100 text-primary-900">
                    <span className="text-lg font-black uppercase tracking-tighter">Grand Total</span>
                    <span className="text-2xl font-black tracking-tighter">₹{grandTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex justify-center opacity-40 grayscale scale-90">
                <ShieldAlert size={16} className="text-primary-900" />
                <span className="text-[10px] font-bold text-primary-900 ml-1 uppercase tracking-tighter">SECURE TRANSACTION CERTIFIED</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CheckoutPage;
