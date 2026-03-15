import { useState, useEffect } from 'react';
import { Plus, Search, MoreVertical, Edit2, Trash2, FolderPlus, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../api/categories';

const CategoriesPage = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentCategory, setCurrentCategory] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [submitting, setSubmitting] = useState(false);
    const [notification, setNotification] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await getCategories();
            setCategories(res.data);
        } catch (err) {
            showNotification('error', err.response?.data?.message || 'Failed to fetch categories');
        } finally {
            setLoading(false);
        }
    };

    const showNotification = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
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
            fetchCategories();
        } catch (err) {
            showNotification('error', err.response?.data?.message || 'Failed to save category');
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
    };

    const filteredCategories = categories.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Categories</h1>
                    <p className="text-slate-500">Organize your products into logical groups.</p>
                </div>
                <button 
                    onClick={() => {
                        setCurrentCategory(null);
                        setFormData({ name: '', description: '' });
                        setIsModalOpen(true);
                    }}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-200"
                >
                    <FolderPlus size={20} /> Add Category
                </button>
            </div>

            {/* Notification */}
            {notification && (
                <div className={`fixed top-8 right-8 z-[100] p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-8 duration-300 ${
                    notification.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                    {notification.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                    <span className="font-bold">{notification.message}</span>
                </div>
            )}

            {/* Main Content */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex items-center gap-4">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                        <input 
                            type="text" 
                            placeholder="Search categories..."
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Category Name</th>
                                <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Description</th>
                                <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Products</th>
                                <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                Array(3).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-8 py-6"><div className="h-4 bg-slate-100 rounded-full w-32"></div></td>
                                        <td className="px-8 py-6"><div className="h-4 bg-slate-100 rounded-full w-64"></div></td>
                                        <td className="px-8 py-6"><div className="h-4 bg-slate-100 rounded-full w-8 mx-auto"></div></td>
                                        <td className="px-8 py-6 text-right"><div className="h-8 bg-slate-100 rounded-lg w-20 ml-auto"></div></td>
                                    </tr>
                                ))
                            ) : filteredCategories.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-8 py-12 text-center text-slate-400 font-medium">No categories found matching your search.</td>
                                </tr>
                            ) : filteredCategories.map((cat) => (
                                <tr key={cat.id} className="hover:bg-slate-50/30 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="font-bold text-slate-900 text-lg">{cat.name}</div>
                                    </td>
                                    <td className="px-8 py-6 max-w-md">
                                        <div className="text-slate-500 truncate">{cat.description}</div>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">
                                            {cat._count?.products || 0}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => openEdit(cat)}
                                                className="p-2 hover:bg-white hover:text-blue-600 hover:shadow-md rounded-xl transition-all text-slate-400"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(cat.id)}
                                                className="p-2 hover:bg-white hover:text-red-600 hover:shadow-md rounded-xl transition-all text-slate-400"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
                        <button 
                            onClick={() => setIsModalOpen(false)} 
                            className="absolute top-6 right-6 p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400"
                        >
                            <X size={20} />
                        </button>

                        <form onSubmit={handleSubmit} className="p-10 space-y-6">
                            <div className="text-center mb-4">
                                <h2 className="text-3xl font-bold text-slate-900 mb-2">
                                    {currentCategory ? 'Edit Category' : 'New Category'}
                                </h2>
                                <p className="text-slate-500">Provide details for your category group.</p>
                            </div>

                            <div className="space-y-4 text-left">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 ml-1">Category Name</label>
                                    <input 
                                        type="text" 
                                        required
                                        placeholder="Mobile Phones, Accessories..."
                                        className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 ml-1">Description</label>
                                    <textarea 
                                        rows="3"
                                        required
                                        placeholder="Add a brief description..."
                                        className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium resize-none"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button 
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-4 bg-slate-50 text-slate-600 rounded-2xl font-bold hover:bg-slate-100 transition-all active:scale-95"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-200 disabled:opacity-50"
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
