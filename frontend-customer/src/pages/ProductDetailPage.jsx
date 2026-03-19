import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ShoppingCart, ArrowLeft, ShieldCheck,
  Truck, RotateCcw, Star, Minus, Plus,
  Package, Facebook, Twitter, MessageCircle
} from 'lucide-react';
import { useProduct } from '../hooks/useProduct';
import useCartStore from '../store/useCartStore';
import useAuthStore from '../store/useAuthStore';
import { useNotification } from '../context/NotificationContext';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  const addItem = useCartStore(state => state.addItem);
  const { showNotification } = useNotification();

  const { product, loading, error } = useProduct(id);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [mainImage, setMainImage] = useState(null);

  useEffect(() => {
    if (product) {
      setMainImage(product.imageUrl);
    }
  }, [product]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-bg flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-900 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-bold text-primary-900 animate-pulse uppercase tracking-widest text-xs">Loading Experience...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-surface-bg flex flex-col items-center justify-center p-8 text-center">
        <Package size={64} className="text-gray-200 mb-6" />
        <h1 className="text-2xl font-black text-primary-900 mb-2 uppercase tracking-tight">Product Disappeared</h1>
        <p className="text-text-muted mb-8 max-w-sm">We couldn't find the premium item you're looking for. It may have been retired or moved.</p>
        <Link to="/" className="px-8 py-3 bg-primary-900 text-white rounded-2xl font-bold shadow-xl shadow-primary-900/10 active:scale-95 transition-all">Go back to Arrivals</Link>
      </div>
    );
  }

  const handleAddToCart = async () => {
    if (!user) {
      showNotification('Please sign in to add items', 'info');
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }

    setAdding(true);
    try {
      await addItem(product.id, quantity);
      showNotification('Selection added to your bag!', 'success');
    } catch (err) {
      showNotification('Failed to add to cart', 'error');
    } finally {
      setAdding(false);
    }
  };

  const discountedPrice = product.discountPercentage
    ? product.price * (1 - product.discountPercentage / 100)
    : null;

  return (
    <div className="min-h-screen bg-surface-bg font-sans pt-16">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16">

        {/* Breadcrumbs - Cleaner & more subtle */}
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted mb-8 lg:mb-12">
          <Link to="/" className="hover:text-primary-900 transition-colors">Home</Link>
          <span className="opacity-20">/</span>
          <span className="text-primary-900/60 transition-colors hover:text-primary-900 cursor-pointer">
            {product.category?.name || 'Shop'}
          </span>
          <span className="opacity-20">/</span>
          <span className="opacity-40 truncate max-w-[150px]">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-20 items-start">

          {/* Image Section - More prominent (7/12) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="aspect-[4/5] bg-white rounded-[2.5rem] p-8 sm:p-12 lg:p-16 shadow-[0_20px_80px_-20px_rgba(15,23,42,0.08)] flex items-center justify-center relative border border-slate-100/50 group overflow-hidden">
              {product.discountPercentage > 0 && (
                <div className="absolute top-8 left-8 bg-accent-pink text-white text-[10px] font-black px-4 py-2 rounded-full shadow-lg shadow-accent-pink/20 z-10 tracking-widest uppercase">
                  -{Math.round(product.discountPercentage)}% Off
                </div>
              )}
              <img
                key={mainImage || product.imageUrl}
                src={mainImage || product.imageUrl}
                className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-1000 ease-out animate-fade-in"
                alt={product.name}
              />
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-white/10 to-transparent pointer-events-none"></div>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-4 px-2">
              {(product.images?.length > 0 ? product.images.map(img => img.url) : [product.imageUrl]).map((url, i) => (
                <div 
                  key={i} 
                  onClick={() => setMainImage(url)}
                  className={`aspect-square bg-white rounded-2xl p-2 border transition-all cursor-pointer hover:ring-2 hover:ring-primary-900/5 ${ (mainImage === url || (!mainImage && url === product.imageUrl)) ? 'border-primary-900/10 ring-2 ring-primary-900/5' : 'border-transparent opacity-40 hover:opacity-100'}`}>
                  <img src={url} className="w-full h-full object-contain" alt={`${product.name} view ${i + 1}`} />
                </div>
              ))}
            </div>
          </div>

          {/* Details Section - Focused (5/12) */}
          <div className="lg:col-span-5 flex flex-col pt-2">
            <div className="mb-10">
              <div className="flex items-center justify-between mb-6">
                <span className="px-4 py-1.5 bg-slate-900/5 text-primary-900 text-[10px] font-black uppercase tracking-[0.15em] rounded-full border border-slate-900/5">
                  Handpicked
                </span>
                <div className="flex items-center gap-2">
                  <div className="flex text-amber-400">
                    {[1, 2, 3, 4, 5].map(s => <Star key={s} size={12} fill={s <= 4 ? "currentColor" : "none"} />)}
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">(2.4k reviews)</span>
                </div>
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-primary-900 mb-6 leading-[1.05] tracking-tight">
                {product.name}
              </h1>

              <div className="flex items-center gap-5 mb-10">
                {discountedPrice ? (
                  <>
                    <span className="text-4xl font-black text-primary-900 tracking-tighter">
                      ₹{discountedPrice.toLocaleString()}
                    </span>
                    <span className="text-xl text-slate-300 line-through font-bold">
                      ₹{Number(product.price).toLocaleString()}
                    </span>
                  </>
                ) : (
                  <span className="text-4xl font-black text-primary-900 tracking-tighter">
                    ₹{Number(product.price).toLocaleString()}
                  </span>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">The Experience</h3>
                <p className="text-slate-600 leading-relaxed font-medium text-base">
                  {product.description || "An exceptional fusion of modern aesthetics and unparalleled craftsmanship. Designed to elevate your everyday experience with premium materials and sophisticated detail."}
                </p>
              </div>
            </div>

            {/* Buying Actions */}
            <div className="space-y-10 mt-6 lg:mt-12 bg-white/50 backdrop-blur-md p-8 lg:p-0 rounded-[3rem] lg:rounded-none border border-slate-100 lg:border-none shadow-xl lg:shadow-none">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 lg:gap-6">
                <div className="flex items-center bg-white rounded-full p-1.5 border border-slate-200 shadow-sm self-start sm:self-auto">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-12 h-12 flex items-center justify-center hover:bg-slate-50 rounded-full transition-all active:scale-90 text-primary-900"
                  >
                    <Minus size={18} strokeWidth={2.5} />
                  </button>
                  <span className="w-10 text-center font-black text-lg text-primary-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                    className="w-12 h-12 flex items-center justify-center hover:bg-slate-50 rounded-full transition-all active:scale-90 text-primary-900"
                  >
                    <Plus size={18} strokeWidth={2.5} />
                  </button>
                </div>

                <div className="flex-1">
                  {product.stock <= 0 ? (
                    <div className="w-full py-5 bg-slate-100 text-slate-400 rounded-full text-center font-black uppercase tracking-widest text-[10px]">Temporarily Unavailable</div>
                  ) : (
                    <button
                      onClick={handleAddToCart}
                      disabled={adding}
                      className="w-full py-5 bg-primary-900 hover:bg-black text-white rounded-full font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-primary-900/30 active:scale-95 transition-all flex items-center justify-center gap-3 group"
                    >
                      {adding ? <span className="animate-spin w-4 h-4 border-2 border-white/20 border-t-white rounded-full"></span> : <ShoppingCart size={16} className="group-hover:-translate-y-1 transition-transform" />}
                      {adding ? 'Confirming Selection...' : 'Add to Shopping Bag'}
                    </button>
                  )}
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-10 border-t border-slate-100">
                <div className="flex items-center sm:flex-col gap-4 sm:gap-3 text-left sm:text-center group">
                  <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center group-hover:bg-primary-900 group-hover:text-white transition-all duration-500 rotate-3 group-hover:rotate-0">
                    <Truck size={20} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-primary-900 mb-1">Global Express</h4>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">3-5 Day Delivery</p>
                  </div>
                </div>
                <div className="flex items-center sm:flex-col gap-4 sm:gap-3 text-left sm:text-center group">
                  <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center group-hover:bg-primary-900 group-hover:text-white transition-all duration-500 -rotate-3 group-hover:rotate-0">
                    <RotateCcw size={20} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-primary-900 mb-1">Extended Returns</h4>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">30 Day Privilege</p>
                  </div>
                </div>
                <div className="flex items-center sm:flex-col gap-4 sm:gap-3 text-left sm:text-center group">
                  <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center group-hover:bg-primary-900 group-hover:text-white transition-all duration-500 rotate-6 group-hover:rotate-0">
                    <ShieldCheck size={20} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-primary-900 mb-1">Vault Privacy</h4>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Encrypted Payments</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProductDetailPage;
