import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, MapPin, Search, ShoppingCart, ChevronDown, Package, Ticket } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import useCartStore from '../../store/useCartStore';

const Header = ({ 
  categories, 
  selectedCategory, 
  onCategorySelect, 
  searchQuery, 
  onSearchChange, 
  onSearch,
  onMobileMenuOpen,
  onLoginClick
}) => {
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const cartCount = useCartStore(state => state.getCartCount());
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 bg-primary-900 text-white shadow-lg">
      {/* Row 1: Logo + icons */}
      <div className="flex items-center gap-2 px-3 h-14 max-w-[1500px] mx-auto">
        {/* Hamburger (mobile only) */}
        <button
          className="lg:hidden p-2 border border-transparent hover:border-white rounded shrink-0"
          onClick={onMobileMenuOpen}
        >
          <Menu size={22} />
        </button>

        {/* Logo */}
        <Link to="/" className="flex items-center p-1 border border-transparent hover:border-white/20 rounded-md cursor-pointer shrink-0 transition-all">
          <div className="text-xl font-extrabold tracking-tight flex items-center gap-1">
            <span className="bg-gradient-to-r from-accent-cyan to-accent-blue bg-clip-text text-transparent">Modern</span>
            <span className="text-white">Shop</span>
          </div>
        </Link>

        {/* Delivery Location removed as per request */}

        {/* Search bar — desktop only (inline) */}
        <form 
          className="hidden md:flex flex-1 h-10 rounded-lg overflow-hidden bg-white border-2 border-transparent focus-within:border-accent-blue transition-all duration-200 shadow-sm hover:shadow-md"
          onSubmit={onSearch}
        >
          <select
            className="bg-gray-100 text-text-main px-3 text-xs font-bold border-r border-gray-300 cursor-pointer outline-none shrink-0 max-w-[150px] hover:bg-gray-200 transition-colors"
            value={selectedCategory}
            onChange={(e) => {
              const val = e.target.value;
              if (val === 'All') onCategorySelect('All');
              else {
                const cat = categories.find(c => c.name === val);
                if (cat) onCategorySelect(cat);
              }
            }}
          >
            <option value="All">All Departments</option>
            {categories?.map(cat => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
          <div className="flex-1 flex items-center bg-white">
            <input
              type="text"
              className="w-full px-4 text-text-main bg-white border-none focus:outline-none text-base placeholder:text-gray-400"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          <button 
            type="submit"
            className="bg-accent-blue hover:bg-accent-blue/90 px-5 text-white flex items-center justify-center shrink-0 transition-colors"
          >
            <Search size={22} strokeWidth={2.5} />
          </button>
        </form>

        {/* Right side nav */}
        <div className="flex items-center gap-1 ml-auto shrink-0">
          {/* Account — desktop only */}
          <div
            onClick={() => !user && onLoginClick()}
            className="hidden md:flex p-2 border border-transparent hover:border-white rounded cursor-pointer leading-tight flex-col items-start min-w-[75px]"
          >
            <div className="text-[11px] opacity-80 uppercase tracking-tighter">Hello, {user ? user.firstName : 'Guest'}</div>
            <div className="text-xs font-black flex items-center gap-0.5">Account <ChevronDown size={12} /></div>
          </div>

          {/* Returns */}
          <div 
            onClick={() => {
              if (user) navigate('/orders');
              else navigate('/login', { state: { from: { pathname: '/orders' } } });
            }}
            className="p-2 border border-transparent hover:border-white rounded cursor-pointer leading-tight flex items-center gap-2 min-w-[65px]"
          >
            <Package size={20} className="text-accent-cyan" />
            <div className="flex flex-col items-start">
              <div className="text-[10px] md:text-[11px] opacity-80 uppercase tracking-tighter">Returns</div>
              <div className="text-[11px] md:text-xs font-black">& Orders</div>
            </div>
          </div>

          {/* Cart */}
          <Link to="/cart" className="p-2 border border-transparent hover:border-white/20 rounded-md cursor-pointer flex items-center gap-1 relative transition-all">
            <div className="relative">
              <ShoppingCart size={28} />
              <span className="absolute -top-1.5 -right-1.5 bg-accent-pink text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-primary-900">{cartCount}</span>
            </div>
            <span className="text-sm font-bold hidden sm:block self-end pb-0.5">Cart</span>
          </Link>

          {/* Logout button — visible on larger mobiles */}
          {user && (
            <button onClick={logout} className="hidden sm:block p-1 hover:text-accent-pink transition-colors ml-1">
              <span className="text-[11px] font-black uppercase tracking-widest border-b-2 border-accent-pink/30 pb-0.5">Out</span>
            </button>
          )}
        </div>
      </div>

      {/* Row 2: Full-width search bar — mobile only */}
      <form 
        className="md:hidden flex h-11 mx-3 mb-3 rounded-lg overflow-hidden bg-white border-2 border-transparent focus-within:border-accent-blue shadow-lg"
        onSubmit={onSearch}
      >
        <div className="flex-1 flex items-center bg-white px-1">
          <input
            type="text"
            className="w-full px-3 text-text-main bg-white border-none focus:outline-none text-base placeholder:text-gray-400"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <button 
          type="submit"
          className="bg-accent-blue px-5 text-white flex items-center justify-center shrink-0"
        >
          <Search size={20} strokeWidth={2.5} />
        </button>
      </form>

      {/* Sub Header (Category pills) */}
      <div className="bg-primary-800 flex items-center gap-2 px-3 h-10 text-[13px] font-semibold overflow-x-auto whitespace-nowrap scrollbar-hide border-t border-white/5">
        <button 
          onClick={onMobileMenuOpen}
          className="flex items-center gap-1 hover:bg-white/10 px-2 py-1.5 rounded transition-colors shrink-0"
        >
          <Menu size={18} /> All
        </button>
        <button
          onClick={() => onCategorySelect('All')}
          className={`px-3 py-1.5 rounded-full transition-all shrink-0 ${selectedCategory === 'All' ? 'bg-accent-blue text-white shadow-md' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}
        >
          All Categories
        </button>
        <Link
          to="/offers"
          className="px-3 py-1.5 rounded-full transition-all shrink-0 text-white font-black flex items-center gap-1.5 bg-gradient-to-r from-accent-pink to-accent-blue hover:shadow-lg active:scale-95"
        >
          <Ticket size={14} /> Promotions
        </Link>
        {categories?.map(cat => (
          <button
            key={cat.id}
            onClick={() => onCategorySelect(cat)}
            className={`px-3 py-1.5 rounded-full transition-all shrink-0 ${selectedCategory === cat.name ? 'bg-accent-blue text-white shadow-md' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </header>
  );
};

export default Header;
