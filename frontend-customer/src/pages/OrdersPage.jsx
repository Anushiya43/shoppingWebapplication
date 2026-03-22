import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Package } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import useCartStore from '../store/useCartStore';
import { useNotification } from '../context/NotificationContext';

import { useOrders } from '../hooks/useOrders';
import { loadRazorpay } from '../utils/razorpay';
import api from '../api/index';

const OrdersPage = () => {
  const user = useAuthStore(state => state.user);
  const { showNotification } = useNotification();
  const { orders, loading, error, cancelOrder, fetchOrders } = useOrders();
  const addItem = useCartStore(state => state.addItem);
  const navigate = useNavigate();
  const [reordering, setReordering] = useState(null);
  const [paying, setPaying] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handlePayNow = async (order) => {
    setPaying(order.id);
    try {
      let razorpayOrderId = order.razorpayOrderId;

      // If missing, fetch/create from backend
      if (!razorpayOrderId) {
        try {
          const res = await api.get(`/orders/${order.id}/razorpay-order`);
          razorpayOrderId = res.data.razorpayOrderId;
        } catch (err) {
          showNotification('Failed to generate payment ID. Please contact support.', 'error');
          return;
        }
      }

      const isLoaded = await loadRazorpay();
      if (!isLoaded) {
        showNotification('Razorpay SDK failed to load', 'error');
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
        amount: Number(order.totalAmount) * 100,
        currency: 'INR',
        name: import.meta.env.VITE_APP_NAME || 'ModernShop',
        description: `Order #${order.id}`,
        order_id: razorpayOrderId,
        handler: async (response) => {
          try {
            await api.post('/payments/verify', {
              orderId: order.id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            showNotification('Payment successful!', 'success');
            fetchOrders(); // Refresh list
          } catch (err) {
            showNotification('Verification failed', 'error');
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
    } catch (err) {
      showNotification('Failed to initiate payment', 'error');
    } finally {
      setPaying(null);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    const result = await cancelOrder(orderId);
    if (result.success) {
      showNotification('Order cancelled successfully', 'success');
    } else {
      showNotification(result.message, 'error');
    }
  };
  
  const handleReorder = async (product) => {
    try {
      setReordering(product.id);
      await addItem(product.id, 1);
      showNotification(`${product.name} added to cart!`, 'success');
      // Optional: auto-navigate to cart after 1.5s
      // setTimeout(() => navigate('/cart'), 1500);
    } catch (err) {
      showNotification('Failed to add item to cart', 'error');
    } finally {
      setReordering(null);
    }
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'SHIPPED': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'DELIVERED': return 'bg-green-100 text-green-700 border-green-200';
      case 'CANCELLED': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-surface-bg font-sans pb-20 text-text-main">
      <header className="bg-primary-900 text-white shadow-lg sticky top-0 z-50 h-16 flex items-center px-4 max-w-[1500px] mx-auto">
        <div className="flex items-center gap-4 w-full">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 hover:bg-white/10 rounded-full transition-all active:scale-90"
            aria-label="Go back"
          >
            <ArrowLeft size={24} />
          </button>
          <Link to="/" className="flex items-center gap-1 transition-all">
            <div className="text-xl font-extrabold tracking-tight">
              <span className="bg-gradient-to-r from-accent-cyan to-accent-blue bg-clip-text text-transparent">Modern</span>
              <span className="text-white">Shop</span>
            </div>
          </Link>
          <div className="ml-auto text-sm font-bold bg-white/10 px-3 py-1 rounded-full border border-white/10">Order History</div>
        </div>
      </header>

      <main className="max-w-[1000px] mx-auto p-4 md:p-10">
        <div className="flex items-center gap-2 text-[13px] text-text-muted font-bold mb-6 px-1 uppercase tracking-widest">
          <Link to="/" className="hover:text-accent-blue transition-colors">ACCOUNT</Link>
          <span className="opacity-30">/</span>
          <span className="text-primary-900">ORDERS</span>
        </div>
        <h1 className="text-4xl font-black text-primary-900 mb-10 italic">Your Orders</h1>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin w-12 h-12 border-4 border-primary-900 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-text-muted font-bold animate-pulse">Loading your history...</p>
          </div>
        ) : error ? (
          <div className="bg-white p-12 rounded-[32px] border-2 border-dashed border-red-100 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package size={32} className="text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-primary-900 mb-2">Failed to load orders</h3>
            <p className="text-text-muted mb-8 max-w-sm mx-auto">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-primary-900 text-white rounded-2xl font-bold hover:shadow-xl transition-all"
            >
              Try Again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white p-12 rounded-[32px] border-2 border-dashed border-gray-100 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package size={32} className="text-gray-200" />
            </div>
            <p className="text-text-muted font-bold mb-8">You haven't placed any premium orders yet.</p>
            <Link to="/" className="px-8 py-3 bg-primary-900 text-white rounded-2xl font-bold hover:shadow-xl transition-all inline-block">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {orders.map(order => (
              <div key={order.id} className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all group">
                <div className="bg-gray-50/50 p-6 flex flex-wrap gap-10 text-[11px] font-bold text-text-muted border-b border-gray-50">
                  <div className="space-y-1">
                    <p className="uppercase tracking-widest opacity-50">ORDER PLACED</p>
                    <p className="text-sm font-black text-primary-900">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="uppercase tracking-widest opacity-50">INVESTMENT</p>
                    <p className="text-sm font-black text-primary-900 italic">₹{Number(order.totalAmount).toLocaleString()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="uppercase tracking-widest opacity-50">SHIP TO</p>
                    <p className="text-sm font-black text-accent-blue hover:text-primary-900 transition-colors cursor-pointer">{user?.firstName} {user?.lastName}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="uppercase tracking-widest opacity-50">PAYMENT</p>
                    <p className="text-sm font-black text-primary-900">{order.paymentMethod || 'COD'}</p>
                  </div>
                  <div className="ml-auto text-right space-y-1">
                    <p className="uppercase tracking-widest opacity-50">ORDER ID: {order.id.split('-')[0].toUpperCase()}</p>
                    <div className="flex items-center justify-end gap-4 mt-2">
                       {(order.status === 'PENDING' || order.status === 'CONFIRMED') && (
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          className="text-red-400 hover:text-red-500 font-black text-[13px] hover:bg-red-50 px-3 py-1 rounded-lg transition-all"
                        >
                          Cancel Order
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border ${getStatusStyles(order.status)} animate-pulse-slow`}>
                        {order.status}
                      </div>
                      <div className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                        order.paymentStatus === 'PAID' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                        order.paymentStatus === 'FAILED' ? 'bg-red-50 text-red-600 border-red-100' : 
                        'bg-amber-50 text-amber-600 border-amber-100'
                      }`}>
                        Payment: {order.paymentStatus || 'PENDING'}
                      </div>
                      {/* Tracking ID Disabled
                      {order.trackingNumber && (
                        <span className="text-xs font-bold text-text-muted bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">TRK: {order.trackingNumber}</span>
                      )}
                      */}
                    </div>
                  </div>

                  <div className="space-y-8">
                    {order.orderItems.map(item => (
                      <div key={item.id} className="flex gap-8 group/item">
                        <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-50 rounded-3xl p-3 flex items-center justify-center border border-gray-100 group-hover:bg-white transition-all duration-500 shadow-sm group-hover:shadow-md">
                          <img src={item.product.imageUrl} className="max-w-[90%] max-h-[90%] object-contain rounded group-hover:scale-110 transition-transform duration-500" alt={item.product.name} />
                        </div>
                        <div className="flex-1 pt-2">
                          <h4 className="text-xl font-bold text-primary-900 group-hover/item:text-accent-blue transition-colors cursor-pointer line-clamp-1">{item.product.name}</h4>
                          <p className="text-text-muted font-bold text-sm mt-2 flex items-center gap-2">
                            <span className="opacity-50">Quantity</span>
                            <span className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center text-primary-900">{item.quantity}</span>
                          </p>
                          <div className="mt-6 flex gap-3">
                            <button 
                                onClick={() => handleReorder(item.product)}
                                disabled={reordering === item.product.id}
                                className="px-6 py-2.5 bg-primary-900 hover:bg-primary-800 text-white rounded-2xl text-[13px] font-black shadow-lg shadow-primary-900/10 transition-all active:scale-95 disabled:opacity-50"
                              >
                                {reordering === item.product.id ? 'Adding...' : 'Order Again'}
                              </button>
                            {order.paymentMethod === 'ONLINE' && order.paymentStatus === 'PENDING' && order.status !== 'CANCELLED' && (
                              <button 
                                onClick={() => handlePayNow(order)}
                                disabled={paying === order.id}
                                className="px-6 py-2.5 bg-accent-blue hover:bg-accent-blue/90 text-white rounded-2xl text-[13px] font-black shadow-lg shadow-accent-blue/20 transition-all active:scale-95 disabled:opacity-50"
                              >
                                {paying === order.id ? 'Processing...' : 'Pay Now'}
                              </button>
                            )}
                            <button 
                              onClick={() => navigate(`/orders/${order.id}/track`)}
                              className="px-6 py-2.5 bg-white hover:bg-gray-50 text-primary-900 border border-gray-100 rounded-2xl text-[13px] font-black transition-all active:scale-90"
                            >
                              Track Item
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {order.shippingAddress && (
                     <div className="mt-8 pt-8 border-t border-gray-50 group-hover:border-gray-100 transition-colors">
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-3 opacity-40">SHIPPING DESTINATION</p>
                        <p className="text-sm text-primary-900 font-bold leading-relaxed max-w-lg">{order.shippingAddress}</p>
                     </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default OrdersPage;
