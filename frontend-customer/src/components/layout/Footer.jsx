import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
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
            <li><Link to="#" className="hover:underline text-gray-300">About Us</Link></li>
            <li><Link to="#" className="hover:underline text-gray-300">Careers</Link></li>
            <li><Link to="#" className="hover:underline text-gray-300">Press Releases</Link></li>
            <li><Link to="#" className="hover:underline text-gray-300">Amazon Science</Link></li>
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
            <li><Link to="#" className="hover:underline text-gray-300">Sell on Amazon</Link></li>
            <li><Link to="#" className="hover:underline text-gray-300">Sell under Amazon Accelerator</Link></li>
            <li><Link to="#" className="hover:underline text-gray-300">Protect and Build Your Brand</Link></li>
            <li><Link to="#" className="hover:underline text-gray-300">Amazon Global Selling</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-4">Let Us Help You</h4>
          <ul className="space-y-2 text-sm text-gray-300">
            <li><Link to="#" className="hover:underline text-gray-300">COVID-19 and Amazon</Link></li>
            <li><Link to="#" className="hover:underline text-gray-300">Your Account</Link></li>
            <li><Link to="#" className="hover:underline text-gray-300">Returns Centre</Link></li>
            <li><Link to="#" className="hover:underline text-gray-300">100% Purchase Protection</Link></li>
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
          {['Australia', 'Brazil', 'Canada', 'China', 'France', 'Germany', 'Italy', 'Japan', 'Mexico', 'Netherlands', 'Poland', 'Singapore', 'Spain', 'Turkey', 'United Arab Emirates', 'United Kingdom', 'United States'].map(country => (
            <Link key={country} to="#" className="hover:underline text-gray-300">{country}</Link>
          ))}
        </div>
      </div>

      <div className="bg-amazon-navy-900 py-10 text-[12px] text-center text-gray-400">
        <div className="flex justify-center gap-4 mb-2">
          <Link to="#" className="hover:underline text-gray-400">Conditions of Use & Sale</Link>
          <Link to="#" className="hover:underline text-gray-400">Privacy Notice</Link>
          <Link to="#" className="hover:underline text-gray-400">Interest-Based Ads</Link>
        </div>
        <p>© 1996-2026, Amazon.com, Inc. or its affiliates</p>
      </div>
    </footer>
  );
};

export default Footer;
