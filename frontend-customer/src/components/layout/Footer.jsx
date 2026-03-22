import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-primary-800 text-white mt-12">
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="w-full bg-primary-700 hover:bg-primary-900 py-5 text-sm font-bold transition-all border-b border-white/5"
      >
        Back to top
      </button>

      <div className="max-w-[1000px] mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <h4 className="font-bold mb-4">Get to Know Us</h4>
          <ul className="space-y-2 text-sm text-gray-300">
            <li><Link to="#" className="hover:text-accent-cyan transition-colors">About Us</Link></li>
            <li><Link to="#" className="hover:text-accent-cyan transition-colors">Careers</Link></li>
            <li><Link to="#" className="hover:text-accent-cyan transition-colors">Press Releases</Link></li>
            <li><Link to="#" className="hover:text-accent-cyan transition-colors">Sustainability</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-4">Connect with Us</h4>
          <ul className="space-y-2 text-sm text-gray-300">
            <li><Link to="#" className="hover:underline text-gray-300">Facebook</Link></li>
            <li><Link to="#" className="hover:underline text-gray-300">Twitter</Link></li>
            <li><Link to="#" className="hover:underline text-gray-300">Instagram</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-4">Make Money with Us</h4>
          <ul className="space-y-2 text-sm text-gray-300">
            <li><Link to="#" className="hover:text-accent-cyan transition-colors">Become a Seller</Link></li>
            <li><Link to="#" className="hover:text-accent-cyan transition-colors">Advertise Your Products</Link></li>
            <li><Link to="#" className="hover:text-accent-cyan transition-colors">Affiliate Program</Link></li>
            <li><Link to="#" className="hover:text-accent-cyan transition-colors">Vendor Central</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-4">Let Us Help You</h4>
          <ul className="space-y-2 text-sm text-gray-300">
            <li><Link to="/support" className="hover:text-accent-cyan transition-colors">Help Center</Link></li>
            <li><Link to="#" className="hover:text-accent-cyan transition-colors">Your Account</Link></li>
            <li><Link to="#" className="hover:text-accent-cyan transition-colors">Returns & Refunds</Link></li>
            <li><Link to="#" className="hover:text-accent-cyan transition-colors">Purchase Protection</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/5 py-12 flex flex-col items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="text-2xl font-black tracking-tight flex items-center gap-1">
            <span className="bg-gradient-to-r from-accent-cyan to-accent-blue bg-clip-text text-transparent">
              {(import.meta.env.VITE_APP_NAME || 'ModernShop').slice(0, 6)}
            </span>
            <span className="text-white">
              {(import.meta.env.VITE_APP_NAME || 'ModernShop').slice(6)}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-[12px] text-gray-400 font-medium max-w-2xl mx-auto">
          {['Global Presence', 'United States', 'United Kingdom', 'Germany', 'France', 'Japan', 'India', 'Canada', 'Australia'].map(country => (
            <Link key={country} to="#" className="hover:text-white transition-colors">{country}</Link>
          ))}
        </div>
      </div>

      <div className="bg-primary-900 py-12 text-[12px] text-center text-gray-500 border-t border-white/5">
        <div className="flex justify-center gap-6 mb-4 font-medium">
          <Link to="#" className="hover:text-white transition-colors">Conditions of Use</Link>
          <Link to="#" className="hover:text-white transition-colors">Privacy Notice</Link>
          <Link to="#" className="hover:text-white transition-colors">Your Ads Privacy Choices</Link>
        </div>
        <p className="text-gray-600 font-medium italic opacity-60">© {new Date().getFullYear()} {import.meta.env.VITE_APP_NAME || 'ModernShop'}. Designed for excellence.</p>
      </div>
    </footer>
  );
};

export default Footer;
