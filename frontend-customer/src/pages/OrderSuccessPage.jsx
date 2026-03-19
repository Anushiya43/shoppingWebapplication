import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  CheckCircle2, Package, Truck, Calendar, 
  ShoppingBag, ArrowRight, MapPin, CreditCard,
  ChevronRight
} from 'lucide-react';
import { getOrderById } from '../api/orders';

const OrderSuccessPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await getOrderById(orderId);
        setOrder(res.data);
      } catch (err) {
        console.error('Failed to fetch order details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
        <div className="w-16 h-16 border-4 border-primary-900 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-text-muted font-bold animate-pulse">Confirming your premium order...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
          <Package size={40} className="text-red-500" />
        </div>
        <h1 className="text-2xl font-black text-primary-900 mb-2">Order Not Found</h1>
        <p className="text-text-muted mb-8">We couldn't retrieve the details for this order.</p>
        <Link to="/" className="px-8 py-3 bg-primary-900 text-white rounded-2xl font-bold">Go Home</Link>
      </div>
    );
  }

  // Calculate estimated delivery (Order date + 4 days)
  const orderDate = new Date(order.createdAt);
  const deliveryDate = new Date(orderDate);
  deliveryDate.setDate(orderDate.getDate() + 4);

  return (
    <div className="min-h-screen bg-surface-bg font-sans pb-20 overflow-x-hidden">
      {/* Success Celebration Header */}
      <div className="bg-primary-900 text-white pt-20 pb-40 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-accent-blue/20 rounded-full blur-[100px] -animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-cyan/10 rounded-full blur-[120px] animate-pulse"></div>
        </div>

        <div className="max-w-[800px] mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white/10 backdrop-blur-xl rounded-[2.5rem] mb-8 border border-white/20 animate-in zoom-in duration-700">
            <CheckCircle2 size={48} className="text-accent-cyan animate-bounce" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight animate-in slide-in-from-bottom-4 duration-500">
            Order Confirmed!
          </h1>
          <p className="text-cyan-100/70 text-lg font-medium animate-in slide-in-from-bottom-4 duration-700 delay-200">
            Your premium selection is being prepared for shipment.
          </p>
        </div>
      </div>

      {/* Content Container */}
      <div className="max-w-[900px] mx-auto px-6 -mt-24 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Main Details */}
          <div className="md:col-span-2 space-y-6">
            {/* Order Tracking Card */}
            <div className="bg-white rounded-[2rem] p-8 shadow-2xl shadow-primary-900/5 border border-white/50 backdrop-blur-sm group">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">Order Identifier</p>
                  <h3 className="text-xl font-black text-primary-900 font-mono">#{order.id.slice(-12).toUpperCase()}</h3>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">Status</p>
                  <span className="px-3 py-1 bg-blue-50 text-accent-blue rounded-full text-[10px] font-black uppercase tracking-wider border border-blue-100">
                    {order.status}
                  </span>
                </div>
              </div>

              <div className="space-y-8">
                <div className="flex gap-6">
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100 flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Truck className="text-primary-900" size={24} />
                  </div>
                  <div>
                    <h4 className="font-black text-primary-900 text-sm mb-1 uppercase tracking-wider">Estimated Delivery</h4>
                    <p className="text-text-muted text-sm font-medium">Arriving by <span className="text-primary-900 font-bold">{deliveryDate.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}</span></p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100 flex-shrink-0 group-hover:scale-110 transition-transform">
                    <MapPin className="text-primary-900" size={24} />
                  </div>
                  <div>
                    <h4 className="font-black text-primary-900 text-sm mb-1 uppercase tracking-wider">Shipping To</h4>
                    <p className="text-text-muted text-sm font-medium leading-relaxed">{order.shippingAddress}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Items Summary */}
            <div className="bg-white rounded-[2rem] p-8 shadow-2xl shadow-primary-900/5 border border-white/50">
              <h3 className="font-black text-primary-900 text-sm mb-6 uppercase tracking-[0.2em]">Package Summary</h3>
              <div className="space-y-6">
                {order.orderItems.map((item) => (
                  <div key={item.id} className="flex gap-4 items-center group/item">
                    <div className="w-16 h-16 bg-gray-50 rounded-2xl p-1 flex items-center justify-center border border-gray-100 group-hover/item:border-accent-blue transition-colors">
                      <img src={item.product.imageUrl} className="max-w-[90%] max-h-[90%] object-contain" alt={item.product.name} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-primary-900 text-sm truncate">{item.product.name}</p>
                      <p className="text-[10px] font-black text-text-muted uppercase tracking-wider mt-0.5">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-primary-900">₹{parseFloat(item.price).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-[2rem] p-8 shadow-2xl shadow-primary-900/5 border border-white/50 h-fit">
              <h4 className="font-black text-primary-900 text-[10px] uppercase tracking-[0.2em] mb-6">Payment Overview</h4>
              <div className="space-y-4">
                <div className="flex justify-between text-sm text-text-muted font-medium">
                  <span>Grand Total</span>
                  <span className="text-primary-900 font-black">₹{parseFloat(order.totalAmount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-text-muted font-medium">
                  <span>Method</span>
                  <span className="flex items-center gap-2 text-primary-900 font-bold uppercase text-[10px]">
                    <CreditCard size={14} /> Pay on Delivery
                  </span>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-100 space-y-3">
                <Link 
                  to="/orders" 
                  className="w-full py-4 bg-primary-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-primary-900/10"
                >
                  <Package size={16} /> Track Order
                </Link>
                <Link 
                  to="/" 
                  className="w-full py-4 bg-gray-50 text-primary-900 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-100 transition-all active:scale-95 border border-gray-100"
                >
                  <ShoppingBag size={16} /> Continue
                </Link>
              </div>
            </div>

            <div className="bg-accent-blue/5 border border-accent-blue/10 rounded-[2rem] p-6 text-center">
              <p className="text-[10px] font-black text-accent-blue uppercase tracking-widest mb-2">Need Assistance?</p>
              <p className="text-xs text-primary-900 font-medium leading-relaxed">Our premium support team is available 24/7 for order inquiries.</p>
              <button className="mt-4 text-accent-blue text-xs font-black uppercase tracking-wider hover:underline flex items-center gap-1 mx-auto">
                Contact Support <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <footer className="mt-20 text-center px-6">
        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">ModernShop Premium Experience</p>
      </footer>
    </div>
  );
};

export default OrderSuccessPage;
