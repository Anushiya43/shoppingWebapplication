import React, { useState, useEffect } from 'react';
import api from '../api';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Save, 
  X, 
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

const BannersPage = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();
  
  // Modal/Form state
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    isActive: true
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await api.get('/banners');
      setBanners(response.data);
    } catch (err) {
      console.error('Failed to fetch banners:', err);
      showNotification('error', 'Could not load banners. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleOpenModal = (banner = null) => {
    if (banner) {
      setEditingBanner(banner);
      setFormData({
        title: banner.title,
        subtitle: banner.subtitle,
        isActive: banner.isActive
      });
      setPreviewUrl(banner.imageUrl);
    } else {
      setEditingBanner(null);
      setFormData({
        title: '',
        subtitle: '',
        isActive: true
      });
      setPreviewUrl('');
    }
    setSelectedFile(null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingBanner(null);
    setSelectedFile(null);
    setPreviewUrl('');
    setFormData({
      title: '',
      subtitle: '',
      isActive: true
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const data = new FormData();
    data.append('title', formData.title);
    data.append('subtitle', formData.subtitle);
    data.append('isActive', formData.isActive);
    if (selectedFile) {
      data.append('image', selectedFile);
    }
    
    try {
      if (editingBanner) {
        await api.patch(`/banners/${editingBanner.id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        showNotification('success', 'Banner updated successfully!');
      } else {
        if (!selectedFile) {
          showNotification('error', 'Please select an image file.');
          setSubmitting(false);
          return;
        }
        await api.post('/banners', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        showNotification('success', 'Banner created successfully!');
      }
      handleCloseModal();
      fetchBanners();
    } catch (err) {
      console.error('Failed to save banner:', err);
      showNotification('error', err.response?.data?.message || 'Failed to save banner. Please check your data.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) return;
    
    try {
      await api.delete(`/id/${id}`);
      showNotification('success', 'Banner deleted successfully!');
      fetchBanners();
    } catch (err) {
      console.error('Failed to delete banner:', err);
      showNotification('error', 'Failed to delete banner.');
    }
  };

  const toggleStatus = async (banner) => {
    try {
      await api.patch(`/banners/${banner.id}`, {
        isActive: !banner.isActive
      });
      fetchBanners();
    } catch (err) {
      console.error('Failed to toggle banner status:', err);
    }
  };

  if (loading && banners.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-accent-blue mb-4" size={40} />
        <p className="text-slate-500 font-medium tracking-tight">Loading banners...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Banner Management</h2>
          <p className="text-slate-500 text-sm font-medium">Create and manage your home page hero banners</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-accent-blue text-white rounded-xl font-bold shadow-lg shadow-accent-blue/20 hover:bg-blue-600 transition-all active:scale-95"
        >
          <Plus size={20} /> Add New Banner
        </button>
      </div>

      {/* Banners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {banners.length === 0 ? (
          <div className="col-span-full bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] p-16 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-300">
              <ImageIcon size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No banners found</h3>
            <p className="text-slate-500 text-sm max-w-xs mx-auto mb-8">Add your first banner to see how it looks on the storefront.</p>
            <button
              onClick={() => handleOpenModal()}
              className="px-8 py-3 bg-slate-100 text-slate-900 rounded-xl font-bold hover:bg-slate-200 transition-all active:scale-95 border border-slate-200"
            >
              Get Started
            </button>
          </div>
        ) : (
          banners.map((banner) => (
            <div key={banner.id} className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-slate-100 group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
              {/* Preview Image */}
              <div className="aspect-video relative overflow-hidden bg-slate-50">
                <img 
                  src={banner.imageUrl} 
                  alt={banner.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                {!banner.isActive && (
                  <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center">
                    <span className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-white text-xs font-black tracking-widest uppercase border border-white/30">Inactive</span>
                  </div>
                )}
                <div className="absolute top-4 right-4 flex gap-2">
                  <button 
                    onClick={() => handleOpenModal(banner)}
                    className="p-2.5 bg-white/90 backdrop-blur-md text-slate-600 hover:text-accent-blue rounded-xl shadow-lg transition-all active:scale-90"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(banner.id)}
                    className="p-2.5 bg-white/90 backdrop-blur-md text-slate-600 hover:text-red-500 rounded-xl shadow-lg transition-all active:scale-90"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="p-6 flex flex-col flex-1">
                <div className="flex justify-between items-start gap-4 mb-2">
                  <h3 className="font-bold text-lg text-slate-900 leading-tight truncate">{banner.title}</h3>
                  <button 
                  onClick={() => toggleStatus(banner)}
                  className="shrink-0 transition-colors"
                  >
                    {banner.isActive ? (
                      <ToggleRight className="text-emerald-500" size={28} />
                    ) : (
                      <ToggleLeft className="text-slate-300" size={28} />
                    )}
                  </button>
                </div>
                <p className="text-slate-500 text-sm line-clamp-2 font-medium flex-1 mb-4">{banner.subtitle}</p>
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-widest pt-4 border-t border-slate-50">
                  ID: {banner.id.slice(0, 8)}...
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal / Form Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-fade-in">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={handleCloseModal} />
          <div className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-slide-in-bottom">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                {editingBanner ? 'Edit Banner' : 'Add New Banner'}
              </h3>
              <button onClick={handleCloseModal} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-white rounded-xl transition-all active:scale-90 shadow-sm border border-transparent hover:border-slate-100">
                <X size={20} />
              </button>
            </div>

            <form 
              onSubmit={handleSubmit} 
              className="p-8 space-y-5 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent"
            >
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Banner Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Summer Collection 2026"
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-accent-blue focus:bg-white outline-none transition-all font-semibold"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Subtitle / Description</label>
                <textarea
                  required
                  rows="2"
                  placeholder="Tell your customers about this collection..."
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-accent-blue focus:bg-white outline-none transition-all font-semibold resize-none"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Banner Image</label>
                <div className="relative group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-accent-blue focus:bg-white outline-none transition-all font-semibold"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">
                    <ImageIcon size={20} />
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-1 ml-1 flex items-center gap-1">
                  <AlertCircle size={10} /> {editingBanner ? 'Leave empty to keep current image' : 'Recommended size: 1920x600'}
                </p>
              </div>

              {/* Preview block if previewUrl exists */}
              {previewUrl && (
                <div className="mt-2 rounded-2xl overflow-hidden border-2 border-slate-100 aspect-video bg-slate-50 relative group">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/60 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] text-white font-black uppercase tracking-widest">Image Preview</span>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 py-2">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, isActive: !formData.isActive})}
                  className="flex items-center gap-3 group"
                >
                  {formData.isActive ? (
                    <ToggleRight className="text-emerald-500 group-hover:scale-110 transition-transform" size={32} />
                  ) : (
                    <ToggleLeft className="text-slate-300 group-hover:scale-110 transition-transform" size={32} />
                  )}
                  <span className="text-sm font-bold text-slate-600">Active and visible to customers</span>
                </button>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 py-4 bg-slate-100 text-slate-900 rounded-2xl font-bold border border-slate-200 hover:bg-slate-200 transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-[2] py-4 bg-accent-blue text-white rounded-2xl font-black shadow-xl shadow-accent-blue/20 hover:bg-blue-600 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      {editingBanner ? 'Update Banner' : 'Create Banner'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BannersPage;
