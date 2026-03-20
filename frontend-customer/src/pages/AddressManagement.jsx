import React, { useState, useEffect } from 'react';
import { 
    Plus, Home, Briefcase, MapPin, Trash2, Edit2, CheckCircle2, 
    MoreVertical, ChevronRight, Loader2, ArrowLeft, Package 
} from 'lucide-react';
import { getAddresses, createAddress, updateAddress, deleteAddress, setDefaultAddress } from '../api/address';
import { useNotification } from '../context/NotificationContext';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { Link } from 'react-router-dom';

const AddressManagement = () => {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const { showNotification } = useNotification();

    const [formData, setFormData] = useState({
        fullName: '',
        phoneNumber: '',
        street: '',
        city: '',
        district: '',
        state: '',
        zipCode: '',
        label: 'Home',
        isDefault: false
    });

    useEffect(() => {
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        try {
            setLoading(true);
            const res = await getAddresses();
            setAddresses(res.data);
        } catch (err) {
            showNotification('Failed to load access points', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (addr = null) => {
        if (addr) {
            setEditingAddress(addr);
            setFormData({ ...addr });
        } else {
            setEditingAddress(null);
            setFormData({
                fullName: '',
                phoneNumber: '',
                street: '',
                city: '',
                district: '',
                state: '',
                zipCode: '',
                label: 'Home',
                isDefault: addresses.length === 0
            });
        }
        setModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingAddress) {
                await updateAddress(editingAddress.id, formData);
                showNotification('Address updated successfully', 'success');
            } else {
                await createAddress(formData);
                showNotification('New address secured', 'success');
            }
            setModalOpen(false);
            fetchAddresses();
        } catch (err) {
            showNotification('Security breach: Failed to save address', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Erase this location permanently?')) return;
        try {
            await deleteAddress(id);
            showNotification('Location purged', 'success');
            fetchAddresses();
        } catch (err) {
            showNotification('Failed to remove location', 'error');
        }
    };

    const handleSetDefault = async (id) => {
        try {
            await setDefaultAddress(id);
            showNotification('Primary delivery hub updated', 'success');
            fetchAddresses();
        } catch (err) {
            showNotification('Failed to update primary hub', 'error');
        }
    };

    return (
        <div className="min-h-screen bg-surface-bg pt-20 pb-12">
            <Header />
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex items-center justify-between mb-12">
                    <div className="text-left">
                        <h1 className="text-3xl font-black text-primary-900 tracking-tight uppercase">Shipping Hub</h1>
                        <p className="text-text-muted text-xs font-bold uppercase tracking-widest mt-1">Manage your premium delivery locations</p>
                    </div>
                    <button 
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 px-6 py-3 bg-primary-900 text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary-900/20 hover:bg-black transition-all active:scale-95"
                    >
                        <Plus size={16} /> New Location
                    </button>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 size={48} className="text-primary-900/20 animate-spin mb-4" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Scanning Grid...</p>
                    </div>
                ) : addresses.length === 0 ? (
                    <div className="bg-white rounded-[2.5rem] p-16 text-center border border-dashed border-slate-200 shadow-sm">
                        <MapPin size={48} className="text-slate-100 mx-auto mb-6" />
                        <h3 className="text-lg font-black text-primary-900 uppercase tracking-tight mb-2">No Locations Saved</h3>
                        <p className="text-text-muted text-xs font-bold mb-8 max-w-xs mx-auto">Add your first shipping address to experience seamless global fulfillment.</p>
                        <button 
                            onClick={() => handleOpenModal()}
                            className="px-8 py-3 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95"
                        >
                            Register Primary Hub
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {addresses.map((addr) => (
                            <div key={addr.id} className={`bg-white rounded-3xl p-8 border hover:shadow-xl transition-all relative group overflow-hidden ${addr.isDefault ? 'border-primary-900/10 shadow-lg shadow-slate-200/50' : 'border-slate-100 opacity-80 hover:opacity-100'}`}>
                                {addr.isDefault && (
                                    <div className="absolute top-0 right-0 px-4 py-1.5 bg-primary-900 text-white text-[9px] font-black uppercase tracking-widest rounded-bl-2xl shadow-lg">
                                        Primary
                                    </div>
                                )}
                                
                                <div className="flex items-start justify-between mb-6">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${addr.label === 'Home' ? 'bg-blue-50 text-blue-500' : 'bg-indigo-50 text-indigo-500'}`}>
                                        {addr.label === 'Home' ? <Home size={20} /> : <Briefcase size={20} />}
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleOpenModal(addr)} className="p-2.5 bg-slate-50 text-slate-400 hover:text-primary-900 rounded-xl transition-all"><Edit2 size={14} /></button>
                                        <button onClick={() => handleDelete(addr.id)} className="p-2.5 bg-slate-50 text-slate-400 hover:text-red-500 rounded-xl transition-all"><Trash2 size={14} /></button>
                                    </div>
                                </div>

                                <div className="text-left space-y-4">
                                    <div>
                                        <h4 className="text-sm font-black text-primary-900 uppercase tracking-tight">{addr.fullName}</h4>
                                        <p className="text-[10px] font-bold text-slate-400 mt-1">{addr.phoneNumber}</p>
                                    </div>
                                    <p className="text-xs font-bold text-text-muted leading-relaxed">
                                        {addr.street}, {addr.city}<br />
                                        {addr.district}, {addr.state} - {addr.zipCode}
                                    </p>
                                </div>

                                {!addr.isDefault && (
                                    <button 
                                        onClick={() => handleSetDefault(addr.id)}
                                        className="mt-8 w-full py-3 bg-slate-50 text-slate-400 text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-primary-900 hover:text-white transition-all duration-300"
                                    >
                                        Establish as Primary
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Address Modal */}
            {modalOpen && (
                <div className="fixed inset-0 bg-primary-900/20 backdrop-blur-md z-[500] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        <div className="p-10 pb-6 border-b border-slate-50 flex items-center justify-between sticky top-0 bg-white z-10">
                            <div className="text-left">
                                <h2 className="text-xl font-black text-primary-900 uppercase tracking-tight">Location Registration</h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Configure your fulfillment point</p>
                            </div>
                            <button onClick={() => setModalOpen(false)} className="text-slate-300 hover:text-primary-900 transition-colors"><ChevronRight size={24} className="rotate-90" /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-10 overflow-y-auto space-y-8 flex-1 custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2 text-left">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Recipient Name</label>
                                    <input 
                                        required value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-primary-900 focus:ring-2 focus:ring-primary-900/5 focus:bg-white focus:border-primary-900 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2 text-left">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Secure Contact</label>
                                    <input 
                                        required value={formData.phoneNumber} onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-primary-900 focus:ring-2 focus:ring-primary-900/5 focus:bg-white focus:border-primary-900 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 text-left">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Street Architecture</label>
                                <input 
                                    required value={formData.street} onChange={(e) => setFormData({...formData, street: e.target.value})}
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-primary-900 focus:ring-2 focus:ring-primary-900/5 focus:bg-white focus:border-primary-900 outline-none transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                <div className="space-y-2 text-left">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">City</label>
                                    <input required value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-primary-900 outline-none focus:ring-2 focus:ring-primary-900/5 focus:bg-white focus:border-primary-900 transition-all" />
                                </div>
                                <div className="space-y-2 text-left">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">District</label>
                                    <input required value={formData.district} onChange={(e) => setFormData({...formData, district: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-primary-900 outline-none focus:ring-2 focus:ring-primary-900/5 focus:bg-white focus:border-primary-900 transition-all" />
                                </div>
                                <div className="space-y-2 text-left">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Zip Code</label>
                                    <input required value={formData.zipCode} onChange={(e) => setFormData({...formData, zipCode: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-primary-900 outline-none focus:ring-2 focus:ring-primary-900/5 focus:bg-white focus:border-primary-900 transition-all" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2 text-left">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">State Registry</label>
                                    <input required value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-primary-900 outline-none focus:ring-2 focus:ring-primary-900/5 focus:bg-white focus:border-primary-900 transition-all" />
                                </div>
                                <div className="space-y-2 text-left">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Location Label</label>
                                    <div className="flex gap-2">
                                        {['Home', 'Work'].map(label => (
                                            <button 
                                                key={label} type="button" 
                                                onClick={() => setFormData({...formData, label})}
                                                className={`flex-1 py-4 px-2 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all border ${formData.label === label ? 'bg-primary-900 text-white border-primary-900' : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100'}`}
                                            >
                                                {label === 'Home' ? <Home size={12} className="inline mr-2" /> : <Briefcase size={12} className="inline mr-2" />}
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </form>

                        <div className="p-10 pt-6 bg-slate-50/50 border-t border-slate-50 flex gap-4">
                            <button 
                                type="button" onClick={() => setModalOpen(false)}
                                className="px-8 py-4 bg-white border border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-slate-100 transition-all"
                            >
                                Abort
                            </button>
                            <button 
                                onClick={handleSubmit} disabled={submitting}
                                className="flex-1 py-4 bg-primary-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-xl shadow-primary-900/20 hover:bg-black transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                            >
                                {submitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                                {submitting ? 'Authenticating Data...' : 'Commit Location'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default AddressManagement;
