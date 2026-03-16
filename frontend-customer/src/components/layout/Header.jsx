import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, MapPin, Search, ShoppingCart, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const Header = ({ 
  categories, 
  selectedCategory, 
  onCategorySelect, 
  searchQuery, 
  onSearchChange, 
  onMobileMenuOpen,
  onLoginClick
}) => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();

  return (
    <header className="sticky top-0 z-50 bg-amazon-navy-900 text-white">
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
        <Link to="/" className="flex items-center p-1 border border-transparent hover:border-white rounded cursor-pointer shrink-0">
          <div className="text-xl font-bold flex flex-col leading-none">
            <span className="text-white">amazon</span>
            <span className="text-amazon-orange text-[10px] text-right -mt-1 italic">.in</span>
          </div>
        </Link>

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
            className="bg-[#e6e6e6] text-amazon-text px-2 text-xs font-medium border-r border-gray-300 cursor-pointer outline-none shrink-0 max-w-[120px]"
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
            <option value="All">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
          <input
            type="text"
            className="flex-1 px-3 text-amazon-text border-none focus:outline-none text-sm"
            placeholder="Search Amazon.in"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <button className="bg-amazon-orange hover:bg-amazon-orange/90 px-4 text-amazon-navy-900 flex items-center justify-center shrink-0">
            <Search size={22} strokeWidth={2.5} />
          </button>
        </div>

        {/* Right side nav */}
        <div className="flex items-center gap-1 ml-auto shrink-0">
          {/* Account */}
          <div
            onClick={() => !user && onLoginClick()}
            className="hidden md:block p-2 border border-transparent hover:border-white rounded cursor-pointer leading-tight"
          >
            <div className="text-[11px]">Hello, {user ? user.firstName : 'sign in'}</div>
            <div className="text-xs font-bold flex items-center gap-0.5">Account & Lists <ChevronDown size={12} /></div>
          </div>

          {/* Returns */}
          <Link to="/orders" className="hidden lg:block p-2 border border-transparent hover:border-white rounded cursor-pointer leading-tight">
            <div className="text-[11px]">Returns</div>
            <div className="text-xs font-bold">& Orders</div>
          </Link>

          {/* Cart */}
          <Link to="/cart" className="p-2 border border-transparent hover:border-white rounded cursor-pointer flex items-center gap-1 relative">
            <div className="relative">
              <ShoppingCart size={32} />
              <span className="absolute -top-1 left-1/2 -translate-x-1/2 text-amazon-orange text-sm font-bold leading-none">{cartCount}</span>
            </div>
            <span className="text-sm font-bold hidden sm:block self-end pb-1">Cart</span>
          </Link>

          {/* Logout button */}
          {user && (
            <button onClick={logout} className="hidden md:block p-1 hover:text-amazon-orange transition-colors">
              <span className="text-xs font-bold">Sign Out</span>
            </button>
          )}
        </div>
      </div>

      {/* Row 2: Full-width search bar — mobile only */}
      <div className="md:hidden flex h-10 mx-3 mb-2 rounded overflow-hidden">
        <input
          type="text"
          className="flex-1 px-3 text-amazon-text border-none focus:outline-none text-sm"
          placeholder="Search Amazon.in"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <button className="bg-amazon-orange px-4 text-amazon-navy-900 flex items-center justify-center shrink-0">
          <Search size={20} strokeWidth={2.5} />
        </button>
      </div>

      {/* Sub Header (Category pills) */}
      <div className="bg-amazon-navy-800 flex items-center gap-1 px-3 h-10 text-[13px] font-medium overflow-x-auto whitespace-nowrap scrollbar-hide">
        <button 
          onClick={onMobileMenuOpen}
          className="flex items-center gap-1 hover:border hover:border-white px-2 py-1.5 rounded shrink-0"
        >
          <Menu size={18} /> All
        </button>
        <button
          onClick={() => onCategorySelect('All')}
          className={`px-3 py-1.5 border rounded shrink-0 hover:border-white ${selectedCategory === 'All' ? 'border-white' : 'border-transparent'}`}
        >
          All Categories
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => onCategorySelect(cat)}
            className={`px-3 py-1.5 border rounded shrink-0 hover:border-white ${selectedCategory === cat.name ? 'border-white' : 'border-transparent'}`}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </header>
  );
};

export default Header;
