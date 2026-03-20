import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Package, ShieldAlert, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import ProductCard from '../components/product/ProductCard';
import LoginModal from '../components/common/LoginModal';
import { getProducts } from '../api/products';
import { getCategories } from '../api/categories';
import { getBanners } from '../api/banners';
import useAuthStore from '../store/useAuthStore';

const ProductCardSkeleton = () => (
  <div className="bg-white p-4 rounded-xl shadow-sm animate-pulse flex flex-col h-full">
    <div className="aspect-square bg-gray-100 mb-3 rounded-lg"></div>
    <div className="h-4 bg-gray-100 rounded mb-2 w-3/4"></div>
    <div className="h-4 bg-gray-100 rounded mb-3 w-1/2"></div>
    <div className="mt-auto h-6 bg-gray-100 rounded w-1/3"></div>
  </div>
);

const BannerCarousel = ({ banners }) => {
  if (!banners || banners.length === 0) return null;

  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStart = useRef(0);
  const touchEnd = useRef(0);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrent(prev => (prev === banners.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length, isPaused]);

  const next = () => setCurrent(prev => (prev === banners.length - 1 ? 0 : prev + 1));
  const prev = () => setCurrent(prev => (prev === 0 ? banners.length - 1 : prev - 1));

  const handleTouchStart = (e) => touchStart.current = e.targetTouches[0].clientX;
  const handleTouchMove = (e) => touchEnd.current = e.targetTouches[0].clientX;
  const handleTouchEnd = () => {
    if (touchStart.current - touchEnd.current > 70) next();
    if (touchStart.current - touchEnd.current < -70) prev();
  };

  return (
    <div 
      className="relative w-full h-[250px] sm:h-[400px] md:h-[500px] overflow-hidden group mb-6 rounded-2xl shadow-xl"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="absolute inset-0 flex transition-transform duration-700 ease-in-out" style={{ transform: `translateX(-${current * 100}%)` }}>
        {banners.map((banner) => (
          <div key={banner.id} className="min-w-full h-full relative">
            <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-primary-900/80 via-primary-900/20 to-transparent flex flex-col justify-center px-8 md:px-20 text-white">
              <h2 className="text-3xl md:text-5xl font-black mb-2 animate-fade-in-up">{banner.title}</h2>
              <p className="text-lg md:text-xl text-cyan-200 mb-6 max-w-md">{banner.subtitle}</p>
              <button className="w-fit px-8 py-3 bg-accent-blue hover:bg-accent-cyan text-white font-bold rounded-full transition-all shadow-lg hover:shadow-accent-blue/40 flex items-center gap-2">
                Shop Now <ArrowRight size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40 opacity-0 group-hover:opacity-100 transition-all border border-white/30 hidden md:block">
        <ChevronLeft size={28} />
      </button>
      <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40 opacity-0 group-hover:opacity-100 transition-all border border-white/30 hidden md:block">
        <ChevronRight size={28} />
      </button>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
        {banners.map((_, i) => (
          <button 
            key={i} 
            onClick={() => setCurrent(i)}
            className={`transition-all duration-300 rounded-full ${current === i ? 'w-8 h-2.5 bg-accent-cyan shadow-cyan-500/50 shadow-sm' : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/60'}`}
          />
        ))}
      </div>
    </div>
  );
};


const HomePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  useEffect(() => {
    if (location.state) {
        if (location.state.selectedCategory) setSelectedCategory(location.state.selectedCategory);
        if (location.state.categoryId !== undefined) setSelectedCategoryId(location.state.categoryId);
        if (location.state.searchQuery !== undefined) setSearchQuery(location.state.searchQuery);
    }
  }, [location.state]);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getCategories()
      .then(res => setCategories(res.data))
      .catch(err => console.error('Failed to fetch categories:', err));
    
    getBanners()
      .then(res => setBanners(Array.isArray(res.data) ? res.data : []))
      .catch(err => console.error('Failed to fetch banners:', err));
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    const params = { limit: 20, page: 1 };
    if (searchQuery.trim()) params.search = searchQuery.trim();
    if (selectedCategoryId) params.categoryId = selectedCategoryId;

    try {
      const res = await getProducts(params);
      const data = Array.isArray(res.data) ? res.data : (res.data.products || []);
      setProducts(data);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError('Could not load products. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategoryId]);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    fetchProducts();
  };

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
    <div className="min-h-screen bg-surface-bg text-text-main font-sans selection:bg-accent-blue selection:text-white">
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setLoginModalOpen(false)} />

      {/* Mobile Category Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[200] flex animate-fade-in">
          <div className="absolute inset-0 bg-primary-900/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative z-10 w-4/5 max-w-xs bg-white h-full flex flex-col shadow-[20px_0_60px_-15px_rgba(0,0,0,0.3)] animate-slide-in-left">
            <div className="bg-primary-900 text-white px-6 py-8 flex flex-col gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-blue to-accent-pink flex items-center justify-center text-2xl font-black shadow-lg">
                {user ? user.firstName?.[0]?.toUpperCase() : '?'}
              </div>
              <div>
                <div className="text-sm text-cyan-200 font-medium">Welcome back,</div>
                <div className="font-bold text-2xl tracking-tight truncate">{user ? user.firstName : 'Sign in'}</div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <div className="px-5 py-4 border-b border-gray-200">
                <h3 className="font-bold text-lg mb-3">Shop by Category</h3>
                <button
                  onClick={() => { handleCategorySelect('All'); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-4 py-3 rounded-xl mb-1 text-[15px] transition-all ${selectedCategory === 'All' ? 'bg-primary-900 text-white font-bold shadow-md' : 'hover:bg-gray-100 text-gray-700'}`}
                >
                  All Categories
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => { handleCategorySelect(cat); setMobileMenuOpen(false); }}
                    className={`w-full text-left px-4 py-3 rounded-xl mb-1 text-[15px] transition-all ${selectedCategory === cat.name ? 'bg-primary-900 text-white font-bold shadow-md' : 'hover:bg-gray-100 text-gray-700'}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
              
              <div className="px-5 py-4">
                <h3 className="font-bold text-lg mb-3">Help & Settings</h3>
                {user ? (
                  <button onClick={() => { logout(); setMobileMenuOpen(false); }}
                    className="w-full text-left px-4 py-3 text-[15px] font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all">
                    Sign Out
                  </button>
                ) : (
                  <button onClick={() => { setLoginModalOpen(true); setMobileMenuOpen(false); }}
                    className="w-full px-6 py-3.5 bg-primary-900 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-primary-800 transition-all active:scale-95">
                    Sign In to Account
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <Header 
        categories={categories}
        selectedCategory={selectedCategory}
        onCategorySelect={handleCategorySelect}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearch={handleSearch}
        onMobileMenuOpen={() => setMobileMenuOpen(true)}
        onLoginClick={() => navigate('/login')}
      />

      {/* Main Content */}
      <main className="max-w-[1500px] mx-auto pb-20 md:pb-10 pt-4 px-4 sm:px-6">
        
        {/* Banner Section */}
        {!searchQuery && selectedCategory === 'All' && <BannerCarousel banners={banners} />}

        <div className="pt-2">
          {/* Section Title */}
          <div className="flex items-center justify-between mb-6 px-1">
            <h2 className="text-xl sm:text-2xl font-extrabold flex items-center gap-2">
              {searchQuery ? (
                <>
                  <span className="text-primary-900">"{searchQuery}"</span>
                  <span className="text-text-muted font-normal text-lg">Results</span>
                </>
              ) : selectedCategory !== 'All' ? (
                <span className="text-primary-900">{selectedCategory}</span>
              ) : (
                <span className="text-primary-900">New Arrivals</span>
              )}
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

          {/* Products Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {loading
              ? Array.from({ length: 10 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : products.length > 0
                ? products.map(product => <ProductCard key={product.id} product={product} />)
                : !error && (
                  <div className="col-span-full bg-white rounded-3xl p-16 text-center border-2 border-dashed border-gray-100">
                    <Package size={60} className="text-gray-200 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-primary-900 mb-2">No products found</h3>
                    <p className="text-text-muted text-base max-w-sm mx-auto">
                      {searchQuery
                        ? `We couldn't find anything matching "${searchQuery}". Try different keywords.`
                        : 'Our inventory is temporarily empty. Check back soon for exciting new products!'}
                    </p>
                  </div>
                )
            }
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;
