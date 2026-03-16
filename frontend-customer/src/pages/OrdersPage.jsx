import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const OrdersPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { getOrders } = await import('../api/orders');
        const res = await getOrders();
        setOrders(res.data);
      } catch (err) {
        console.error('Failed to fetch orders', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    try {
      const { cancelOrder } = await import('../api/orders');
      await cancelOrder(orderId);
      // Refresh orders
      const { getOrders } = await import('../api/orders');
      const res = await getOrders();
      setOrders(res.data);
      alert('Order cancelled successfully');
    } catch (err) {
      alert('Failed to cancel order: ' + (err.response?.data?.message || 'Unknown error'));
    }
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-amber-500';
      case 'CONFIRMED': return 'bg-blue-500';
      case 'SHIPPED': return 'bg-indigo-500';
      case 'DELIVERED': return 'bg-green-700';
      case 'CANCELLED': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-[#EAEDED] font-sans pb-10">
      <header className="bg-amazon-navy-900 text-white p-3 sticky top-0 z-50">
        <div className="max-w-[1500px] mx-auto flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="p-1 hover:bg-white/10 rounded-full transition-colors lg:hidden"
            aria-label="Go back"
          >
            <ArrowLeft size={24} />
          </button>
          <Link to="/" className="text-xl font-bold">amazon<span className="text-amazon-orange text-[10px] italic">.in</span></Link>
          <div className="ml-auto text-sm font-medium">Your Orders</div>
        </div>
      </header>

      <main className="max-w-[800px] mx-auto p-4 md:p-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Link to="/" className="hover:text-amazon-orange hover:underline">Your Account</Link>
          <span>›</span>
          <span className="text-amazon-orange">Your Orders</span>
        </div>
        <h1 className="text-3xl font-normal mb-6">Your Orders</h1>

        {loading ? (
          <div className="text-center py-10">
            <div className="animate-spin w-8 h-8 border-4 border-amazon-orange border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white p-8 rounded border border-gray-300 text-center">
            <p className="text-gray-600 mb-4">You have not placed any orders yet.</p>
            <Link to="/" className="text-amazon-blue hover:underline">Continue shopping</Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => (
              <div key={order.id} className="bg-white rounded border border-gray-300 overflow-hidden shadow-sm">
                <div className="bg-[#f0f2f2] p-4 flex flex-wrap gap-6 text-[12px] text-gray-500 border-b border-gray-300">
                  <div><p className="uppercase">Order Placed</p><p className="text-sm font-medium text-gray-700">{new Date(order.createdAt).toLocaleDateString()}</p></div>
                  <div><p className="uppercase">Total</p><p className="text-sm font-medium text-gray-700">₹{Number(order.totalAmount).toFixed(2)}</p></div>
                  <div><p className="uppercase">Ship To</p><p className="text-sm font-medium text-amazon-blue cursor-pointer hover:text-amazon-orange underline">{user?.firstName} {user?.lastName}</p></div>
                  <div className="ml-auto text-right">
                    <p className="uppercase">Order # {order.id.split('-')[0].toUpperCase()}</p>
                    <div className="flex flex-col items-end gap-1">
                      <Link to={`#`} className="text-amazon-blue hover:text-amazon-orange underline">View order details</Link>
                      {(order.status === 'PENDING' || order.status === 'CONFIRMED') && (
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          className="text-red-600 hover:text-red-700 font-medium underline"
                        >
                          Cancel Order
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                  <p className="text-[12px] font-bold text-gray-600 uppercase mb-1">Shipping Address</p>
                  <p className="text-[13px] text-gray-700">{order.shippingAddress || 'No address provided'}</p>
                  {order.trackingNumber && (
                    <p className="text-[13px] text-green-700 font-bold mt-2">Tracking ID: {order.trackingNumber}</p>
                  )}
                </div>
                <div className="p-4 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`${getStatusStyles(order.status)} w-2 h-2 rounded-full`}></div>
                    <span className="font-bold text-sm tracking-tight capitalize">{order.status.toLowerCase()}</span>
                  </div>
                  {order.orderItems.map(item => (
                    <div key={item.id} className="flex gap-4">
                      <img src={item.product.imageUrl} className="w-20 h-20 object-contain border border-gray-100 rounded" alt={item.product.name} />
                      <div className="flex-1 text-[13px]">
                        <h4 className="text-amazon-blue font-medium hover:text-amazon-orange hover:underline cursor-pointer">{item.product.name}</h4>
                        <p className="text-gray-500 mt-1">Quantity: {item.quantity}</p>
                        <div className="flex gap-3">
                          <button className="mt-2 px-6 py-1 bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] rounded-full text-xs shadow-sm shadow-black/5">Buy it again</button>
                        </div>
                      </div>
                    </div>
                  ))}
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
