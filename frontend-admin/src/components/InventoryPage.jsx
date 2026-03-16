import { useState, useEffect, useRef } from 'react';
import {
    Plus, Search, Edit2, Trash2, Package, X, CheckCircle2, AlertCircle,
    Upload, Filter, ChevronLeft, ChevronRight, Image as ImageIcon, IndianRupee, Tag, Layers
} from 'lucide-react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../api/products';
import { getCategories } from '../api/categories';

const InventoryPage = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 0 });

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        discountPercentage: '0',
        stock: '',
        categoryId: '',
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const [submitting, setSubmitting] = useState(false);
    const [notification, setNotification] = useState(null);
    const [filters, setFilters] = useState({ search: '', categoryId: '', page: 1 });
    const [searchTerm, setSearchTerm] = useState('');

    const fileInputRef = useRef(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            setFilters(prev => ({ ...prev, search: searchTerm, page: 1 }));
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        fetchData();
    }, [filters]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [prodRes, catRes] = await Promise.all([
                getProducts(filters),
                getCategories()
            ]);
            setProducts(prodRes.data.products);
            setMeta(prodRes.data.meta);
            setCategories(catRes.data);
        } catch (err) {
            showNotification('error', err.response?.data?.message || 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const showNotification = (type, message) => {
        setNotification({ type, message });
        const duration = type === 'error' ? 5000 : 3000;
        setTimeout(() => setNotification(null), duration);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setPreviewUrl(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (!currentProduct && !selectedFile) {
                showNotification('error', 'Please upload a product image');
                setSubmitting(false);
                return;
            }

            const data = new FormData();
            Object.keys(formData).forEach(key => data.append(key, formData[key]));
            if (selectedFile) data.append('image', selectedFile);

            if (currentProduct) {
                await updateProduct(currentProduct.id, data);
                showNotification('success', 'Product updated successfully');
            } else {
                await createProduct(data);
                showNotification('success', 'Product created successfully');
            }

            closeModal();
            fetchData();
        } catch (err) {
            showNotification('error', err.response?.data?.message || 'Failed to save product');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this product permanently?')) return;
        try {
            await deleteProduct(id);
            showNotification('success', 'Product deleted successfully');
            fetchData();
        } catch (err) {
            showNotification('error', err.response?.data?.message || 'Failed to delete product');
        }
    };

    const openModal = (product = null) => {
        if (product) {
            setCurrentProduct(product);
            setFormData({
                name: product.name,
                description: product.description,
                price: product.price,
                discountPercentage: product.discountPercentage,
                stock: product.stock,
                categoryId: product.categoryId,
            });
            setPreviewUrl(product.imageUrl);
        } else {
            setCurrentProduct(null);
            setFormData({
                name: '',
                description: '',
                price: '',
                discountPercentage: '0',
                stock: '',
                categoryId: categories[0]?.id || '',
            });
            setPreviewUrl(null);
        }
        setSelectedFile(null);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedFile(null);
        setPreviewUrl(null);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Inventory</h1>
                    <p className="text-slate-500">Manage your products and stock levels.</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-[1.25rem] font-bold hover:bg-blue-700 transition-all active:scale-95 shadow-xl shadow-blue-100"
                >
                    <Plus size={20} /> Add Product
                </button>
            </div>

            {/* Notification */}
            {notification && (
                <div className={`fixed top-8 right-8 z-[150] p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-8 duration-300 ${notification.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}>
                    {notification.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                    <span className="font-bold">{notification.message}</span>
                </div>
            )}

            {/* Filters & Search */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
                <div className="lg:col-span-2 relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                    <input
                        type="search"
                        placeholder="Search products..."
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="relative">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <select
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none font-medium text-slate-700"
                        value={filters.categoryId}
                        onChange={(e) => setFilters({ ...filters, categoryId: e.target.value, page: 1 })}
                    >
                        <option value="">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Product Table */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto text-left">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Product</th>
                                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Category</th>
                                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Price</th>
                                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Stock</th>
                                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-8 py-6 flex items-center gap-4">
                                            <div className="w-14 h-14 bg-slate-100 rounded-2xl"></div>
                                            <div className="space-y-2">
                                                <div className="h-4 bg-slate-100 rounded-full w-48"></div>
                                                <div className="h-3 bg-slate-100 rounded-full w-32 text-xs"></div>
                                            </div>
                                        </td>
                                        <td colSpan="4" className="px-8"><div className="h-4 bg-slate-50 rounded-full w-full"></div></td>
                                    </tr>
                                ))
                            ) : products.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4 text-slate-400">
                                            <Package size={48} className="opacity-20" />
                                            <p className="font-medium">No products found. Start by adding one!</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : products.map(prod => (
                                <tr key={prod.id} className="hover:bg-slate-50/30 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-slate-50 rounded-2xl overflow-hidden flex-shrink-0 border border-slate-100">
                                                {prod.imageUrl ? (
                                                    <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                        <ImageIcon size={24} />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900 text-lg">{prod.name}</div>
                                                <div className="text-slate-400 text-sm truncate max-w-[200px]">ID: {prod.id.slice(0, 8)}...</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold">
                                            {prod.category?.name || 'Uncategorized'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-900">${prod.price}</span>
                                            {prod.discountPercentage > 0 && (
                                                <span className="text-green-600 text-xs font-bold">-{prod.discountPercentage}% Off</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${prod.stock > 10 ? 'bg-slate-100 text-slate-600' : 'bg-red-50 text-red-600'
                                            }`}>
                                            {prod.stock} in stock
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => openModal(prod)}
                                                className="p-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:shadow-md rounded-xl transition-all active:scale-95"
                                                title="Edit product"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(prod.id)}
                                                className="p-2.5 bg-red-50 text-red-500 hover:bg-red-100 hover:shadow-md rounded-xl transition-all active:scale-95"
                                                title="Delete product"
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

                {/* Pagination */}
                {meta.totalPages > 1 && (
                    <div className="px-8 py-6 bg-slate-50/50 flex items-center justify-between border-t border-slate-50">
                        <div className="text-slate-500 text-sm font-medium">
                            Showing page <span className="text-slate-900 font-bold">{meta.page}</span> of {meta.totalPages}
                        </div>
                        <div className="flex gap-2">
                            <button
                                disabled={filters.page === 1}
                                onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                                className="p-2 bg-white rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-all font-bold text-sm"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <button
                                disabled={filters.page === meta.totalPages}
                                onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                                className="p-2 bg-white rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-all font-bold text-sm"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
                        <button
                            onClick={closeModal}
                            className="absolute top-8 right-8 p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400 z-10"
                        >
                            <X size={24} />
                        </button>

                        <form onSubmit={handleSubmit} className="flex flex-col h-[90vh] md:h-auto overflow-y-auto">
                            <div className="p-10 pb-0">
                                <h2 className="text-3xl font-bold text-slate-900 mb-2">
                                    {currentProduct ? 'Edit Product' : 'Add New Product'}
                                </h2>
                                <p className="text-slate-500">Fill in the details to list your product.</p>
                            </div>

                            <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Left Side: Image Upload */}
                                <div className="space-y-4">
                                    <label className="text-sm font-bold text-slate-700 ml-1">Product Media</label>
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="aspect-square bg-slate-50 rounded-[2.5rem] border-4 border-dashed border-slate-100 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100/50 hover:border-blue-100 transition-all relative group overflow-hidden"
                                    >
                                        {previewUrl ? (
                                            <>
                                                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <Upload className="text-white" size={32} />
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-center p-6 text-slate-400 group-hover:text-blue-500 transition-colors">
                                                <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:shadow-md transition-all">
                                                    <Upload size={32} />
                                                </div>
                                                <p className="font-bold">Upload Image</p>
                                                <p className="text-xs mt-1">PNG, JPG up to 10MB</p>
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                </div>

                                {/* Right Side: Details */}
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 ml-1">Product Name</label>
                                        <div className="relative">
                                            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input
                                                type="text" required placeholder="iPhone 15 Pro, Smart Watch..."
                                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 ml-1">Category</label>
                                        <div className="relative">
                                            <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <select
                                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none font-medium"
                                                required
                                                value={formData.categoryId}
                                                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                            >
                                                <option value="" disabled>Select category</option>
                                                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 ml-1">Price (₹)</label>
                                            <div className="relative">
                                                <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                <input
                                                    type="number" step="1" required placeholder="500"
                                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                                                    value={formData.price}
                                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 ml-1">Stock</label>
                                            <div className="relative">
                                                <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                <input
                                                    type="number" required placeholder="100"
                                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                                                    value={formData.stock}
                                                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 ml-1">Discount (%)</label>
                                        <input
                                            type="number" placeholder="5, 10, 20..."
                                            className="w-full px-5 py-3 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                                            value={formData.discountPercentage}
                                            onChange={(e) => setFormData({ ...formData, discountPercentage: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-sm font-bold text-slate-700 ml-1">Description</label>
                                    <textarea
                                        rows="2" required placeholder="Enter product details..."
                                        className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 font-medium resize-none"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="p-10 pt-0 flex gap-4">
                                <button
                                    type="button" onClick={closeModal}
                                    className="flex-1 py-4 bg-slate-50 text-slate-500 rounded-2xl font-bold hover:bg-slate-100 transition-all active:scale-95"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit" disabled={submitting}
                                    className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all active:scale-95 shadow-xl shadow-blue-100 disabled:opacity-50"
                                >
                                    {submitting ? 'Processing...' : (currentProduct ? 'Save Changes' : 'Create Product')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InventoryPage;
