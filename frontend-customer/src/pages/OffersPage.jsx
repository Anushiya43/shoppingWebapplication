import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Ticket, ArrowLeft, Copy, CheckCircle2, AlertCircle, ShoppingBag, Percent, Banknote } from 'lucide-react';
import { getActiveCoupons } from '../api/coupons';
import { useNotification } from '../context/NotificationContext';

const OffersPage = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const { showNotification } = useNotification();
    const navigate = useNavigate();

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        setLoading(true);
        try {
            const res = await getActiveCoupons();
            setCoupons(res.data);
        } catch (err) {
            console.error('Failed to fetch coupons', err);
            showNotification('Could not load current offers', 'error');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (code) => {
        navigator.clipboard.writeText(code);
        showNotification(`Code ${code} copied to clipboard!`, 'success');
    };

    return (
        <div className="min-h-screen bg-surface-bg font-sans pb-20">
            {/* Header */}
            <header className="bg-primary-900 text-white shadow-lg sticky top-0 z-50 h-16 flex items-center px-4 max-w-[1500px] mx-auto">
                <button 
                  onClick={() => navigate(-1)} 
                  className="p-2 hover:bg-white/10 rounded-full transition-all active:scale-90"
                >
                  <ArrowLeft size={24} />
                </button>
                <Link to="/" className="flex items-center gap-1 ml-4 lg:ml-0 lg:absolute lg:left-1/2 lg:-translate-x-1/2">
                    <div className="text-xl font-extrabold tracking-tight">
                        <span className="bg-gradient-to-r from-accent-cyan to-accent-blue bg-clip-text text-transparent">Modern</span>
                        <span className="text-white">Offers</span>
                    </div>
                </Link>
            </header>

            <main className="max-w-[1000px] mx-auto p-4 md:p-10 pt-12">
                <div className="text-center mb-16 space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-blue/10 text-accent-blue rounded-full text-xs font-black uppercase tracking-widest">
                        <Ticket size={14} /> Exclusive Savings
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-primary-900 italic tracking-tighter">
                        Active <span className="text-accent-blue not-italic">Promotions</span>
                    </h1>
                    <p className="text-text-muted font-medium max-w-md mx-auto">
                        Save more on your favorite premium products with our curated seasonal discounts and partner offers.
                    </p>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {[1, 2, 3, 4].map(n => (
                            <div key={n} className="h-64 bg-white rounded-[2.5rem] border border-gray-100 animate-pulse"></div>
                        ))}
                    </div>
                ) : coupons.length === 0 ? (
                    <div className="bg-white/50 backdrop-blur-sm rounded-[3rem] p-20 text-center border-2 border-dashed border-gray-200">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertCircle size={40} className="text-gray-400" />
                        </div>
                        <h2 className="text-2xl font-black text-primary-900 mb-2">No Active Offers</h2>
                        <p className="text-text-muted font-medium mb-8">Check back later for new seasonal promotions!</p>
                        <Link to="/" className="px-8 py-4 bg-primary-900 text-white rounded-2xl font-black text-sm hover:shadow-xl transition-all inline-flex items-center gap-2">
                            <ShoppingBag size={18} /> Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {coupons.map((coupon) => (
                            <div 
                                key={coupon.id} 
                                className="group relative bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:border-accent-blue/20 transition-all duration-500 overflow-hidden flex flex-col"
                            >
                                {/* Background Accent */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-accent-blue/5 rounded-full -mr-16 -mt-16 group-hover:bg-accent-blue/10 transition-colors duration-500"></div>
                                
                                <div className="p-8 relative flex-1">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={`p-4 rounded-3xl ${coupon.type === 'PERCENTAGE' ? 'bg-sky-50 text-sky-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                            {coupon.type === 'PERCENTAGE' ? <Percent size={28} /> : <Banknote size={28} />}
                                        </div>
                                        <div className="text-right">
                                            <div className="text-3xl font-black text-primary-900 tracking-tighter">
                                                {coupon.type === 'PERCENTAGE' ? `${coupon.value}%` : `₹${coupon.value}`}
                                                <span className="text-sm font-bold text-text-muted ml-1 uppercase block">Discount</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="inline-block px-3 py-1 bg-gray-50 text-text-muted rounded-lg text-[10px] font-black uppercase tracking-widest border border-gray-100">
                                            Valid Until {new Date(coupon.expiryDate).toLocaleDateString()}
                                        </div>
                                        <h3 className="text-xl font-bold text-primary-900 line-clamp-1">{coupon.type === 'PERCENTAGE' ? 'Percentage Savings' : 'Flat Cash Savings'}</h3>
                                        <p className="text-sm text-text-muted font-medium leading-relaxed">
                                            Applicable on all orders above <span className="text-primary-900 font-bold">₹{coupon.minAmount}</span>. 
                                            Limited to one use per customer.
                                        </p>
                                    </div>
                                </div>

                                <div className="px-8 pb-8 pt-4">
                                    <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100 group-hover:border-accent-blue/30 group-hover:bg-accent-blue/5 transition-all">
                                        <div className="flex-1">
                                            <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">Coupon Code</p>
                                            <p className="text-lg font-black text-primary-900 tracking-wider uppercase">{coupon.code}</p>
                                        </div>
                                        <button 
                                            onClick={() => copyToClipboard(coupon.code)}
                                            className="p-3 bg-white text-primary-900 rounded-xl hover:bg-primary-900 hover:text-white transition-all shadow-sm active:scale-90"
                                            title="Copy Code"
                                        >
                                            <Copy size={20} />
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="h-2 bg-gray-100 w-full relative">
                                    <div className="absolute inset-y-0 left-0 bg-accent-blue w-0 group-hover:w-full transition-all duration-700 ease-out"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                
                <div className="mt-20 p-10 bg-primary-900 rounded-[3rem] text-center text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 left-0 w-64 h-64 bg-white/20 rounded-full -ml-32 -mt-32 blur-3xl"></div>
                        <div className="absolute bottom-0 right-0 w-64 h-64 bg-accent-cyan/20 rounded-full -mr-32 -mb-32 blur-3xl"></div>
                    </div>
                    <h3 className="text-2xl font-black mb-4 relative z-10 italic">Ready to use your savings?</h3>
                    <p className="text-white/60 mb-8 max-w-md mx-auto font-medium relative z-10">Add premium items to your cart and apply your code during checkout for instant redemption.</p>
                    <Link to="/" className="px-10 py-5 bg-accent-blue text-white rounded-2xl font-black tracking-widest text-[11px] uppercase hover:shadow-2xl hover:bg-accent-cyan transition-all relative z-10 active:scale-95 flex items-center gap-3 mx-auto w-fit">
                        Explore Collections <ShoppingBag size={14} />
                    </Link>
                </div>
            </main>
        </div>
    );
};

export default OffersPage;
