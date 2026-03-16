import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { LogIn, User, ShoppingBag, Search, Menu, LogOut, Smartphone, Hash, X, CheckCircle2, MapPin, ShoppingCart, ChevronDown, MapPinned, ShieldAlert, Package, Star, Tag, Trash2, Plus, Minus, CreditCard, Truck } from 'lucide-react';
import { getProducts } from './api/products';
import { getCategories } from './api/categories';

const AuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const { setTokens } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const userId = searchParams.get('user_id');

    if (accessToken && refreshToken) {
      setTokens(accessToken, refreshToken, userId);
      navigate('/');
      window.location.reload();
    }
  }, [searchParams, setTokens, navigate]);

  return <div className="min-h-screen flex items-center justify-center">Logging you in...</div>;
};

const LoginModal = ({ isOpen, onClose }) => {
  const { loginWithGoogle, loginWithPhone, verifyPhoneOtp } = useAuth();
  const [step, setStep] = useState('choice'); // choice, phone, otp
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await loginWithPhone(phoneNumber);
      setIsNewUser(res.data.isNewUser);
      setStep('otp');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await verifyPhoneOtp(phoneNumber, otp, firstName, lastName);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-[4px] shadow-lg relative overflow-hidden border border-gray-300">
        <button onClick={onClose} className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded transition-colors text-gray-500">
          <X size={18} />
        </button>

        <div className="p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-normal text-amazon-text mb-4">
              {step === 'otp' && isNewUser ? 'Create account' : 'Sign in'}
            </h2>
          </div>

          {error && (
            <div className="mb-6 p-3 border border-red-400 bg-white text-red-700 rounded-[4px] text-[13px] flex items-start gap-2">
              <ShieldAlert size={16} className="mt-0.5 shrink-0" />
              <div>
                <div className="font-bold">There was a problem</div>
                <p>{error}</p>
              </div>
            </div>
          )}

          {step === 'choice' && (
            <div className="space-y-4">
              <button
                onClick={loginWithGoogle}
                className="w-full flex items-center justify-center gap-3 px-4 py-2 bg-white border border-gray-300 text-amazon-text rounded-[3px] text-sm hover:bg-gray-50 shadow-sm transition-all"
              >
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
                Continue with Google
              </button>
              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="flex-shrink mx-4 text-gray-400 text-xs text font-normal">New to Amazon?</span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>
              <button
                onClick={() => setStep('phone')}
                className="w-full px-4 py-2 bg-gradient-to-b from-[#f7dfa5] to-[#f0c14b] border border-[#a88734] hover:from-[#f5d78e] text-amazon-text rounded-[3px] text-sm shadow-sm transition-all"
              >
                Continue with Phone
              </button>
            </div>
          )}

          {step === 'phone' && (
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[13px] font-bold text-amazon-text">Mobile number</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 00000 00000"
                  className="w-full px-3 py-2 bg-white border border-gray-400 rounded-[3px] focus:border-amazon-orange focus:shadow-[0_0_3px_2px_rgba(228,121,17,0.5)] outline-none text-sm"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-1.5 bg-gradient-to-b from-[#f7dfa5] to-[#f0c14b] border border-[#a88734] hover:from-[#f5d78e] text-amazon-text rounded-[3px] text-sm shadow-sm transition-all disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Continue'}
              </button>
              <p className="text-[12px] text-amazon-text-gray mt-4">
                By continuing, you agree to Amazon's <span className="text-amazon-blue hover:text-amazon-orange underline cursor-pointer">Conditions of Use</span> and <span className="text-amazon-blue hover:text-amazon-orange underline cursor-pointer">Privacy Notice</span>.
              </p>
              <button
                type="button"
                onClick={() => setStep('choice')}
                className="w-full text-amazon-blue text-[13px] hover:text-amazon-orange hover:underline mt-4 text-left"
              >
                Back to options
              </button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              {isNewUser && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[13px] font-bold text-amazon-text">Your name</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        required
                        placeholder="First name"
                        className="w-full px-3 py-2 bg-white border border-gray-400 rounded-[3px] focus:border-amazon-orange focus:shadow-[0_0_3px_2px_rgba(228,121,17,0.5)] outline-none text-sm"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                      <input
                        type="text"
                        required
                        placeholder="Last name"
                        className="w-full px-3 py-2 bg-white border border-gray-400 rounded-[3px] focus:border-amazon-orange focus:shadow-[0_0_3px_2px_rgba(228,121,17,0.5)] outline-none text-sm"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}
              <div className="space-y-1">
                <label className="text-[13px] font-bold text-amazon-text">6-digit OTP</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  className="w-full px-3 py-2 bg-white border border-gray-400 rounded-[3px] focus:border-amazon-orange focus:shadow-[0_0_3px_2px_rgba(228,121,17,0.5)] outline-none text-sm"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
                <p className="text-[11px] text-amazon-text-gray">Verification code sent to {phoneNumber}</p>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-1.5 bg-gradient-to-b from-[#f7dfa5] to-[#f0c14b] border border-[#a88734] hover:from-[#f5d78e] text-amazon-text rounded-[3px] text-sm shadow-sm transition-all disabled:opacity-50"
              >
                {loading ? 'Verifying...' : (isNewUser ? 'Create account' : 'Sign in')}
              </button>
              <button
                type="button"
                onClick={() => setStep('phone')}
                className="w-full text-amazon-blue text-[13px] hover:text-amazon-orange hover:underline mt-4 text-left"
              >
                Resend OTP
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

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

const ProductCardSkeleton = () => (
  <div className="bg-white p-2 sm:p-4 animate-pulse">
    <div className="aspect-square bg-gray-200 mb-2 rounded"></div>
    <div className="h-3 bg-gray-200 rounded mb-1.5 w-3/4"></div>
    <div className="h-3 bg-gray-200 rounded mb-2 w-1/2"></div>
    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
  </div>
);

const HomePage = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ... rest of state and effects ...

  // Fetch categories on mount
  useEffect(() => {
    getCategories()
      .then(res => setCategories(res.data))
      .catch(err => console.error('Failed to fetch categories:', err));
  }, []);

  // Fetch products when search/filter changes (debounced)
  useEffect(() => {
    setLoading(true);
    setError(null);
    const params = { limit: 20, page: 1 };
    if (searchQuery.trim()) params.search = searchQuery.trim();
    if (selectedCategoryId) params.categoryId = selectedCategoryId;

    const timer = setTimeout(() => {
      getProducts(params)
        .then(res => {
          // API returns { products, meta }
          const data = Array.isArray(res.data) ? res.data : (res.data.products || []);
          setProducts(data);
        })
        .catch(err => {
          console.error('Failed to fetch products:', err);
          setError('Could not load products. Is the backend running?');
        })
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategoryId]);

  const handleCategorySelect = (cat) => {
    if (cat === 'All') {
      setSelectedCategory('All');
      setSelectedCategoryId(null);
    } else {
      setSelectedCategory(cat.name);
      setSelectedCategoryId(cat.id);
    }
  };

  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#EAEDED] text-amazon-text font-sans">
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setLoginModalOpen(false)} />

      {/* Mobile Category Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[200] flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative z-10 w-4/5 max-w-xs bg-white h-full flex flex-col">
            <div className="bg-amazon-navy-900 text-white px-4 py-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gray-400 flex items-center justify-center text-sm font-bold">
                {user ? user.firstName?.[0]?.toUpperCase() : '?'}
              </div>
              <div>
                <div className="text-xs text-gray-300">Hello,</div>
                <div className="font-bold text-sm">{user ? `${user.firstName} ${user.lastName || ''}` : 'Sign in'}</div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="px-4 py-3 border-b border-gray-200">
                <h3 className="font-bold text-sm mb-2">Shop by Category</h3>
                <button
                  onClick={() => { handleCategorySelect('All'); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-2 py-2 rounded text-sm ${selectedCategory === 'All' ? 'bg-[#febd69] font-bold' : 'hover:bg-gray-100'}`}
                >
                  All Categories
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => { handleCategorySelect(cat); setMobileMenuOpen(false); }}
                    className={`w-full text-left px-2 py-2 rounded text-sm ${selectedCategory === cat.name ? 'bg-[#febd69] font-bold' : 'hover:bg-gray-100'}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
              <div className="px-4 py-3">
                {user ? (
                  <button onClick={() => { logout(); setMobileMenuOpen(false); }}
                    className="w-full text-left px-2 py-2 text-sm text-red-600 hover:bg-red-50 rounded">
                    Sign Out
                  </button>
                ) : (
                  <button onClick={() => { setLoginModalOpen(true); setMobileMenuOpen(false); }}
                    className="w-full px-4 py-2 bg-gradient-to-b from-[#f7dfa5] to-[#f0c14b] border border-[#a88734] text-amazon-text rounded text-sm font-medium">
                    Sign In
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 bg-amazon-navy-900 text-white">
        {/* Row 1: Logo + icons */}
        <div className="flex items-center gap-2 px-3 h-14 max-w-[1500px] mx-auto">
          {/* Hamburger (mobile only) */}
          <button
            className="lg:hidden p-2 border border-transparent hover:border-white rounded shrink-0"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu size={22} />
          </button>

          {/* Logo */}
          <div className="flex items-center p-1 border border-transparent hover:border-white rounded cursor-pointer shrink-0">
            <div className="text-xl font-bold flex flex-col leading-none">
              <span className="text-white">amazon</span>
              <span className="text-amazon-orange text-[10px] text-right -mt-1 italic">.in</span>
            </div>
          </div>

          {/* Delivery Location — desktop only */}
          <div className="hidden lg:flex items-center gap-1 p-2 border border-transparent hover:border-white rounded cursor-pointer leading-tight shrink-0">
            <MapPin size={16} className="mt-1.5" />
            <div className="flex flex-col">
              <span className="text-gray-400 text-[11px]">Deliver to</span>
              <span className="text-sm font-bold">India</span>
            </div>
          </div>

          {/* Search bar — desktop only (inline) */}
          <div className="hidden md:flex flex-1 h-10 rounded overflow-hidden">
            <select
              className="bg-[#e6e6e6] text-amazon-text px-2 text-xs font-medium border-r border-gray-300 cursor-pointer outline-none shrink-0 max-w-[100px]"
              value={selectedCategory}
              onChange={(e) => {
                const val = e.target.value;
                if (val === 'All') handleCategorySelect('All');
                else {
                  const cat = categories.find(c => c.name === val);
                  if (cat) handleCategorySelect(cat);
                }
              }}
            >
              <option value="All">All</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
            <input
              type="text"
              className="flex-1 px-3 text-amazon-text border-none focus:outline-none text-sm"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="bg-amazon-orange hover:bg-amazon-orange/90 px-4 text-amazon-navy-900 flex items-center justify-center shrink-0">
              <Search size={20} strokeWidth={2.5} />
            </button>
          </div>

          {/* Right side nav */}
          <div className="flex items-center gap-1 ml-auto shrink-0">
            {/* Account */}
            <div
              onClick={() => !user && setLoginModalOpen(true)}
              className="hidden md:block p-2 border border-transparent hover:border-white rounded cursor-pointer leading-tight"
            >
              <div className="text-[11px]">Hello, {user ? user.firstName : 'sign in'}</div>
              <div className="text-xs font-bold flex items-center gap-0.5">Account <ChevronDown size={12} /></div>
            </div>

            {/* Returns */}
            <Link to="/orders" className="hidden lg:block p-2 border border-transparent hover:border-white rounded cursor-pointer leading-tight">
              <div className="text-[11px]">Returns</div>
              <div className="text-xs font-bold">& Orders</div>
            </Link>

            {/* Cart */}
            <Link to="/cart" className="p-2 border border-transparent hover:border-white rounded cursor-pointer flex items-center gap-1 relative">
              <div className="relative">
                <ShoppingCart size={28} />
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 text-amazon-orange text-sm font-bold leading-none">{cartCount}</span>
              </div>
              <span className="text-xs font-bold hidden sm:block">Cart</span>
            </Link>

            {/* Logout button on desktop when logged in */}
            {user && (
              <button onClick={logout} className="hidden md:block p-2 border border-transparent hover:border-white rounded cursor-pointer leading-tight">
                <div className="text-[11px]">Sign</div>
                <div className="text-xs font-bold">Out</div>
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Full-width search bar — mobile only */}
        <div className="md:hidden flex h-10 mx-3 mb-2 rounded overflow-hidden">
          <input
            type="text"
            className="flex-1 px-3 text-amazon-text border-none focus:outline-none text-sm"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="bg-amazon-orange px-4 text-amazon-navy-900 flex items-center justify-center shrink-0">
            <Search size={20} strokeWidth={2.5} />
          </button>
        </div>

        {/* Sub Header (Category pills) */}
        <div className="bg-amazon-navy-800 flex items-center gap-1.5 px-3 h-9 text-xs font-medium overflow-x-auto whitespace-nowrap scrollbar-hide">
          <button className="flex items-center gap-1 hover:border hover:border-white px-2 py-1 rounded shrink-0">
            <Menu size={16} /> All
          </button>
          <button
            onClick={() => handleCategorySelect('All')}
            className={`px-2 py-1 border rounded shrink-0 hover:border-white ${selectedCategory === 'All' ? 'border-white' : 'border-transparent'}`}
          >
            All Categories
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => handleCategorySelect(cat)}
              className={`px-2 py-1 border rounded shrink-0 hover:border-white ${selectedCategory === cat.name ? 'border-white' : 'border-transparent'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1500px] mx-auto pb-20 md:pb-10">
        <div className="px-2 sm:px-4 pt-3">
          {/* Section Title */}
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base sm:text-xl font-bold">
              {searchQuery
                ? `Results for "${searchQuery}"`
                : selectedCategory !== 'All'
                  ? selectedCategory
                  : 'All Products'}
            </h2>
            {!loading && (
              <span className="text-xs sm:text-sm text-gray-500">
                {products.length} item{products.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Error state */}
          {error && !loading && (
            <div className="bg-white border border-red-300 rounded p-8 text-center my-4">
              <ShieldAlert size={36} className="text-red-400 mx-auto mb-2" />
              <p className="text-red-600 font-medium text-sm">{error}</p>
              <p className="text-gray-400 text-xs mt-1">Make sure the backend is running.</p>
            </div>
          )}

          {/* Products Grid — 2 cols on mobile, up to 5 on desktop */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-px bg-gray-300">
            {loading
              ? Array.from({ length: 10 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : products.length > 0
                ? products.map(product => <ProductCard key={product.id} product={product} />)
                : !error && (
                  <div className="col-span-2 sm:col-span-3 md:col-span-4 lg:col-span-5 bg-white p-12 text-center">
                    <Package size={40} className="text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-600 mb-1">No products found</h3>
                    <p className="text-gray-400 text-sm">
                      {searchQuery
                        ? `No results for "${searchQuery}".`
                        : 'No products yet. Add some via the Admin Panel.'}
                    </p>
                  </div>
                )
            }
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex items-center justify-around h-14 shadow-lg">
        <button className="flex flex-col items-center gap-0.5 text-amazon-navy-900 px-3">
          <ShoppingBag size={22} />
          <span className="text-[10px] font-medium">Shop</span>
        </button>
        <button
          onClick={() => !user && setLoginModalOpen(true)}
          className="flex flex-col items-center gap-0.5 text-gray-500 px-3"
        >
          <User size={22} />
          <span className="text-[10px] font-medium">{user ? user.firstName : 'Sign In'}</span>
        </button>
        <Link to="/cart" className="flex flex-col items-center gap-0.5 text-gray-500 relative px-3">
          <div className="relative">
            <ShoppingCart size={22} />
            <span className="absolute -top-1.5 -right-1.5 bg-amazon-orange text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{cartCount}</span>
          </div>
          <span className="text-[10px] font-medium">Cart</span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="flex flex-col items-center gap-0.5 text-gray-500 px-3"
        >
          <Menu size={22} />
          <span className="text-[10px] font-medium">Menu</span>
        </button>
      </nav>

      {/* Amazon Style Footer */}
      <footer className="bg-amazon-navy-800 text-white mt-10">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="w-full bg-[#37475a] hover:bg-[#485769] py-4 text-sm font-medium transition-colors"
        >
          Back to top
        </button>

        <div className="max-w-[1000px] mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <h4 className="font-bold mb-4">Get to Know Us</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link to="#" className="hover:underline">About Us</Link></li>
              <li><Link to="#" className="hover:underline">Careers</Link></li>
              <li><Link to="#" className="hover:underline">Press Releases</Link></li>
              <li><Link to="#" className="hover:underline">Amazon Science</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Connect with Us</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link to="#" className="hover:underline">Facebook</Link></li>
              <li><Link to="#" className="hover:underline">Twitter</Link></li>
              <li><Link to="#" className="hover:underline">Instagram</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Make Money with Us</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link to="#" className="hover:underline">Sell on Amazon</Link></li>
              <li><Link to="#" className="hover:underline">Sell under Amazon Accelerator</Link></li>
              <li><Link to="#" className="hover:underline">Protect and Build Your Brand</Link></li>
              <li><Link to="#" className="hover:underline">Amazon Global Selling</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Let Us Help You</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link to="#" className="hover:underline">COVID-19 and Amazon</Link></li>
              <li><Link to="#" className="hover:underline">Your Account</Link></li>
              <li><Link to="#" className="hover:underline">Returns Centre</Link></li>
              <li><Link to="#" className="hover:underline">100% Purchase Protection</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 py-10 flex flex-col items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold flex flex-col leading-none">
              <span className="text-white">amazon</span>
              <span className="text-amazon-orange text-xs text-right -mt-1 italic">.in</span>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-4 text-[12px] text-gray-300">
            <Link to="#" className="hover:underline">Australia</Link>
            <Link to="#" className="hover:underline">Brazil</Link>
            <Link to="#" className="hover:underline">Canada</Link>
            <Link to="#" className="hover:underline">China</Link>
            <Link to="#" className="hover:underline">France</Link>
            <Link to="#" className="hover:underline">Germany</Link>
            <Link to="#" className="hover:underline">Italy</Link>
            <Link to="#" className="hover:underline">Japan</Link>
            <Link to="#" className="hover:underline">Mexico</Link>
            <Link to="#" className="hover:underline">Netherlands</Link>
            <Link to="#" className="hover:underline">Poland</Link>
            <Link to="#" className="hover:underline">Singapore</Link>
            <Link to="#" className="hover:underline">Spain</Link>
            <Link to="#" className="hover:underline">Turkey</Link>
            <Link to="#" className="hover:underline">United Arab Emirates</Link>
            <Link to="#" className="hover:underline">United Kingdom</Link>
            <Link to="#" className="hover:underline">United States</Link>
          </div>
        </div>

        <div className="bg-amazon-navy-900 py-10 text-[12px] text-center text-gray-400">
          <div className="flex justify-center gap-4 mb-2">
            <Link to="#" className="hover:underline">Conditions of Use & Sale</Link>
            <Link to="#" className="hover:underline">Privacy Notice</Link>
            <Link to="#" className="hover:underline">Interest-Based Ads</Link>
          </div>
          <p>© 1996-2026, Amazon.com, Inc. or its affiliates</p>
        </div>
      </footer>
    </div>
  );
};


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
        <div className="max-w-[1500px] mx-auto flex items-center justify-between">
          <Link to="/" className="text-xl font-bold">amazon<span className="text-amazon-orange text-[10px] italic">.in</span></Link>
          <div className="text-sm font-medium">Shopping Cart</div>
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

const CheckoutPage = () => {
  const { user } = useAuth();
  const { cart, cartCount, cartTotal, clearCart, refreshCart } = useCart();
  const navigate = useNavigate();
  const [isPlacing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  if (!user) return null;

  const handlePlaceOrder = async () => {
    setPlacing(true);
    try {
      const { createOrder } = await import('./api/orders');
      await createOrder({}); // Empty DTO for now
      setPlaced(true);
      await clearCart();
      setTimeout(() => navigate('/orders'), 3000);
    } catch (err) {
      alert('Failed to place order. Is the backend running?');
    } finally {
      setPlacing(false);
    }
  };

  if (placed) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <CheckCircle2 size={64} className="text-green-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Order placed, thank you!</h1>
        <p className="text-gray-600 text-center mb-6">Confirmation will be sent to your email shortly.</p>
        <button onClick={() => navigate('/orders')} className="text-amazon-blue hover:underline">Go to your orders</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EAEDED] font-sans">
      <header className="bg-amazon-navy-900 text-white p-4 h-16 flex items-center justify-center relative">
        <Link to="/" className="text-xl font-bold">amazon<span className="text-amazon-orange text-[10px] italic">.in</span></Link>
        <div className="absolute right-4 text-gray-400">
           <ShieldAlert size={20} />
        </div>
      </header>

      <main className="max-w-[1100px] mx-auto p-4 md:p-8">
        <h1 className="text-2xl font-normal text-amazon-text mb-6">Checkout ({cartCount} item{cartCount !== 1 ? 's' : ''})</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-6">
          <div className="space-y-4">
            {/* Delivery Address */}
            <div className="bg-white p-5 rounded border border-gray-300 flex gap-10">
              <span className="font-bold w-40 text-sm">1. Delivery address</span>
              <div className="flex-1 text-[13px]">
                <p className="font-bold">{user?.firstName} {user?.lastName}</p>
                <p>Add your delivery address in settings</p>
                <p>India</p>
              </div>
              <button className="text-amazon-blue text-xs hover:underline h-fit">Change</button>
            </div>

            {/* Payment Method */}
            <div className="bg-white p-5 rounded border border-gray-300 flex gap-10">
              <span className="font-bold w-40 text-sm">2. Payment method</span>
              <div className="flex-1 text-[13px] flex items-center gap-2">
                <CreditCard size={20} className="text-gray-500" />
                <p className="font-bold">Pay on Delivery (Cash/Card)</p>
              </div>
              <button className="text-amazon-blue text-xs hover:underline h-fit">Change</button>
            </div>

            {/* Review Items */}
            <div className="bg-white p-5 rounded border border-gray-300">
               <h3 className="font-bold text-sm mb-4">3. Review items and delivery</h3>
               <div className="space-y-4">
                 {cart?.items?.map(item => (
                   <div key={item.id} className="flex gap-4">
                     <img src={item.product.imageUrl} className="w-16 h-16 object-contain" />
                     <div className="text-[13px]">
                        <p className="font-bold truncate max-w-[400px]">{item.product.name}</p>
                        <p className="text-[#B12704] font-bold">₹{item.product.price}</p>
                        <p className="text-gray-500">Quantity: {item.quantity}</p>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          </div>

          {/* Place Order Box */}
          <div className="space-y-4">
            <div className="bg-white p-4 rounded border border-gray-300">
               <button 
                  onClick={handlePlaceOrder}
                  disabled={isPlacing || !cartCount}
                  className="w-full py-2 bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] rounded-[8px] text-xs font-medium shadow-sm transition-all disabled:opacity-50"
               >
                  {isPlacing ? 'Placing order...' : 'Place your order'}
               </button>
               <p className="text-[11px] text-gray-500 mt-2 text-center leading-tight">
                 By placing your order, you agree to Amazon's privacy notice and conditions of use.
               </p>
               
               <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="font-bold text-sm mb-2">Order Summary</h4>
                  <div className="text-[12px] space-y-1">
                    <div className="flex justify-between"><span>Items:</span><span>₹{cartTotal.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Delivery:</span><span>₹0.00</span></div>
                    <div className="flex justify-between pt-2 mt-2 border-t border-gray-200 text-[#B12704] text-base font-bold">
                      <span>Order Total:</span>
                      <span>₹{cartTotal.toFixed(2)}</span>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const OrdersPage = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/');
        }
    }, [user, navigate]);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const { getOrders } = await import('./api/orders');
                const res = await getOrders();
                setOrders(res.data);
            } catch (err) {
                console.error('Failed to fetch orders', err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    return (
        <div className="min-h-screen bg-[#EAEDED] font-sans pb-10">
            <header className="bg-amazon-navy-900 text-white p-3 sticky top-0 z-50">
                <div className="max-w-[1500px] mx-auto flex items-center justify-between">
                    <Link to="/" className="text-xl font-bold">amazon<span className="text-amazon-orange text-[10px] italic">.in</span></Link>
                    <div className="text-sm font-medium">Your Orders</div>
                </div>
            </header>

            <main className="max-w-[800px] mx-auto p-4 md:p-8">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <Link to="/" className="hover:text-amazon-orange hover:underline">Your Account</Link>
                    <span>›</span>
                    <span className="text-amazon-orange">Your Orders</span>
                </div>
                <h1 className="text-3xl font-normal mb-6">Your Orders</h1>

                {loading ? (
                    <div className="text-center py-10">
                        <div className="animate-spin w-8 h-8 border-4 border-amazon-orange border-t-transparent rounded-full mx-auto"></div>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="bg-white p-8 rounded border border-gray-300 text-center">
                        <p className="text-gray-600 mb-4">You have not placed any orders yet.</p>
                        <Link to="/" className="text-amazon-blue hover:underline">Continue shopping</Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map(order => (
                            <div key={order.id} className="bg-white rounded border border-gray-300 overflow-hidden">
                                <div className="bg-[#f0f2f2] p-4 flex flex-wrap gap-6 text-[12px] text-gray-500 border-b border-gray-300">
                                    <div><p className="uppercase">Order Placed</p><p className="text-sm font-medium text-gray-700">{new Date(order.createdAt).toLocaleDateString()}</p></div>
                                    <div><p className="uppercase">Total</p><p className="text-sm font-medium text-gray-700">₹{Number(order.totalAmount).toFixed(2)}</p></div>
                                    <div><p className="uppercase">Ship To</p><p className="text-sm font-medium text-amazon-blue cursor-pointer hover:text-amazon-orange underline">{user?.firstName} {user?.lastName}</p></div>
                                    <div className="ml-auto text-right">
                                        <p className="uppercase">Order # {order.id.split('-')[0].toUpperCase()}</p>
                                        <Link to={`#`} className="text-amazon-blue hover:text-amazon-orange underline">View order details</Link>
                                    </div>
                                </div>
                                <div className="p-4 space-y-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="bg-green-700 w-2 h-2 rounded-full"></div>
                                        <span className="font-bold text-sm">Delivered</span>
                                    </div>
                                    {order.orderItems.map(item => (
                                        <div key={item.id} className="flex gap-4">
                                            <img src={item.product.imageUrl} className="w-20 h-20 object-contain border border-gray-100 rounded" />
                                            <div className="flex-1 text-[13px]">
                                                <h4 className="text-amazon-blue font-medium hover:text-amazon-orange hover:underline cursor-pointer">{item.product.name}</h4>
                                                <p className="text-gray-500 mt-1">Quantity: {item.quantity}</p>
                                                <button className="mt-2 px-6 py-1 bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] rounded-full text-xs shadow-sm">Buy it again</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth-success" element={<AuthSuccess />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/orders" element={<OrdersPage />} />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
