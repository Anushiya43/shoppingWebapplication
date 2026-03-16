import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, Minus, Plus, Trash2, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';

const CartPage = () => {
  const { cart, loading, updateQuantity, removeItem, cartCount, cartTotal } = useCart();
  const navigate = useNavigate();

  if (loading && !cart) {
    return (
      <div className="min-h-screen bg-[#EAEDED] pt-10 px-4">
        <div className="max-w-[1500px] mx-auto bg-white p-8 rounded shadow text-center">
          <div className="animate-spin w-8 h-8 border-4 border-amazon-orange border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading your cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EAEDED] text-amazon-text font-sans pb-10">
      <header className="sticky top-0 z-50 bg-amazon-navy-900 text-white p-3">
        <div className="max-w-[1500px] mx-auto flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="p-1 hover:bg-white/10 rounded-full transition-colors lg:hidden"
            aria-label="Go back"
          >
            <ArrowLeft size={24} />
          </button>
          <Link to="/" className="text-xl font-bold">amazon<span className="text-amazon-orange text-[10px] italic">.in</span></Link>
          <div className="ml-auto text-sm font-medium">Shopping Cart</div>
        </div>
      </header>

      <main className="max-w-[1500px] mx-auto p-4 flex flex-col lg:flex-row gap-4">
        <div className="flex-1 bg-white p-6 rounded shadow">
          <h1 className="text-2xl font-medium mb-4 pb-2 border-b border-gray-200">Shopping Cart</h1>

          {!cart?.items?.length ? (
            <div className="py-10 text-center">
              <ShoppingBag size={60} className="text-gray-200 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Your Amazon Cart is empty</h2>
              <p className="text-sm text-gray-500 mb-6">Check your Saved for later items below or continue shopping.</p>
              <Link to="/" className="bg-amazon-orange hover:bg-amazon-orange/90 px-6 py-2 rounded-[4px] text-sm font-medium text-amazon-navy-900">
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {cart.items.map((item) => {
                const discountedPrice = item.product.discountPercentage
                  ? item.product.price * (1 - item.product.discountPercentage / 100)
                  : item.product.price;
                return (
                  <div key={item.id} className="flex gap-4 pb-6 border-b border-gray-100 last:border-0">
                    <div className="w-24 h-24 sm:w-40 sm:h-40 flex-shrink-0 bg-white">
                      <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="text-sm sm:text-lg font-medium text-amazon-blue hover:text-amazon-orange cursor-pointer line-clamp-2 leading-tight">
                          {item.product.name}
                        </h3>
                        <div className="text-right">
                          <div className="font-bold text-lg">₹{Number(discountedPrice).toFixed(2)}</div>
                          {item.product.discountPercentage > 0 && (
                            <div className="text-xs text-gray-500 line-through">₹{Number(item.product.price).toFixed(2)}</div>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-green-700 mb-2">In Stock</div>

                      <div className="mt-auto flex items-center gap-4">
                        <div className="flex items-center border border-gray-300 rounded-[8px] overflow-hidden shadow-sm bg-gray-50">
                          <button
                            onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                            className="p-1.5 hover:bg-gray-200 text-gray-600 transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="px-4 text-sm font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stock}
                            className="p-1.5 hover:bg-gray-200 text-gray-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <div className="h-4 border-l border-gray-300"></div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-amazon-blue hover:underline text-xs flex items-center gap-1"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div className="text-right text-lg">
                Subtotal ({cartCount} item{cartCount !== 1 ? 's' : ''}): <span className="font-bold">₹{cartTotal.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>

        {cart?.items?.length > 0 && (
          <div className="w-full lg:w-72 flex flex-col gap-4">
            <div className="bg-white p-5 rounded shadow">
              <div className="flex items-center gap-2 text-green-700 text-xs mb-3">
                <CheckCircle2 size={16} />
                <span>Your order is eligible for FREE Delivery. Select this option at checkout for details.</span>
              </div>
              <div className="text-lg mb-4">
                Subtotal ({cartCount} item{cartCount !== 1 ? 's' : ''}): <span className="font-bold">₹{cartTotal.toFixed(2)}</span>
              </div>
              <button
                onClick={() => navigate('/checkout')}
                className="w-full py-2 bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] rounded-[8px] text-sm font-medium shadow-sm active:scale-95 transition-all"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CartPage;
