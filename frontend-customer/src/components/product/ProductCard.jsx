import React, { useState } from 'react';
import { Package } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const ProductCard = ({ product }) => {
  const { cart, addItem } = useCart();
  const { user } = useAuth();
  const [adding, setAdding] = useState(false);

  const discountedPrice = product.discountPercentage
    ? product.price * (1 - product.discountPercentage / 100)
    : null;

  const cartItem = cart?.items?.find(item => item.productId === product.id);
  const currentQuantityInCart = cartItem ? cartItem.quantity : 0;
  const isOutOfStock = product.stock === 0;
  const isAtMaxStock = currentQuantityInCart >= product.stock;

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (!user) {
      alert('Please sign in to add items to cart');
      return;
    }
    setAdding(true);
    try {
      await addItem(product.id, 1);
    } catch (err) {
      console.error('Add to cart failed', err);
      if (err.response?.data?.message) {
        alert(err.response.data.message);
      } else {
        alert('Failed to add to cart. Please try again.');
      }
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="bg-white p-2 sm:p-4 flex flex-col cursor-pointer group hover:shadow-md transition-shadow">
      {/* Product Image */}
      <div className="aspect-square mb-2 flex items-center justify-center overflow-hidden bg-white relative">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gray-50 flex items-center justify-center rounded">
            <Package size={28} className="text-gray-300" />
          </div>
        )}
        {product.discountPercentage > 0 && (
          <span className="absolute top-1 left-1 bg-[#CC0C39] text-white text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded-sm">
            -{Math.round(product.discountPercentage)}%
          </span>
        )}
      </div>

      {/* Product Title */}
      <div className="text-amazon-blue text-xs sm:text-sm mb-1 line-clamp-2 leading-snug hover:text-amazon-orange">
        {product.name}
      </div>

      {/* Star Rating */}
      <div className="flex items-center gap-0.5 mb-1">
        <div className="flex text-amazon-orange">
          {[1, 2, 3, 4, 5].map(s => (
            <span key={s} className="text-[11px]">★</span>
          ))}
        </div>
        <span className="text-amazon-blue text-[10px] ml-0.5">128</span>
      </div>

      {/* Pricing */}
      <div className="mt-auto">
        {discountedPrice ? (
          <div>
            <div className="text-sm sm:text-base font-medium text-amazon-text">
              <span className="text-[10px] sm:text-sm align-top">₹</span>
              {discountedPrice.toFixed(2)}
            </div>
            <div className="text-[10px] sm:text-xs text-gray-500">
              M.R.P.: <span className="line-through">₹{Number(product.price).toFixed(2)}</span>
              <span className="text-[#CC0C39] ml-1">({Math.round(product.discountPercentage)}%)</span>
            </div>
          </div>
        ) : (
          <div className="text-sm sm:text-base font-medium text-amazon-text">
            <span className="text-[10px] sm:text-sm align-top">₹</span>
            {Number(product.price).toFixed(2)}
          </div>
        )}

        {/* Stock badge */}
        {product.stock === 0 ? (
          <div className="text-[10px] sm:text-xs text-red-600 font-medium mt-1">Out of Stock</div>
        ) : product.stock <= 5 ? (
          <div className="text-[10px] sm:text-xs text-[#CC0C39] font-medium mt-1">Only {product.stock} left</div>
        ) : (
          <div className="text-[10px] sm:text-xs text-green-700 font-medium mt-1">In Stock</div>
        )}

        <button
          className="w-full mt-2 py-1.5 sm:py-2 bg-gradient-to-b from-[#f7dfa5] to-[#f0c14b] border border-[#a88734] hover:from-[#f5d78e] text-amazon-text rounded-[3px] text-[11px] sm:text-sm font-medium shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
          disabled={isOutOfStock || isAtMaxStock || adding}
          onClick={handleAddToCart}
        >
          {adding ? 'Adding...' : isAtMaxStock ? 'Limit reached' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
