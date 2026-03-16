import React, { useState, useEffect } from 'react';
import { Package, ShieldAlert } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import ProductCard from '../components/product/ProductCard';
import LoginModal from '../components/common/LoginModal';
import { getProducts } from '../api/products';
import { getCategories } from '../api/categories';
import { useAuth } from '../context/AuthContext';

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
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getCategories()
      .then(res => setCategories(res.data))
      .catch(err => console.error('Failed to fetch categories:', err));
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const params = { limit: 20, page: 1 };
    if (searchQuery.trim()) params.search = searchQuery.trim();
    if (selectedCategoryId) params.categoryId = selectedCategoryId;

    const timer = setTimeout(() => {
      getProducts(params)
        .then(res => {
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
          <div className="relative z-10 w-4/5 max-w-xs bg-white h-full flex flex-col shadow-2xl">
            <div className="bg-amazon-navy-900 text-white px-4 py-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center text-lg font-bold">
                {user ? user.firstName?.[0]?.toUpperCase() : '?'}
              </div>
              <div className="overflow-hidden">
                <div className="text-[14px] text-gray-300">Hello,</div>
                <div className="font-bold text-[19px] truncate">{user ? `${user.firstName} ${user.lastName || ''}` : 'Sign in'}</div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <div className="px-5 py-4 border-b border-gray-200">
                <h3 className="font-bold text-lg mb-3">Shop by Category</h3>
                <button
                  onClick={() => { handleCategorySelect('All'); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-3 py-3 rounded text-[14px] ${selectedCategory === 'All' ? 'bg-[#f3f3f3] font-bold' : 'hover:bg-gray-100'}`}
                >
                  All Categories
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => { handleCategorySelect(cat); setMobileMenuOpen(false); }}
                    className={`w-full text-left px-3 py-3 rounded text-[14px] ${selectedCategory === cat.name ? 'bg-[#f3f3f3] font-bold' : 'hover:bg-gray-100'}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
              
              <div className="px-5 py-4">
                <h3 className="font-bold text-lg mb-3">Help & Settings</h3>
                {user ? (
                  <button onClick={() => { logout(); setMobileMenuOpen(false); }}
                    className="w-full text-left px-3 py-3 text-[14px] text-red-600 hover:bg-red-50 rounded">
                    Sign Out
                  </button>
                ) : (
                  <button onClick={() => { setLoginModalOpen(true); setMobileMenuOpen(false); }}
                    className="w-full px-4 py-2.5 bg-gradient-to-b from-[#f7dfa5] to-[#f0c14b] border border-[#a88734] text-amazon-text rounded-[4px] text-sm font-medium">
                    Sign In
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
        onMobileMenuOpen={() => setMobileMenuOpen(true)}
        onLoginClick={() => setLoginModalOpen(true)}
      />

      {/* Main Content */}
      <main className="max-w-[1500px] mx-auto pb-20 md:pb-10">
        <div className="px-2 sm:px-4 pt-3">
          {/* Section Title */}
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base sm:text-lg font-bold">
              {searchQuery
                ? `Results for "${searchQuery}"`
                : selectedCategory !== 'All'
                  ? selectedCategory
                  : 'Trending now'}
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-px bg-gray-200 border-x border-t border-gray-200">
            {loading
              ? Array.from({ length: 10 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : products.length > 0
                ? products.map(product => <ProductCard key={product.id} product={product} />)
                : !error && (
                  <div className="col-span-full bg-white p-12 text-center">
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

      <Footer />
    </div>
  );
};

export default HomePage;
