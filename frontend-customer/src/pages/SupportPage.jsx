import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Mail, MessageSquare, Phone, 
  HelpCircle, ChevronRight, ShieldCheck, 
  Clock, Globe, LifeBuoy
} from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const SupportPage = () => {
  const navigate = useNavigate();

  const faqs = [
    {
      q: "Where is my order?",
      a: `You can track your order in real-time by visiting your Order History page. Most orders arrive within ${import.meta.env.VITE_SHIPPING_DAYS_MIN || 4}-${import.meta.env.VITE_SHIPPING_DAYS_MAX || 5} business days.`
    },
    {
      q: "What is your return policy?",
      a: `We offer a ${import.meta.env.VITE_RETURN_POLICY_DAYS || 30}-day premium return policy for all unused items in their original packaging.`
    },
    {
      q: "How do I use a coupon?",
      a: "Enter your coupon code at the checkout stage. The discount will be applied instantly to your grand total."
    },
    {
      q: "Are my payments secure?",
      a: `Yes, we use industry-standard encryption and secure payment gateways (like Razorpay) to ensure your financial data is always protected.`
    }
  ];

  return (
    <div className="min-h-screen bg-surface-bg font-sans selection:bg-primary-900 selection:text-white">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-16 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-blue/5 rounded-full text-accent-blue text-[10px] font-black uppercase tracking-widest mb-6 border border-accent-blue/10">
            <LifeBuoy size={14} /> Premium Concierge
          </div>
          <h1 className="text-5xl font-black text-primary-900 mb-6 italic tracking-tight">How can we assist you?</h1>
          <p className="text-text-muted max-w-2xl mx-auto text-lg font-medium leading-relaxed">
            Our dedicated support specialists are available around the clock to ensure your shopping experience remains exceptional.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Quick Contact Cards */}
          <div className="lg:col-span-1 space-y-6">
            <h3 className="text-xs font-black text-primary-900 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
              <MessageSquare size={14} /> Direct Channels
            </h3>
            
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
              <div className="w-12 h-12 bg-accent-blue/5 rounded-2xl flex items-center justify-center text-accent-blue mb-6 group-hover:scale-110 transition-transform">
                <Mail size={24} />
              </div>
              <h4 className="font-black text-primary-900 text-lg mb-2">Email Support</h4>
              <p className="text-sm text-text-muted font-medium mb-6">Average response time: 2 hours</p>
              <a href={`mailto:${import.meta.env.VITE_SUPPORT_EMAIL || 'support@modernshop.com'}`} className="text-accent-blue font-black text-xs uppercase tracking-widest flex items-center gap-1 group-hover:gap-2 transition-all">
                {import.meta.env.VITE_SUPPORT_EMAIL || 'support@modernshop.com'} <ChevronRight size={14} />
              </a>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
              <div className="w-12 h-12 bg-accent-cyan/5 rounded-2xl flex items-center justify-center text-accent-cyan mb-6 group-hover:scale-110 transition-transform">
                <Phone size={24} />
              </div>
              <h4 className="font-black text-primary-900 text-lg mb-2">Priority Call</h4>
              <p className="text-sm text-text-muted font-medium mb-6">Mon-Fri, 9am - 8pm IST</p>
              <p className="text-accent-blue font-black text-xs uppercase tracking-widest">{import.meta.env.VITE_SUPPORT_PHONE || '+91 1800-SHOP-NOW'}</p>
            </div>

          </div>

          {/* FAQs and Resources */}
          <div className="lg:col-span-2 space-y-12">
            <div>
              <h3 className="text-xs font-black text-primary-900 uppercase tracking-[0.2em] mb-8 flex items-center gap-2 px-1">
                <HelpCircle size={14} /> Frequently Asked
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {faqs.map((faq, idx) => (
                  <div key={idx} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:border-accent-blue/20 transition-all">
                    <h4 className="font-black text-primary-900 mb-4 flex items-start gap-3">
                      <span className="text-accent-blue opacity-50 font-serif italic text-lg">{idx + 1}.</span>
                      {faq.q}
                    </h4>
                    <p className="text-sm text-text-muted font-medium leading-relaxed pl-7">
                      {faq.a}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50/50 rounded-[3rem] p-10 md:p-16 border border-gray-100">
              <div className="flex flex-col md:flex-row gap-10 items-center">
                <div className="flex-1 space-y-6">
                  <h3 className="text-3xl font-black text-primary-900 italic tracking-tight">Still need help?</h3>
                  <p className="text-text-muted font-medium leading-relaxed">
                    If you haven't found what you're looking for, please don't hesitate to reach out. Our mission is to provide you with the smoothest shopping experience possible.
                  </p>
                  <div className="flex flex-wrap gap-4 pt-4">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary-900/40">
                      <ShieldCheck size={14} /> Secure Encryption
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary-900/40">
                      <Clock size={14} /> 24/7 Monitoring
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary-900/40">
                      <Globe size={14} /> Global Assistance
                    </div>
                  </div>
                </div>
                <div className="w-full md:w-64 bg-white p-2 rounded-[2rem] shadow-xl border border-gray-100 rotate-2 hover:rotate-0 transition-transform duration-500">
                  <div className="bg-slate-50 p-6 rounded-[1.8rem] flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-primary-900 rounded-full flex items-center justify-center text-white mb-4 shadow-lg shadow-primary-900/20">
                      <LifeBuoy size={32} />
                    </div>
                    <p className="text-[10px] font-black text-primary-900 uppercase tracking-widest mb-1">{import.meta.env.VITE_APP_NAME || 'ModernShop'}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Verified Help</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SupportPage;
