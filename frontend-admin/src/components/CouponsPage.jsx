import { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit2, Trash2, Ticket, X, 
  CheckCircle2, AlertCircle, Calendar, Percent, 
  Banknote, Info, BarChart3
} from 'lucide-react';
import { getCoupons, createCoupon, updateCoupon, deleteCoupon } from '../api/coupons';

const CouponsPage = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentCoupon, setCurrentCoupon] = useState(null);
    const [formData, setFormData] = useState({ 
      code: '', 
      type: 'PERCENTAGE', 
      value: '', 
      minAmount: '0', 
      usageLimit: '', 
      expiryDate: '' 
    });
    const [submitting, setSubmitting] = useState(false);
    const [notification, setNotification] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        setLoading(true);
        try {
            const res = await getCoupons();
            setCoupons(res.data);
        } catch (err) {
            showNotification('error', err.response?.data?.message || 'Failed to fetch coupons');
        } finally {
            setLoading(false);
        }
    };

    const showNotification = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3000);
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.code.trim()) newErrors.code = 'Coupon code is required';
        if (!formData.value || isNaN(formData.value) || Number(formData.value) <= 0) {
            newErrors.value = 'Valid value is required';
        }
        if (!formData.expiryDate) newErrors.expiryDate = 'Expiry date is required';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            showNotification('error', 'Please fill all required fields correctly');
            return;
        }

        const payload = {
            ...formData,
            value: Number(formData.value),
            minAmount: Number(formData.minAmount),
            usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
            expiryDate: new Date(formData.expiryDate).toISOString()
        };

        setSubmitting(true);
        try {
            if (currentCoupon) {
                await updateCoupon(currentCoupon.id, payload);
                showNotification('success', 'Coupon updated successfully');
            } else {
                await createCoupon(payload);
                showNotification('success', 'Coupon created successfully');
            }
            setIsModalOpen(false);
            setFormData({ code: '', type: 'PERCENTAGE', value: '', minAmount: '0', usageLimit: '', expiryDate: '' });
            fetchCoupons();
        } catch (err) {
            const backendMessage = err.response?.data?.message;
            const errorMessage = Array.isArray(backendMessage) ? backendMessage.join(', ') : (backendMessage || 'Failed to save coupon');
            showNotification('error', errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this coupon?')) return;
        try {
            await deleteCoupon(id);
            showNotification('success', 'Coupon deleted successfully');
            fetchCoupons();
        } catch (err) {
            showNotification('error', err.response?.data?.message || 'Failed to delete coupon');
        }
    };

    const openEdit = (coupon) => {
        setCurrentCoupon(coupon);
        setFormData({
            code: coupon.code,
            type: coupon.type,
            value: coupon.value.toString(),
            minAmount: coupon.minAmount.toString(),
            usageLimit: coupon.usageLimit ? coupon.usageLimit.toString() : '',
            expiryDate: new Date(coupon.expiryDate).toISOString().split('T')[0]
        });
        setIsModalOpen(true);
    };

    const filteredCoupons = coupons.filter(c => 
        c.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const isExpired = (expiryDate) => new Date() > new Date(expiryDate);

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10 text-left">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-text-main tracking-tight flex items-center gap-2">
                      <Ticket className="text-accent-blue" /> Promotions
                    </h1>
                    <p className="text-text-muted text-sm font-medium">Create and manage storefront discount coupons.</p>
                </div>
                <button 
                    onClick={() => {
                        setCurrentCoupon(null);
                        setFormData({ code: '', type: 'PERCENTAGE', value: '', minAmount: '0', usageLimit: '', expiryDate: '' });
                        setIsModalOpen(true);
                        setErrors({});
                    }}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-accent-blue text-white rounded-lg text-sm font-bold hover:shadow-lg transition-all active:scale-95"
                >
                    <Plus size={18} /> New Coupon
                </button>
            </div>

            {/* Notification */}
            {notification && (
                <div className={`fixed top-6 right-6 z-[300] px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-300 border ${
                    notification.type === 'success' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                        : 'bg-red-50 text-red-700 border-red-100'
                    }`}>
                    {notification.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                    <div className="text-sm font-semibold">{notification.message}</div>
                </div>
            )}

            {/* Content Strip */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
                <div className="relative w-full md:w-96 group text-left">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search coupon codes..."
                        className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-accent-blue/10 focus:border-accent-blue outline-none transition-all font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto text-left">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-wider text-left">Coupon Info</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-wider text-left">Benefit</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-wider text-center">Usage</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-wider text-left">Validity</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                Array(3).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded-full w-32"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded-full w-24"></div></td>
                                        <td className="px-6 py-4 text-center"><div className="h-4 bg-slate-100 rounded-full w-16 mx-auto"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded-full w-32"></div></td>
                                        <td className="px-6 py-4 text-right"><div className="h-8 bg-slate-100 rounded-lg w-16 ml-auto"></div></td>
                                    </tr>
                                ))
                            ) : filteredCoupons.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-12 text-center text-slate-400 font-medium text-sm">No promotions found matching your search.</td>
                                </tr>
                            ) : filteredCoupons.map((coupon) => (
                                <tr key={coupon.id} className="hover:bg-slate-50/50 transition-all border-b border-slate-100 last:border-0 grow-on-hover">
                                    <td className="px-6 py-4">
                                        <div className="font-black text-primary-900 text-sm tracking-wider uppercase">{coupon.code}</div>
                                        <div className="text-[10px] font-bold text-slate-400 mt-1 flex items-center gap-1">
                                          <Calendar size={10} /> Created: {new Date(coupon.createdAt).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                          {coupon.type === 'PERCENTAGE' ? (
                                            <div className="p-1.5 bg-sky-50 text-sky-600 rounded-lg"><Percent size={14} /></div>
                                          ) : (
                                            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg"><Banknote size={14} /></div>
                                          )}
                                          <div>
                                            <div className="text-sm font-bold text-text-main">
                                              {coupon.type === 'PERCENTAGE' ? `${coupon.value}% OFF` : `₹${coupon.value} OFF`}
                                            </div>
                                            <div className="text-[10px] font-bold text-text-muted italic">Min. Spend: ₹{coupon.minAmount}</div>
                                          </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex flex-col items-center gap-1">
                                          <div className="flex items-center gap-2 text-xs font-black text-primary-900">
                                            <BarChart3 size={12} className="text-accent-blue" />
                                            {coupon.usedCount} {coupon.usageLimit ? `/ ${coupon.usageLimit}` : 'Used'}
                                          </div>
                                          {coupon.usageLimit && (
                                            <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                              <div 
                                                className={`h-full transition-all duration-500 rounded-full ${
                                                  (coupon.usedCount / coupon.usageLimit) > 0.8 ? 'bg-red-500' : 'bg-accent-blue'
                                                }`} 
                                                style={{ width: `${Math.min(100, (coupon.usedCount / coupon.usageLimit) * 100)}%` }}
                                              ></div>
                                            </div>
                                          )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                          isExpired(coupon.expiryDate) 
                                            ? 'bg-red-50 text-red-600 border-red-100' 
                                            : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                        }`}>
                                          {isExpired(coupon.expiryDate) ? 'EXPIRED' : 'ACTIVE'}
                                        </div>
                                        <div className="text-[10px] font-bold text-text-muted mt-1.5 ml-0.5">
                                          Until {new Date(coupon.expiryDate).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                onClick={() => openEdit(coupon)}
                                                className="p-2 text-slate-400 hover:text-accent-blue hover:bg-slate-100 rounded-lg transition-all"
                                                title="Edit promotion"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(coupon.id)}
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                title="Delete promotion"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[400] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                            <div>
                                <h2 className="text-xl font-black text-primary-900 uppercase tracking-tight">
                                    {currentCoupon ? 'Refine Promotion' : 'Configure New Coupon'}
                                </h2>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Define redemption logic below.</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-all text-slate-400">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-8 bg-white text-left max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Coupon Code</label>
                                    <input 
                                        type="text" 
                                        placeholder="E.G. NEWYEAR2024"
                                        className={`w-full px-4 py-3 bg-slate-50 border ${errors.code ? 'border-red-500' : 'border-slate-100'} rounded-xl text-sm focus:ring-4 focus:ring-accent-blue/5 focus:border-accent-blue outline-none transition-all font-black uppercase tracking-wider`}
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    />
                                    {errors.code && <p className="text-[10px] text-red-500 font-black ml-1 uppercase">{errors.code}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Discount Type</label>
                                    <select 
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-4 focus:ring-accent-blue/5 focus:border-accent-blue outline-none transition-all font-bold"
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    >
                                        <option value="PERCENTAGE">Percentage (%)</option>
                                        <option value="FIXED">Flat Discount (₹)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Discount Value</label>
                                    <div className="relative">
                                      <input 
                                          type="number" 
                                          placeholder={formData.type === 'PERCENTAGE' ? "20" : "500"}
                                          className={`w-full px-4 py-3 bg-slate-50 border ${errors.value ? 'border-red-500' : 'border-slate-100'} rounded-xl text-sm focus:ring-4 focus:ring-accent-blue/5 focus:border-accent-blue outline-none transition-all font-black`}
                                          value={formData.value}
                                          onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                      />
                                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xs">
                                        {formData.type === 'PERCENTAGE' ? '%' : '₹'}
                                      </div>
                                    </div>
                                    {errors.value && <p className="text-[10px] text-red-500 font-black ml-1 uppercase">{errors.value}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Minimum Spend</label>
                                    <div className="relative">
                                      <input 
                                          type="number" 
                                          placeholder="1000"
                                          className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-4 focus:ring-accent-blue/5 focus:border-accent-blue outline-none transition-all font-black"
                                          value={formData.minAmount}
                                          onChange={(e) => setFormData({ ...formData, minAmount: e.target.value })}
                                      />
                                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xs text-left">₹</div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Usage Limit (Optional)</label>
                                    <input 
                                        type="number" 
                                        placeholder="No Limit"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-4 focus:ring-accent-blue/5 focus:border-accent-blue outline-none transition-all font-black"
                                        value={formData.usageLimit}
                                        onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                                    />
                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight ml-1">Leave empty for unlimited</p>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Expiration Date</label>
                                    <input 
                                        type="date" 
                                        className={`w-full px-4 py-3 bg-slate-50 border ${errors.expiryDate ? 'border-red-500' : 'border-slate-100'} rounded-xl text-sm focus:ring-4 focus:ring-accent-blue/5 focus:border-accent-blue outline-none transition-all font-bold`}
                                        value={formData.expiryDate}
                                        min={new Date().toISOString().split('T')[0]}
                                        onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                                    />
                                    {errors.expiryDate && <p className="text-[10px] text-red-500 font-black ml-1 uppercase">{errors.expiryDate}</p>}
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4 sticky bottom-0 bg-white pb-2">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-200 transition-all active:scale-95">Cancel</button>
                                <button type="submit" disabled={submitting} className="flex-[2] py-4 bg-accent-blue text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:shadow-2xl transition-all active:scale-95 disabled:opacity-50">
                                    {submitting ? 'Authenticating...' : (currentCoupon ? 'Confirm Updates' : 'Publish Coupon')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CouponsPage;
