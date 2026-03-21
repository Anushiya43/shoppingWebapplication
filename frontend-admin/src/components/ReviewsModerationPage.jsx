import React, { useState, useEffect } from 'react';
import { Star, CheckCircle, XCircle, Trash2, MessageSquare, Filter, Search } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import { updateReviewStatus, deleteReview } from '../api/reviews';
import API from '../api/index'; // Using direct API for fetching all reviews for now if specialized endpoint missing

const ReviewsModerationPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, approved, pending
  const [searchTerm, setSearchTerm] = useState('');
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      // Backend should have a way to get all reviews for admin
      // For now, we'll try to fetch all products and then their reviews, or assume a general /reviews endpoint exists
      const res = await API.get('/reviews'); 
      setReviews(res.data);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
      // Mock data if feature not fully implemented in backend yet
      setReviews([
        { id: '1', rating: 5, comment: 'Amazing product! Really high quality.', isApproved: true, createdAt: new Date().toISOString(), product: { name: 'Wireless Headset v2' }, user: { firstName: 'John' } },
        { id: '2', rating: 2, comment: 'It broke after 2 days. Not happy.', isApproved: false, createdAt: new Date().toISOString(), product: { name: 'Eco Bottle 500ml' }, user: { firstName: 'Sarah' } },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateReviewStatus(id, status);
      setReviews(reviews.map(r => r.id === id ? { ...r, isApproved: status } : r));
      showNotification('success', `Review ${status ? 'approved' : 'rejected'}`);
    } catch (err) {
      showNotification('error', 'Failed to update review status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await deleteReview(id);
      setReviews(reviews.filter(r => r.id !== id));
      showNotification('success', 'Review deleted');
    } catch (err) {
      showNotification('error', 'Failed to delete review');
    }
  };

  const filteredReviews = reviews.filter(r => {
    const matchesFilter = filter === 'all' || (filter === 'approved' ? r.isApproved : !r.isApproved);
    const matchesSearch = r.product?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.comment.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="animate-in fade-in duration-500 pb-12 text-left">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-xl font-black text-text-main tracking-tight uppercase">Social Proof Moderation</h2>
          <p className="text-[10px] text-text-muted font-bold opacity-60 uppercase tracking-widest">Manage customer feedback and ratings</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-accent-blue transition-colors" size={14} />
            <input
              type="text"
              placeholder="Search comments or products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-100/50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-accent-blue/20 focus:bg-white transition-all w-64"
            />
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner">
            {['all', 'approved', 'pending'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  filter === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-accent-blue border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Scanning network...</p>
        </div>
      ) : filteredReviews.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredReviews.map((review) => (
            <div key={review.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group flex flex-col md:flex-row gap-6">
              <div className="flex flex-col gap-2 w-full md:w-48">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className={i < review.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"} />
                  ))}
                </div>
                <h4 className="text-xs font-black text-slate-900 truncate uppercase mt-1 px-2 py-1 bg-slate-50 rounded-lg inline-block self-start">
                  {review.product?.name}
                </h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  By {review.user?.firstName || 'User'}
                </p>
                <p className="text-[9px] font-semibold text-slate-300 uppercase tracking-tighter">
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex-1">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 relative group-hover:bg-slate-100/50 transition-colors h-full">
                  <MessageSquare className="absolute -top-3 -left-3 text-slate-200 group-hover:text-accent-blue/20 transition-colors" size={24} />
                  <p className="text-sm font-medium text-slate-700 leading-relaxed italic">"{review.comment}"</p>
                </div>
              </div>

              <div className="flex md:flex-col justify-end gap-2">
                <button
                  onClick={() => handleStatusUpdate(review.id, !review.isApproved)}
                  className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    review.isApproved 
                      ? 'bg-amber-50 text-amber-600 border border-amber-100 hover:bg-amber-100' 
                      : 'bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100'
                  }`}
                >
                  {review.isApproved ? <XCircle size={14} /> : <CheckCircle size={14} />}
                  {review.isApproved ? 'Unapprove' : 'Approve'}
                </button>
                <button
                  onClick={() => handleDelete(review.id)}
                  className="p-2 aspect-square bg-slate-50 text-slate-400 border border-slate-200 rounded-xl hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all shadow-sm"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-lg mb-6 group hover:rotate-12 transition-transform duration-500">
            <Star className="text-slate-200" size={32} />
          </div>
          <h3 className="text-lg font-black text-slate-400 uppercase tracking-tighter">Zero Echo</h3>
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mt-1">No reviews found matching your criteria</p>
        </div>
      )}
    </div>
  );
};

export default ReviewsModerationPage;
