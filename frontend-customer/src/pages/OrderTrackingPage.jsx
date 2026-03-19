import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Package, Truck, CheckCircle, ShieldCheck, 
  Clock, Navigation, Shield, ShoppingBag, MapPin
} from 'lucide-react';
import { getOrderById } from '../api/orders';
import useAuthStore from '../store/useAuthStore';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const OrderTrackingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  const authLoading = useAuthStore(state => state.loading);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await getOrderById(id);
        setOrder(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch order details');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      if (user) {
        fetchOrder();
      } else {
        navigate('/login');
      }
    }
  }, [id, user, authLoading, navigate]);

  const steps = [
    { id: 'PENDING', label: 'Order Placed', icon: ShoppingBag, time: order?.createdAt },
    { id: 'CONFIRMED', label: 'Confirmed', icon: ShieldCheck, time: order?.updatedAt },
    { id: 'SHIPPED', label: 'In Transit', icon: Truck, time: null },
    { id: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Navigation, time: null },
    { id: 'DELIVERED', label: 'Delivered', icon: CheckCircle, time: null }
  ];

  const getStepStatus = (stepId, currentStatus) => {
    const statusOrder = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];
    
    if (currentStatus === 'CANCELLED') return 'cancelled';
    
    const currentIndex = statusOrder.indexOf(currentStatus);
    const stepIndex = statusOrder.indexOf(stepId);

    // Special handling for OUT_FOR_DELIVERY which isn't in our DB status yet
    if (stepId === 'OUT_FOR_DELIVERY') {
        return currentStatus === 'DELIVERED' ? 'completed' : 'pending';
    }

    if (stepIndex <= currentIndex) return 'completed';
    return 'pending';
  };

  const calculateEstimatedArrival = (createdAt) => {
    const date = new Date(createdAt);
    date.setDate(date.getDate() + 5);
    return date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary-900 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tracking Satellite...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-primary-900 selection:text-white">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-12">
            <button 
              onClick={() => navigate(-1)}
              className="p-3 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-90"
            >
              <ArrowLeft size={20} className="text-primary-900" />
            </button>
            <div>
              <h1 className="text-3xl font-black text-primary-900 tracking-tight uppercase">Voyage Tracking</h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Order ID: {id.split('-')[0]}</p>
            </div>
          </div>

          {error ? (
            <div className="bg-white rounded-[2.5rem] p-12 text-center shadow-sm border border-slate-100">
               <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                 <Package size={32} className="text-red-400" />
               </div>
               <h3 className="text-xl font-bold text-primary-900 mb-2">Voyage Interrupted</h3>
               <p className="text-slate-500 mb-8 max-w-sm mx-auto font-medium">{error}</p>
               <button onClick={() => window.location.reload()} className="px-10 py-4 bg-primary-900 text-white rounded-full font-black uppercase tracking-widest text-xs hover:shadow-xl transition-all">Retry Link</button>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Status Banner */}
              <div className="bg-primary-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 transition-transform duration-1000 group-hover:scale-110"></div>
                <div className="relative z-10">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 mb-2">
                    {order.status === 'DELIVERED' ? 'Delivery Confirmed' : 'Estimated Arrival'}
                  </p>
                  <h2 className="text-4xl font-black mb-6 italic tracking-tight">
                    {order.status === 'DELIVERED' 
                      ? 'Successfully Delivered' 
                      : calculateEstimatedArrival(order.createdAt)}
                  </h2>
                  <div className="flex flex-wrap gap-4">
                    <div className="px-4 py-2 bg-white/10 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest">
                      Status: {order.status}
                    </div>
                    {order.trackingNumber && (
                      <div className="px-4 py-2 bg-white/10 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                        <Package size={12} /> {order.trackingNumber}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Timeline Container */}
              <div className="bg-white rounded-[2.5rem] p-10 lg:p-16 shadow-sm border border-slate-100">
                <div className="space-y-12">
                  {steps.map((step, index) => {
                    const status = getStepStatus(step.id, order.status);
                    const isLast = index === steps.length - 1;
                    
                    return (
                      <div key={step.id} className="relative flex gap-8 group">
                        {/* Line */}
                        {!isLast && (
                          <div className={`absolute left-[23px] top-[46px] w-[2px] h-[calc(100%+48px)] transition-all duration-1000 ${status === 'completed' ? 'bg-primary-900' : 'bg-slate-100'}`}>
                            {status === 'completed' && (
                                <div className="absolute top-0 left-0 w-full h-full bg-primary-900 animate-in slide-in-from-top-full duration-1000"></div>
                            )}
                          </div>
                        )}

                        {/* Icon Node */}
                        <div className={`relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm ${
                          status === 'completed' ? 'bg-primary-900 text-white scale-110' : 
                          status === 'cancelled' ? 'bg-red-500 text-white' : 'bg-slate-50 text-slate-300'
                        }`}>
                          <step.icon size={20} strokeWidth={status === 'completed' ? 3 : 2} />
                        </div>

                        {/* Content */}
                        <div className="pt-2">
                          <h3 className={`text-sm font-black uppercase tracking-widest transition-colors duration-500 ${status === 'completed' ? 'text-primary-900' : 'text-slate-400'}`}>
                            {step.label}
                          </h3>
                          {status === 'completed' && step.time && (
                             <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
                                {new Date(step.time).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                             </p>
                          )}
                          {status === 'pending' && index === steps.indexOf(order.status) + 1 && (
                            <p className="text-[10px] font-bold text-accent-blue mt-1 uppercase tracking-widest animate-pulse">In Progress</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Details Mini-Summary */}
              <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 overflow-hidden">
                <h3 className="text-xs font-black text-primary-900 uppercase tracking-widest mb-8 flex items-center gap-2">
                  <ShoppingBag size={14} /> Shipping Essentials
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Destination</p>
                    <div className="flex gap-3 text-slate-600">
                      <MapPin size={16} className="text-primary-900 mt-1 shrink-0" />
                      <p className="text-sm font-medium leading-relaxed">{order.shippingAddress}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Collector</p>
                    <p className="text-sm font-black text-primary-900">{user?.firstName} {user?.lastName}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Confirmed Identity</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderTrackingPage;
