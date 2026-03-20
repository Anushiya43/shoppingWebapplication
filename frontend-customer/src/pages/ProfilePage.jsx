import React, { useState } from 'react';
import { User, Mail, Phone, Shield, Save, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import { updateProfile } from '../api/users';
import { useNotification } from '../context/NotificationContext';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { Link } from 'react-router-dom';

const ProfilePage = () => {
    const { user, setUser } = useAuthStore();
    const { showNotification } = useNotification();
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        phoneNumber: user?.phoneNumber || '',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await updateProfile(formData);
            setUser({ ...user, ...res.data });
            showNotification('Profile updated successfully!', 'success');
        } catch (err) {
            showNotification(err.response?.data?.message || 'Failed to update profile', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-surface-bg pt-20 pb-12">
            <Header />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-10 flex items-center justify-between">
                    <div className="text-left">
                        <h1 className="text-3xl font-black text-primary-900 tracking-tight uppercase">Your Vault</h1>
                        <p className="text-text-muted text-xs font-bold uppercase tracking-widest mt-1">Manage your identity and security</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Sidebar/Info */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 text-center relative overflow-hidden group">
                           <div className="absolute top-0 left-0 w-full h-1 bg-primary-900"></div>
                           <div className="w-24 h-24 bg-primary-900 rounded-full mx-auto mb-6 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-primary-900/20 group-hover:scale-105 transition-transform duration-500">
                                {user?.firstName?.[0]}{user?.lastName?.[0]}
                           </div>
                           <h2 className="text-lg font-black text-primary-900 truncate">{user?.firstName} {user?.lastName}</h2>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{user?.role}</p>
                           
                           <div className="mt-8 pt-6 border-t border-slate-50 space-y-4 text-left">
                                <div className="flex items-center gap-3 text-text-muted">
                                    <Mail size={14} className="opacity-40" />
                                    <span className="text-xs font-bold truncate">{user?.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-text-muted">
                                    <Shield size={14} className="opacity-40" />
                                    <span className="text-xs font-bold">Verified Member</span>
                                </div>
                           </div>
                        </div>

                        <Link to="/addresses" className="flex items-center justify-between p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group">
                            <div className="text-left">
                                <h4 className="text-[10px] font-black text-primary-900 uppercase tracking-widest mb-1">Shipping Hub</h4>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Manage your addresses</p>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-primary-900 group-hover:text-white transition-colors">
                                <ArrowLeft size={16} className="rotate-180" />
                            </div>
                        </Link>
                    </div>

                    {/* Form */}
                    <div className="lg:col-span-8">
                        <div className="bg-white rounded-[2rem] p-8 lg:p-10 border border-slate-100 shadow-xl shadow-slate-200/50 relative">
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2 text-left">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">First Name</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                            <input 
                                                type="text"
                                                name="firstName"
                                                value={formData.firstName}
                                                onChange={handleChange}
                                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-primary-900 focus:ring-2 focus:ring-primary-900/5 focus:bg-white focus:border-primary-900 outline-none transition-all"
                                                placeholder="Enter first name"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2 text-left">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Last Name</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                            <input 
                                                type="text"
                                                name="lastName"
                                                value={formData.lastName}
                                                onChange={handleChange}
                                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-primary-900 focus:ring-2 focus:ring-primary-900/5 focus:bg-white focus:border-primary-900 outline-none transition-all"
                                                placeholder="Enter last name"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 text-left">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Mobile Access</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                        <input 
                                            type="tel"
                                            name="phoneNumber"
                                            value={formData.phoneNumber}
                                            onChange={handleChange}
                                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-primary-900 focus:ring-2 focus:ring-primary-900/5 focus:bg-white focus:border-primary-900 outline-none transition-all"
                                            placeholder="e.g. +91 98765 43210"
                                        />
                                    </div>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2 ml-1">Used for premium security and delivery alerts</p>
                                </div>

                                <div className="pt-6">
                                    <button 
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full md:w-auto px-10 py-4 bg-primary-900 hover:bg-black text-white rounded-full font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl shadow-primary-900/20 active:scale-95 transition-all disabled:opacity-50"
                                    >
                                        {submitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                        {submitting ? 'Propagating Changes...' : 'Seal Profile'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default ProfilePage;
