import { useState, useEffect } from 'react';
import { Plus, Search, MoreVertical, Edit2, Trash2, FolderPlus, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../api/categories';
import { useNotification } from '../context/NotificationContext';

const CategoriesPage = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentCategory, setCurrentCategory] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [submitting, setSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const { showNotification } = useNotification();
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await getCategories();
            setCategories(res.data);
        } catch (err) {
            showNotification('error', err.response?.data?.message || 'Failed to fetch categories');
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Category name is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            showNotification('error', 'Please fill all required fields');
            return;
        }

        setSubmitting(true);
        try {
            if (currentCategory) {
                await updateCategory(currentCategory.id, formData);
                showNotification('success', 'Category updated successfully');
            } else {
                await createCategory(formData);
                showNotification('success', 'Category created successfully');
            }
            setIsModalOpen(false);
            setCurrentCategory(null);
            setFormData({ name: '', description: '' });
            setErrors({});
            fetchCategories();
        } catch (err) {
            const backendMessage = err.response?.data?.message;
            const errorMessage = Array.isArray(backendMessage) 
                ? backendMessage.join(', ') 
                : (backendMessage || 'Failed to save category');
            showNotification('error', errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this category? This will affect all associated products.')) return;
        try {
            await deleteCategory(id);
            showNotification('success', 'Category deleted successfully');
            fetchCategories();
        } catch (err) {
            showNotification('error', err.response?.data?.message || 'Failed to delete category');
        }
    };

    const openEdit = (cat) => {
        setCurrentCategory(cat);
        setFormData({ name: cat.name, description: cat.description });
        setIsModalOpen(true);
        setErrors({});
    };

    const filteredCategories = categories.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10 text-left">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-text-main tracking-tight">Categories</h1>
                    <p className="text-text-muted text-sm font-medium">Organize your products into logical groups.</p>
                </div>
                <button 
                    onClick={() => {
                        setCurrentCategory(null);
                        setFormData({ name: '', description: '' });
                        setIsModalOpen(true);
                        setErrors({});
                    }}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-accent-blue text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-all active:scale-95 shadow-sm shadow-accent-blue/20"
                >
                    <FolderPlus size={18} /> Add Category
                </button>
            </div>

            {/* Content Strip */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
                <div className="relative w-full md:w-96 group text-left">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search categories..."
                        className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-accent-blue/10 focus:border-accent-blue outline-none transition-all font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto text-left">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-wider">Category Name</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-wider">Description</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-wider text-center">Products</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                Array(3).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded-full w-32"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded-full w-64"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded-full w-8 mx-auto"></div></td>
                                        <td className="px-6 py-4 text-right"><div className="h-8 bg-slate-100 rounded-lg w-16 ml-auto"></div></td>
                                    </tr>
                                ))
                            ) : filteredCategories.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-8 py-12 text-center text-slate-400 font-medium text-sm">No categories found matching your search.</td>
                                </tr>
                            ) : filteredCategories.map((cat) => (
                                <tr key={cat.id} className="hover:bg-slate-50/50 transition-all border-b border-slate-100 last:border-0">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-text-main text-sm">{cat.name}</div>
                                        <div className="text-[10px] font-bold text-text-muted uppercase tracking-tighter mt-1">ID: {cat.id.slice(-8)}</div>
                                    </td>
                                    <td className="px-6 py-4 max-w-md">
                                        <p className="text-text-muted text-xs line-clamp-1 font-medium">{cat.description}</p>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-text-muted border border-slate-200">
                                            {cat._count?.products || 0} items
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                onClick={() => openEdit(cat)}
                                                className="p-2 text-slate-400 hover:text-accent-blue hover:bg-slate-100 rounded-lg transition-all"
                                                title="Edit category"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(cat.id)}
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                title="Delete category"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden divide-y divide-slate-100">
                    {loading ? (
                        Array(3).fill(0).map((_, i) => (
                            <div key={i} className="p-4 space-y-3 animate-pulse">
                                <div className="h-4 bg-slate-100 rounded-full w-32"></div>
                                <div className="h-3 bg-slate-100 rounded-full w-full"></div>
                                <div className="h-3 bg-slate-100 rounded-full w-20"></div>
                            </div>
                        ))
                    ) : filteredCategories.length === 0 ? (
                        <div className="p-12 text-center">
                            <Plus className="mx-auto text-slate-200 mb-4" size={48} />
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No categories found</p>
                        </div>
                    ) : (
                        filteredCategories.map(cat => (
                            <div key={cat.id} className="p-4 space-y-3 hover:bg-slate-50 transition-colors">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-text-main text-sm">{cat.name}</h3>
                                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest tracking-tighter">ID: {cat.id.slice(-8)}</p>
                                    </div>
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-text-muted border border-slate-200">
                                        {cat._count?.products || 0} items
                                    </span>
                                </div>
                                <p className="text-text-muted text-xs font-medium leading-relaxed line-clamp-2">{cat.description}</p>
                                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-50">
                                    <button onClick={() => openEdit(cat)} className="flex items-center gap-1 px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-slate-100">
                                        <Edit2 size={12} /> Edit
                                    </button>
                                    <button onClick={() => handleDelete(cat.id)} className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-red-100">
                                        <Trash2 size={12} /> Delete
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[400] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-text-main">
                                    {currentCategory ? 'Edit Category' : 'Create Category'}
                                </h2>
                                <p className="text-xs text-text-muted font-medium mt-0.5">Define category properties below.</p>
                            </div>
                            <button 
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setErrors({});
                                }} 
                                className="p-2 hover:bg-slate-50 rounded-lg transition-all text-slate-400"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-white text-left">
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-text-muted ml-0.5">Category Name</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. Electronics"
                                        className={`w-full px-4 py-2.5 bg-white border ${errors.name ? 'border-red-500 bg-red-50/10' : 'border-slate-200'} rounded-lg text-sm focus:ring-2 focus:ring-accent-blue/10 focus:border-accent-blue outline-none transition-all font-medium`}
                                        value={formData.name}
                                        onChange={(e) => {
                                            setFormData({ ...formData, name: e.target.value });
                                            if (errors.name) setErrors({ ...errors, name: null });
                                        }}
                                    />
                                    {errors.name && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.name}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-text-muted ml-0.5">Description</label>
                                    <textarea 
                                        rows="4"
                                        placeholder="Describe what kind of products belong here..."
                                        className={`w-full px-4 py-3 bg-white border ${errors.description ? 'border-red-500 bg-red-50/10' : 'border-slate-200'} rounded-lg text-sm focus:ring-2 focus:ring-accent-blue/10 focus:border-accent-blue outline-none transition-all font-medium leading-relaxed resize-none`}
                                        value={formData.description}
                                        onChange={(e) => {
                                            setFormData({ ...formData, description: e.target.value });
                                            if (errors.description) setErrors({ ...errors, description: null });
                                        }}
                                    />
                                    {errors.description && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.description}</p>}
                                </div>
                            </div>

                            <div className="flex gap-4 pt-2">
                                <button 
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-2.5 bg-white border border-slate-200 text-text-muted rounded-lg font-bold text-xs hover:bg-slate-50 transition-all active:scale-95"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-[2] py-2.5 bg-accent-blue text-white rounded-lg font-bold text-xs hover:bg-blue-700 transition-all active:scale-95 shadow-sm shadow-accent-blue/20 disabled:opacity-50"
                                >
                                    {submitting ? 'Saving...' : (currentCategory ? 'Update Category' : 'Create Category')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoriesPage;
