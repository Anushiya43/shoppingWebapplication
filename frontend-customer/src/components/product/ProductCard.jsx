import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ShoppingCart, Star } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import useCartStore from '../../store/useCartStore';
import { useNotification } from '../../context/NotificationContext';

const ProductCard = ({ product }) => {
  const cart = useCartStore(state => state.cart);
  const addItem = useCartStore(state => state.addItem);
  const user = useAuthStore(state => state.user);
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);

  const discountedPrice = product.discountPercentage
    ? product.price * (1 - product.discountPercentage / 100)
    : null;

  const cartItem = cart?.items?.find(item => item.productId === product.id);
  const currentQuantityInCart = cartItem ? cartItem.quantity : 0;
  const isOutOfStock = product.stock === 0;
  const isAtMaxStock = currentQuantityInCart >= product.stock;

  const reviews = product.reviews || [];
  const reviewCount = reviews.length;
  const averageRating = reviewCount > 0
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount
    : 0;

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (!user) {
      showNotification('Please sign in to add items to cart', 'info');
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }
    setAdding(true);
    try {
      await addItem(product.id, 1);
      showNotification('Item added to cart!', 'success');
    } catch (err) {
      console.error('Add to cart failed', err);
      const msg = err.response?.data?.message || 'Failed to add to cart. Please try again.';
      showNotification(msg, 'error');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div 
      onClick={() => navigate(`/product/${product.id}`)}
      className="bg-white p-4 flex flex-col cursor-pointer group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 rounded-2xl border border-gray-100 relative h-full"
    >
      {product.discountPercentage > 0 && (
        <span className="absolute top-4 left-4 z-10 bg-accent-pink text-white text-[10px] sm:text-xs font-black px-2.5 py-1 rounded-lg shadow-lg shadow-accent-pink/20">
          -{Math.round(product.discountPercentage)}% OFF
        </span>
      )}
      {/* Product Image */}
      <div className="aspect-square mb-4 flex items-center justify-center overflow-hidden bg-gray-50/50 rounded-xl relative group-hover:bg-white transition-colors duration-300">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="max-h-[85%] max-w-[85%] object-contain group-hover:scale-110 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full bg-gray-50 flex items-center justify-center">
            <Package size={32} className="text-gray-200" />
          </div>
        )}
      </div>

      {/* Product Title */}
      <div className="text-primary-900 text-sm sm:text-base font-bold mb-2 line-clamp-2 leading-tight group-hover:text-accent-blue transition-colors">
        {product.name}
      </div>

      {/* Brand */}
      <div 
        key="brand-display" 
        className={`text-[10px] font-black text-accent-blue uppercase tracking-[0.15em] mb-2 px-1 ${!product.brand ? 'hidden' : ''}`}
      >
        {product.brand?.name}
      </div>

      {/* Star Rating */}
      <div className="flex items-center gap-1.5 mb-3">
        <div className="flex text-amber-400">
          {[1, 2, 3, 4, 5].map(s => (
            <Star 
              key={s} 
              size={12} 
              fill={s <= Math.round(averageRating) ? "currentColor" : "none"} 
              className={s <= Math.round(averageRating) ? "" : "text-slate-200"}
            />
          ))}
        </div>
        <span className="text-text-muted text-[11px] font-bold uppercase tracking-tight">
          {reviewCount > 0 ? `(${reviewCount})` : 'No reviews yet'}
        </span>
      </div>

      {/* Pricing */}
      <div className="mt-auto">
        {discountedPrice ? (
          <div className="mb-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-black text-primary-900 leading-none">
                <span className="text-sm font-bold mr-0.5">₹</span>
                {discountedPrice.toLocaleString()}
              </span>
            </div>
            <div className="text-[11px] font-medium text-text-muted mt-1">
              MRP <span className="line-through mx-1">₹{Number(product.price).toLocaleString()}</span>
            </div>
          </div>
        ) : (
          <div className="mb-3">
            <span className="text-xl sm:text-2xl font-black text-primary-900 leading-none">
              <span className="text-sm font-bold mr-0.5">₹</span>
              {Number(product.price).toLocaleString()}
            </span>
          </div>
        )}

        {/* Stock badge */}
        {product.stock === 0 ? (
          <div className="text-[11px] px-2 py-0.5 bg-red-50 text-red-500 font-bold rounded-lg w-fit mt-1">Out of Stock</div>
        ) : product.stock <= 5 ? (
          <div className="text-[11px] px-2 py-0.5 bg-accent-pink/10 text-accent-pink font-bold rounded-lg w-fit mt-1">Only {product.stock} left</div>
        ) : (
          <div className="text-[11px] px-2 py-0.5 bg-green-50 text-green-600 font-bold rounded-lg w-fit mt-1">Secure in Stock</div>
        )}

        <button
          className="w-full mt-4 py-3 bg-primary-900 hover:bg-primary-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md hover:shadow-primary-900/20 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-2"
          disabled={isOutOfStock || isAtMaxStock || adding}
          onClick={handleAddToCart}
        >
          {adding ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin h-4 w-4 border-2 border-white/20 border-t-white rounded-full"></span>
              Adding...
            </span>
          ) : isAtMaxStock ? (
            'Stock limit reached'
          ) : (
            <>
              <ShoppingCart size={16} />
              Add to Cart
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
