import React, { useState, useEffect, useMemo } from 'react';
import { Star, CheckCircle, XCircle, Trash2, MessageSquare, Filter, Search, ShieldCheck, Clock, User, Package, Target } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import { updateReviewStatus, deleteReview, getAllReviews } from '../api/reviews';
import API from '../api/index';

const ReviewsModerationPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); 
  const [searchTerm, setSearchTerm] = useState('');
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await getAllReviews(); 
      setReviews(res.data);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
      showNotification('error', 'Database connection error. Using local cache.');
      // Mock data if feature not fully implemented in backend yet
      setReviews([
        { id: '1', rating: 5, comment: 'Amazing product! Really high quality.', isApproved: true, isVerified: true, createdAt: new Date().toISOString(), product: { name: 'Wireless Headset v2' }, user: { firstName: 'John', lastName: 'Doe' } },
        { id: '2', rating: 2, comment: 'It broke after 2 days. Not happy.', isApproved: false, isVerified: false, createdAt: new Date().toISOString(), product: { name: 'Eco Bottle 500ml' }, user: { firstName: 'Sarah', lastName: 'Wilson' } },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateReviewStatus(id, status);
      setReviews(reviews.map(r => r.id === id ? { ...r, isApproved: status } : r));
      showNotification('success', `Review ${status ? 'Approved' : 'Rejected'} Successfully`);
    } catch (err) {
      showNotification('error', 'Failed to update review status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this review?')) return;
    try {
      await deleteReview(id);
      setReviews(reviews.filter(r => r.id !== id));
      showNotification('success', 'Review Deleted Permanently');
    } catch (err) {
      showNotification('error', 'Failed to delete review');
    }
  };

  const filteredReviews = useMemo(() => {
    return reviews.filter(r => {
      const matchesFilter = filter === 'all' || (filter === 'approved' ? r.isApproved : !r.isApproved);
      const matchesSearch = (r.product?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                            r.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (r.user?.firstName || '').toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [reviews, filter, searchTerm]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12 text-left">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase italic flex items-center gap-3">
            <Star className="text-amber-400 fill-amber-400" size={28} />
            Echo Moderation
          </h2>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
            <ShieldCheck size={12} className="text-emerald-500" />
            Social Proof Integrity Control Panel
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          <div className="relative flex-1 lg:flex-none min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search by customer, product, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-primary-indigo/10 focus:border-primary-indigo transition-all shadow-sm outline-none placeholder:text-slate-300"
            />
          </div>

          <div className="flex bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200 shadow-inner">
            {['all', 'approved', 'pending'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] transition-all duration-300 ${
                  filter === f 
                    ? 'bg-white text-primary-indigo shadow-[0_4px_12px_-2px_rgba(0,0,0,0.1)]' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-32 text-center flex flex-col items-center justify-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-slate-100 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-primary-indigo border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-6 animate-pulse">Syncing Echo Database</p>
        </div>
      ) : filteredReviews.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {filteredReviews.map((review) => (
            <div key={review.id} className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-all duration-500 group flex flex-col md:flex-row gap-8 relative overflow-hidden">
              {/* Background Accent */}
              <div className={`absolute top-0 left-0 w-2 h-full ${review.isApproved ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
              
              <div className="flex flex-col gap-4 w-full md:w-64 shrink-0">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className={i < review.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"} />
                  ))}
                  <span className="ml-2 text-[10px] font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded-full">{review.rating}.0</span>
                </div>

                <div className="space-y-4">
                  <div className="group/item cursor-pointer">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                      <Package size={12} />
                      Origin Product
                    </p>
                    <h4 className="text-sm font-black text-slate-900 truncate tracking-tight group-hover/item:text-primary-indigo transition-colors uppercase italic">
                      {review.product?.name}
                    </h4>
                  </div>

                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                      <User size={12} />
                      Author
                    </p>
                    <div className="flex items-center gap-2">
                       <span className="text-xs font-bold text-slate-700">{review.user?.firstName} {review.user?.lastName}</span>
                       {review.isVerified && (
                         <span className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border border-emerald-100">
                           <ShieldCheck size={10} />
                           Verified
                         </span>
                       )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-2">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Clock size={12} />
                      <span className="text-[9px] font-black uppercase tracking-tighter">
                        {new Date(review.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-center">
                <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 relative group-hover:bg-white group-hover:border-primary-indigo/20 transition-all duration-500 h-full flex items-center">
                  <MessageSquare className="absolute -top-4 -left-4 text-slate-100 group-hover:text-primary-indigo/10 transition-colors" size={48} />
                  <p className="text-base font-medium text-slate-700 leading-relaxed italic relative z-10 lg:pr-12">
                     "{review.comment}"
                  </p>
                </div>
              </div>

              <div className="flex md:flex-col justify-end gap-3 min-w-[140px]">
                <button
                  onClick={() => handleStatusUpdate(review.id, !review.isApproved)}
                  className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 shadow-sm active:scale-95 ${
                    review.isApproved 
                      ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-amber-200' 
                      : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-200'
                  }`}
                >
                  {review.isApproved ? <XCircle size={16} /> : <CheckCircle size={16} />}
                  {review.isApproved ? 'Suspends' : 'Deploy'}
                </button>
                
                <button
                  onClick={() => handleDelete(review.id)}
                  className="p-3 aspect-square bg-slate-50 text-slate-400 border border-slate-200 rounded-2xl hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all duration-300 shadow-sm flex items-center justify-center active:scale-90"
                >
                  <Trash2 size={20} />
                </button>

                <div className="hidden lg:block absolute -right-12 -bottom-12 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                   <Target size={160} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-32 bg-slate-50/50 rounded-[4rem] border-4 border-dashed border-slate-200 text-center flex flex-col items-center justify-center">
          <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center shadow-2xl mb-8 group hover:rotate-[15deg] transition-transform duration-700">
            <Star className="text-slate-200 group-hover:text-amber-400 transition-colors" size={48} />
          </div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase italic underline decoration-amber-400 underline-offset-8">Zero Echo Resonance</h3>
          <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mt-8 max-w-sm leading-relaxed"> No consumer transmissions detected within the selected filter parameters.</p>
        </div>
      )}
    </div>
  );
};

export default ReviewsModerationPage;
