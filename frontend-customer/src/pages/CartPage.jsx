import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, Minus, Plus, Trash2, CheckCircle2, ArrowLeft } from 'lucide-react';
import useCartStore from '../store/useCartStore';

const CartPage = () => {
  const cart = useCartStore(state => state.cart);
  const loading = useCartStore(state => state.loading);
  const updateQuantity = useCartStore(state => state.updateQuantity);
  const removeItem = useCartStore(state => state.removeItem);
  const cartCount = useCartStore(state => state.getCartCount());
  const cartTotal = useCartStore(state => state.getCartTotal());
  const navigate = useNavigate();

  if (loading && !cart) {
    return (
      <div className="min-h-screen bg-surface-bg pt-20 px-4">
        <div className="max-w-[1500px] mx-auto text-center">
          <div className="animate-spin w-10 h-10 border-4 border-accent-blue border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-text-muted font-medium">Preparing your shopping bag...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-bg text-text-main font-sans pb-10">
      <header className="sticky top-0 z-50 bg-primary-900 text-white shadow-lg">
        <div className="max-w-[1500px] mx-auto flex items-center gap-4 px-4 h-16">
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
          <div className="ml-auto text-sm font-bold bg-white/10 px-3 py-1 rounded-full border border-white/10">Shopping Bag</div>
        </div>
      </header>

      <main className="max-w-[1500px] mx-auto p-4 sm:p-6 lg:p-10 flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <h1 className="text-3xl font-black text-primary-900 mb-8 px-1">Your Bag <span className="text-text-muted font-normal text-lg ml-2">({cartCount} items)</span></h1>

          {!cart?.items?.length ? (
            <div className="bg-white rounded-3xl p-16 text-center border-2 border-dashed border-gray-100 shadow-sm">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag size={48} className="text-gray-200" />
              </div>
              <h2 className="text-2xl font-bold text-primary-900 mb-3">Your ModernShop bag is empty</h2>
              <p className="text-text-muted max-w-sm mx-auto mb-10">Looks like you haven't added any premium items to your collection yet.</p>
              <Link to="/" className="bg-primary-900 hover:bg-primary-800 text-white px-10 py-4 rounded-2xl font-bold shadow-xl shadow-primary-900/20 transition-all active:scale-95 inline-block">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {cart.items.map((item) => {
                const discountedPrice = item.product.discountPercentage
                  ? item.product.price * (1 - item.product.discountPercentage / 100)
                  : item.product.price;
                return (
                  <div key={item.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex gap-6 hover:shadow-md transition-all group">
                    <div className="w-28 h-28 sm:w-44 sm:h-44 flex-shrink-0 bg-gray-50 rounded-2xl p-2 flex items-center justify-center group-hover:bg-white transition-colors duration-300">
                      <img src={item.product.imageUrl} alt={item.product.name} className="max-w-[90%] max-h-[90%] object-contain group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="flex-1 flex flex-col pt-2">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-base sm:text-xl font-bold text-primary-900 hover:text-accent-blue transition-colors cursor-pointer line-clamp-2 leading-tight pr-4">
                          {item.product.name}
                        </h3>
                        <div className="text-right shrink-0">
                          <div className="font-black text-xl sm:text-2xl text-primary-900 tracking-tight">
                            <span className="text-sm font-bold mr-0.5">₹</span>
                            {Number(discountedPrice).toLocaleString()}
                          </div>
                          {item.product.discountPercentage > 0 && (
                            <div className="text-xs font-bold text-text-muted line-through opacity-60">₹{Number(item.product.price).toLocaleString()}</div>
                          )}
                        </div>
                      </div>
                      {item.product.stock <= 0 ? (
                        <div className="text-[10px] font-black uppercase tracking-tighter px-2.5 py-1 bg-red-50 text-red-600 rounded-lg w-fit mb-4 border border-red-100/50">Out of Stock</div>
                      ) : item.product.stock <= 5 ? (
                        <div className="text-[10px] font-black uppercase tracking-tighter px-2.5 py-1 bg-amber-50 text-amber-600 rounded-lg w-fit mb-4 border border-amber-100/50 animate-pulse">Only {item.product.stock} left - order soon</div>
                      ) : (
                        <div className="text-[10px] font-black uppercase tracking-tighter px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg w-fit mb-4 border border-emerald-100/50">Secure in Stock</div>
                      )}

                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center bg-gray-50 rounded-2xl p-1 gap-1 border border-gray-100 shadow-inner">
                          <button
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="w-10 h-10 flex items-center justify-center hover:bg-white hover:shadow-sm rounded-xl text-primary-900 transition-all active:scale-90"
                          >
                            <Minus size={18} strokeWidth={2.5} />
                          </button>
                          <span className="w-10 text-center font-black text-lg text-primary-900">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stock}
                            className="w-10 h-10 flex items-center justify-center hover:bg-white hover:shadow-sm rounded-xl text-primary-900 transition-all active:scale-90 disabled:opacity-20 disabled:scale-100"
                          >
                            <Plus size={18} strokeWidth={2.5} />
                          </button>
                        </div>
                        
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-3 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all active:scale-90 flex items-center gap-2 font-bold text-sm"
                        >
                          <Trash2 size={20} /> <span className="hidden sm:inline">Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {cart?.items?.length > 0 && (
          <div className="w-full lg:w-[380px] shrink-0">
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 sticky top-24">
              <div className="flex items-start gap-3 bg-indigo-50/50 p-4 rounded-2xl mb-6">
                <CheckCircle2 size={20} className="text-accent-blue mt-0.5 shrink-0" />
                <span className="text-[13px] text-primary-800 font-medium leading-relaxed">Your order is eligible for **FREE Premium Delivery**. Expect delivery within 24-48 hours.</span>
              </div>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-text-muted font-medium">
                  <span>Subtotal ({cartCount} items)</span>
                  <span>₹{cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-text-muted font-medium">
                  <span>Shipping</span>
                  <span className="text-green-500 font-bold">FREE</span>
                </div>
                <div className="pt-4 border-t border-gray-100 flex justify-between items-baseline">
                  <span className="text-lg font-black text-primary-900">Total</span>
                  <span className="text-3xl font-black text-primary-900 tracking-tight">
                    <span className="text-sm font-bold mr-1">₹</span>
                    {cartTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full py-5 bg-primary-900 hover:bg-primary-800 text-white rounded-2xl text-base font-black shadow-xl shadow-primary-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
              >
                Checkout Now
              </button>
              
              <div className="mt-8 pt-8 border-t border-gray-50 flex items-center justify-center gap-6 opacity-30 grayscale saturate-0">
                <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-4" alt="Visa" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-6" alt="Mastercard" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" className="h-4" alt="PayPal" />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CartPage;
