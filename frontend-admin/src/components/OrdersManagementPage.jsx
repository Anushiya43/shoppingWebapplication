import React, { useState, useEffect } from 'react';
import { getAllOrders, updateOrderStatus } from '../api/orders';
import { 
  Search, Filter, ChevronRight, Package, 
  Clock, Truck, CheckCircle, XCircle, 
  Eye, MoreVertical, ExternalLink, Download,
  Calendar as CalendarIcon, RotateCcw, CreditCard, CheckCircle2
} from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

const OrdersManagementPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { showNotification } = useNotification();
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const res = await getAllOrders();
            setOrders(res.data);
        } catch (err) {
            console.error('Failed to fetch orders:', err);
            showNotification('error', 'Failed to load orders. Please check if the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleStatusChange = async (orderId, newStatus, trackingNumber, paymentStatus) => {
        try {
            const updateData = {};
            if (newStatus) updateData.status = newStatus;
            if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;
            if (paymentStatus) updateData.paymentStatus = paymentStatus;
            
            await updateOrderStatus(orderId, updateData);
            
            // Update local state to reflect change immediately
            setOrders(orders.map(order => 
                order.id === orderId ? { ...order, ...updateData } : order
            ));
            if (selectedOrder && selectedOrder.id === orderId) {
                setSelectedOrder({ ...selectedOrder, ...updateData });
            }
            showNotification('success', 'Order status updated successfully');
        } catch (err) {
            console.error('Failed to update status:', err);
            showNotification('error', err.response?.data?.message || 'Failed to update order status');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'CONFIRMED': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'SHIPPED': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
            case 'DELIVERED': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'CANCELLED': return 'bg-red-50 text-red-600 border-red-100';
            default: return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = 
            order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            `${order.user.firstName} ${order.user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
        
        const orderDate = new Date(order.createdAt).setHours(0,0,0,0);
        const start = startDate ? new Date(startDate).setHours(0,0,0,0) : null;
        const end = endDate ? new Date(endDate).setHours(23,59,59,999) : null;
        
        const matchesDate = (!start || orderDate >= start) && (!end || orderDate <= end);
        
        return matchesSearch && matchesStatus && matchesDate;
    });

    const exportToCSV = () => {
        const headers = ['Order ID', 'Customer', 'Email', 'Total Amount', 'Status', 'Payment Method', 'Payment Status', 'Date', 'Shipping Address'];
        const csvContent = [
            headers.join(','),
            ...filteredOrders.map(order => [
                order.id,
                `"${order.user.firstName} ${order.user.lastName}"`,
                order.user.email,
                order.totalAmount,
                order.status,
                order.paymentMethod || 'COD',
                order.paymentStatus || 'PENDING',
                new Date(order.createdAt).toLocaleDateString(),
                `"${order.shippingAddress || 'N/A'}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `orders_report_${new Date().toISOString().slice(0,10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const resetFilters = () => {
        setSearchTerm('');
        setStatusFilter('ALL');
        setStartDate('');
        setEndDate('');
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10 text-left">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-text-main tracking-tight">Order Management</h1>
                    <p className="text-text-muted text-sm font-medium">Monitor and process customer transactions.</p>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-4 items-end justify-between mb-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 w-full">
                    <div className="space-y-1.5 text-left">
                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Search Details</label>
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input 
                                type="text"
                                placeholder="ID, email, or name..."
                                className="w-full pl-11 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:ring-2 focus:ring-accent-blue/10 focus:border-accent-blue outline-none transition-all font-semibold"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5 text-left">
                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Status Filter</label>
                        <div className="relative">
                            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                            <select 
                                className="w-full pl-11 pr-10 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:ring-2 focus:ring-accent-blue/10 focus:border-accent-blue outline-none transition-all font-bold text-text-main appearance-none cursor-pointer"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="ALL">All Statuses</option>
                                <option value="PENDING">Pending</option>
                                <option value="CONFIRMED">Confirmed</option>
                                <option value="SHIPPED">Shipped</option>
                                <option value="DELIVERED">Delivered</option>
                                <option value="CANCELLED">Cancelled</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1.5 text-left">
                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">From Date</label>
                        <div className="relative">
                            <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                            <input 
                                type="date"
                                className="w-full pl-11 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-bold outline-none focus:ring-2 focus:ring-accent-blue/10 focus:border-accent-blue transition-all"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5 text-left">
                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">To Date</label>
                        <div className="relative">
                            <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                            <input 
                                type="date"
                                className="w-full pl-11 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-bold outline-none focus:ring-2 focus:ring-accent-blue/10 focus:border-accent-blue transition-all"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 min-w-fit mt-4 lg:mt-0">
                    <button 
                        onClick={resetFilters}
                        className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all active:scale-95"
                        title="Reset Filters"
                    >
                        <RotateCcw size={16} />
                    </button>
                    <button 
                        onClick={exportToCSV}
                        className="flex items-center gap-2 px-5 py-2.5 bg-accent-blue text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all active:scale-95 shadow-lg shadow-blue-500/20"
                    >
                        <Download size={14} /> Export Report
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin w-8 h-8 border-4 border-accent-blue border-t-transparent rounded-full"></div>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto text-left">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-wider">Order ID</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-wider">Total</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-wider">Payment</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-slate-400 font-medium text-sm">
                                            No orders found matching your criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredOrders.map((order) => (
                                        <tr key={order.id} className="hover:bg-slate-50/50 transition-all border-b border-slate-100 last:border-0 group">
                                            <td className="px-6 py-5">
                                                <span className="font-mono text-xs font-bold text-slate-400 tracking-tight uppercase">#{order.id.slice(-8)}</span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-text-main text-sm">{order.user.firstName} {order.user.lastName}</span>
                                                    <span className="text-[10px] font-semibold text-text-muted mt-0.5">{order.user.email}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="font-bold text-text-main text-sm">₹{parseFloat(order.totalAmount).toLocaleString()}</span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-text-main uppercase tracking-tight">{order.paymentMethod || 'COD'}</span>
                                                    <span className={`text-[9px] font-bold uppercase ${
                                                        order.paymentStatus === 'PAID' ? 'text-emerald-500' : 
                                                        order.paymentStatus === 'FAILED' ? 'text-red-500' : 
                                                        'text-amber-500'
                                                    }`}>{order.paymentStatus || 'PENDING'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold border ${getStatusColor(order.status)}`}>
                                                    <div className={`w-1 h-1 rounded-full ${
                                                        order.status === 'PENDING' ? 'bg-amber-500' : 
                                                        order.status === 'SHIPPED' ? 'bg-indigo-500' :
                                                        order.status === 'DELIVERED' ? 'bg-emerald-500' :
                                                        'bg-slate-400'
                                                    }`}></div>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 font-medium text-text-muted text-xs">
                                                {new Date(order.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <div className="flex items-center justify-end gap-2 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button 
                                                        onClick={() => setSelectedOrder(order)}
                                                        className="p-2 text-slate-400 hover:text-accent-blue hover:bg-slate-100 rounded-lg transition-all"
                                                        title="View Details"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    <div className="relative group/menu">
                                                        <button 
                                                            className="p-2 text-slate-400 hover:text-text-main hover:bg-slate-100 rounded-lg transition-all"
                                                        >
                                                            <MoreVertical size={18} />
                                                        </button>
                                                        <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-xl opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-20 overflow-hidden text-left">
                                                            <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 italic text-[9px] font-black text-slate-400 uppercase tracking-widest">Update Order</div>
                                                            {['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(status => (
                                                                <button
                                                                    key={status}
                                                                    onClick={() => handleStatusChange(order.id, status)}
                                                                    className={`w-full text-left px-4 py-2 text-[10px] font-bold uppercase tracking-wider hover:bg-slate-50 transition-colors ${order.status === status ? 'text-accent-blue bg-blue-50/50' : 'text-text-muted'}`}
                                                                >
                                                                    Set to {status}
                                                                </button>
                                                            ))}
                                                            <div className="px-4 py-2 bg-slate-50 border-y border-slate-100 italic text-[9px] font-black text-slate-400 uppercase tracking-widest">Update Payment</div>
                                                            <button
                                                                onClick={() => handleStatusChange(order.id, undefined, undefined, 'PAID')}
                                                                className={`w-full text-left px-4 py-2 text-[10px] font-bold uppercase tracking-wider hover:bg-emerald-50 hover:text-emerald-600 transition-colors ${order.paymentStatus === 'PAID' ? 'text-emerald-600 bg-emerald-50' : 'text-text-muted'}`}
                                                            >
                                                                Mark as Paid
                                                            </button>
                                                            <button
                                                                onClick={() => handleStatusChange(order.id, undefined, undefined, 'PENDING')}
                                                                className={`w-full text-left px-4 py-2 text-[10px] font-bold uppercase tracking-wider hover:bg-amber-50 hover:text-amber-600 transition-colors ${order.paymentStatus === 'PENDING' ? 'text-amber-600 bg-amber-50' : 'text-text-muted'}`}
                                                            >
                                                                Mark as Pending
                                                            </button>
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
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[400] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-text-main">Order Details</h2>
                                <p className="text-xs text-text-muted font-medium mt-0.5 uppercase tracking-wider">Ref ID: {selectedOrder.id}</p>
                            </div>
                            <button 
                                onClick={() => setSelectedOrder(null)} 
                                className="p-2 hover:bg-slate-50 rounded-lg transition-all text-slate-400"
                            >
                                <XCircle size={24} />
                            </button>
                        </div>

                        <div className="p-8 overflow-y-auto bg-white text-left">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                <div className="space-y-4">
                                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                                        <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-3">Customer Information</h4>
                                        <div className="space-y-1">
                                            <p className="font-bold text-text-main text-base">{selectedOrder.user.firstName} {selectedOrder.user.lastName}</p>
                                            <p className="text-xs font-semibold text-accent-blue">{selectedOrder.user.email}</p>
                                        </div>
                                        <div className="mt-6 pt-4 border-t border-slate-200/50">
                                            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-2">Shipping Address</label>
                                            <p className="text-xs font-medium text-text-main leading-relaxed">{selectedOrder.shippingAddress || 'No address provided'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 h-full">
                                        <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-3">Logistics & Payment</h4>
                                        <div className="flex flex-col gap-5">
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-0.5">Order Status</label>
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold border w-fit ${getStatusColor(selectedOrder.status)}`}>
                                                    <div className={`w-1 h-1 rounded-full ${
                                                        selectedOrder.status === 'PENDING' ? 'bg-amber-500 animate-pulse' : 
                                                        selectedOrder.status === 'SHIPPED' ? 'bg-indigo-500' :
                                                        selectedOrder.status === 'DELIVERED' ? 'bg-emerald-500' :
                                                        'bg-slate-400'
                                                    }`}></div>
                                                    {selectedOrder.status}
                                                </span>
                                            </div>

                                            <div className="flex flex-col gap-1.5 pt-4 border-t border-slate-200/50">
                                                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-0.5">Payment Details</label>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <CreditCard size={14} className="text-slate-400" />
                                                        <span className="text-xs font-bold text-text-main">{selectedOrder.paymentMethod || 'COD'}</span>
                                                    </div>
                                                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${
                                                        selectedOrder.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 
                                                        selectedOrder.paymentStatus === 'FAILED' ? 'bg-red-100 text-red-700' : 
                                                        'bg-amber-100 text-amber-700'
                                                    }`}>
                                                        {selectedOrder.paymentStatus || 'PENDING'}
                                                    </span>
                                                </div>
                                                
                                                {selectedOrder.paymentStatus !== 'PAID' && (
                                                    <button 
                                                        onClick={() => handleStatusChange(selectedOrder.id, undefined, undefined, 'PAID')}
                                                        className="mt-3 flex items-center justify-center gap-2 w-full py-2 bg-emerald-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-700 transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
                                                    >
                                                        <CheckCircle2 size={14} /> Mark as Paid
                                                    </button>
                                                )}
                                                {selectedOrder.paymentStatus === 'PAID' && (
                                                    <button 
                                                        onClick={() => handleStatusChange(selectedOrder.id, undefined, undefined, 'PENDING')}
                                                        className="mt-3 flex items-center justify-center gap-2 w-full py-2 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95 border border-slate-200"
                                                    >
                                                        <RotateCcw size={14} /> Revert to Pending
                                                    </button>
                                                )}
                                            </div>
                                            
                                            {/* Tracking Number Disabled ... */}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-10">
                                <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-4">Order Items</h4>
                                <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                    {selectedOrder.orderItems.map((item) => (
                                        <div key={item.id} className="flex items-center gap-4 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                                            <div className="w-12 h-12 bg-white rounded-lg flex-shrink-0 border border-slate-100 p-1">
                                                <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-contain" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-text-main truncate">{item.product.name}</p>
                                                <p className="text-[10px] font-semibold text-text-muted mt-0.5">
                                                    Qty: {item.quantity} × ₹{parseFloat(item.price).toLocaleString()}
                                                </p>
                                            </div>
                                            <div className="text-sm font-bold text-text-main">
                                                ₹{(item.quantity * parseFloat(item.price)).toLocaleString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-slate-900 rounded-xl p-8 flex flex-col md:flex-row items-center justify-between text-white shadow-lg">
                                <div className="text-center md:text-left mb-4 md:mb-0">
                                    <p className="text-[10px] font-bold uppercase tracking-wider opacity-60 mb-1">Total Amount</p>
                                    <p className="text-3xl font-bold tracking-tight">₹{parseFloat(selectedOrder.totalAmount).toLocaleString()}</p>
                                </div>
                                <button 
                                    onClick={() => window.print()}
                                    className="flex items-center gap-2 px-6 py-3 bg-white text-slate-900 rounded-lg font-bold uppercase tracking-wider text-[10px] hover:bg-slate-100 transition-all active:scale-95"
                                >
                                    <ExternalLink size={14} /> Print Invoice
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrdersManagementPage;
