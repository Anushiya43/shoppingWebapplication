import React, { useState, useEffect } from 'react';
import { getAllOrders, updateOrderStatus } from '../api/orders';
import { 
  Search, Filter, ChevronRight, Package, 
  Clock, Truck, CheckCircle, XCircle, 
  Eye, MoreVertical, ExternalLink 
} from 'lucide-react';

const OrdersManagementPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await getAllOrders();
      setOrders(res.data);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError('Failed to load orders. Please check if the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus, trackingNumber) => {
    try {
      const updateData = { status: newStatus };
      if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;
      
      await updateOrderStatus(orderId, updateData);
      
      // Update local state to reflect change immediately
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, ...updateData } : order
      ));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, ...updateData });
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Failed to update order status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'SHIPPED': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'DELIVERED': return 'bg-green-100 text-green-700 border-green-200';
      case 'CANCELLED': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING': return <Clock size={14} />;
      case 'CONFIRMED': return <CheckCircle size={14} />;
      case 'SHIPPED': return <Truck size={14} />;
      case 'DELIVERED': return <CheckCircle size={14} />;
      case 'CANCELLED': return <XCircle size={14} />;
      default: return null;
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${order.user.firstName} ${order.user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Order Management</h2>
          <p className="text-slate-500">Monitor and update customer orders across the platform.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Search by ID or customer..."
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 w-64 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select 
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm appearance-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
      ) : error ? (
        <div className="p-8 bg-red-50 text-red-600 rounded-3xl text-center border border-red-100">
          <XCircle size={40} className="mx-auto mb-4 opacity-50" />
          <p className="font-bold">{error}</p>
          <button onClick={fetchOrders} className="mt-4 text-sm font-bold underline">Try Again</button>
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Order ID</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Customer</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Total Amount</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                      No orders found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-bold text-blue-600">#{order.id.split('-')[0].toUpperCase()}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">{order.user.firstName} {order.user.lastName}</span>
                          <span className="text-xs text-slate-500">{order.user.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-900">₹{parseFloat(order.totalAmount).toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600">{new Date(order.createdAt).toLocaleDateString()}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => setSelectedOrder(order)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          <div className="relative group/menu">
                            <button 
                              className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                            >
                              <MoreVertical size={18} />
                            </button>
                            <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-slate-100 rounded-xl shadow-xl opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-20 overflow-hidden">
                              {['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(status => (
                                <button
                                  key={status}
                                  onClick={() => handleStatusChange(order.id, status)}
                                  className={`w-full text-left px-4 py-2 text-xs font-medium hover:bg-slate-50 transition-colors ${order.status === status ? 'text-blue-600 bg-blue-50' : 'text-slate-600'}`}
                                >
                                  Mark as {status}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
            <button 
              onClick={() => setSelectedOrder(null)} 
              className="absolute top-6 right-6 p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400 z-10"
            >
              <XCircle size={24} />
            </button>

            <div className="p-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
                  <Package className="text-blue-600" size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Order Details</h3>
                  <p className="text-slate-500">Order ID: <span className="font-mono font-bold text-blue-600 uppercase">#{selectedOrder.id}</span></p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Customer Info</h4>
                  <p className="font-bold text-slate-900">{selectedOrder.user.firstName} {selectedOrder.user.lastName}</p>
                  <p className="text-sm text-slate-500">{selectedOrder.user.email}</p>
                  <p className="text-xs text-slate-400 mt-2 uppercase font-bold">Shipping Address</p>
                  <p className="text-sm text-slate-700">{selectedOrder.shippingAddress || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Order Management</h4>
                  <div className="flex flex-col gap-3">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border w-fit ${getStatusColor(selectedOrder.status)}`}>
                        {getStatusIcon(selectedOrder.status)}
                        {selectedOrder.status}
                    </span>
                    
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Tracking Number</label>
                      <div className="flex gap-2">
                        <input 
                          type="text"
                          placeholder="Enter tracking ID..."
                          className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500"
                          defaultValue={selectedOrder.trackingNumber || ''}
                          id="tracking-input"
                        />
                        <button 
                          onClick={() => {
                            const val = document.getElementById('tracking-input').value;
                            handleStatusChange(selectedOrder.id, selectedOrder.status, val);
                          }}
                          className="px-3 py-1.5 bg-blue-600 text-white text-[10px] font-bold rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Update
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-8 mb-8 overflow-y-auto max-h-60 pr-2 custom-scrollbar">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Items Summary</h4>
                <div className="space-y-4">
                  {selectedOrder.orderItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-50 rounded-xl overflow-hidden flex-shrink-0">
                        <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-contain" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{item.product.name}</p>
                        <p className="text-xs text-slate-500">Qty: {item.quantity} × ₹{parseFloat(item.price).toLocaleString()}</p>
                      </div>
                      <div className="text-sm font-bold text-slate-900 whitespace-nowrap">
                        ₹{(item.quantity * parseFloat(item.price)).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 font-medium">Total Amount to Pay</p>
                  <p className="text-2xl font-black text-slate-900">₹{parseFloat(selectedOrder.totalAmount).toLocaleString()}</p>
                </div>
                <div className="flex gap-2">
                   <button 
                     onClick={() => window.print()}
                     className="px-6 py-2 bg-white border border-slate-200 rounded-xl font-bold text-sm shadow-sm hover:bg-slate-50 transition-all active:scale-95"
                   >
                     Print Invoice
                   </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersManagementPage;
