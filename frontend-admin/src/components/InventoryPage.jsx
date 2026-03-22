import { useState, useEffect, useRef } from 'react';
import {
    Plus, Search, Edit2, Trash2, Package, X, CheckCircle2, AlertCircle,
    Upload, Filter, ChevronLeft, ChevronRight, Image as ImageIcon, IndianRupee, Tag, Layers
} from 'lucide-react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../api/products';
import { getCategories } from '../api/categories';
import { getBrands } from '../api/brands';
import { useNotification } from '../context/NotificationContext';

const InventoryPage = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
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
        minStock: '5',
        categoryId: '',
        brandId: '',
    });
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);

    const [submitting, setSubmitting] = useState(false);
    const { showNotification } = useNotification();
    const [filters, setFilters] = useState({ search: '', categoryId: '', page: 1 });
    const [searchTerm, setSearchTerm] = useState('');

    const [errors, setErrors] = useState({});
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
            const [prodRes, catRes, brandRes] = await Promise.all([
                getProducts(filters),
                getCategories(),
                getBrands()
            ]);
            setProducts(prodRes.data.products);
            setMeta(prodRes.data.meta);
            setCategories(catRes.data);
            setBrands(brandRes.data);
        } catch (err) {
            showNotification('error', err.response?.data?.message || 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            setSelectedFiles(prev => [...prev, ...files]);
            
            files.forEach(file => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreviewUrls(prev => [...prev, reader.result]);
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const removeImage = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Product name is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        if (!formData.price || formData.price <= 0) newErrors.price = 'Valid price is required';
        if (!formData.stock || formData.stock < 0) newErrors.stock = 'Valid stock amount is required';
        if (!formData.categoryId) newErrors.categoryId = 'Category is required';
        if (!currentProduct && selectedFiles.length === 0) newErrors.image = 'At least one product image is required';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            showNotification('error', 'Please fill all required fields correctly');
            return;
        }

        setSubmitting(true);
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'brandId' && !formData[key]) return;
                data.append(key, formData[key]);
            });
            
            // Append multiple files
            selectedFiles.forEach(file => {
                data.append('images', file);
            });

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
            const backendMessage = err.response?.data?.message;
            const errorMessage = Array.isArray(backendMessage) 
                ? backendMessage.join(', ') 
                : (backendMessage || 'Failed to save product');
            showNotification('error', errorMessage);
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
                minStock: product.minStock || '5',
                categoryId: product.categoryId,
                brandId: product.brandId || '',
            });
            // Handle existing images
            const existingImages = product.images?.map(img => img.url) || [product.imageUrl];
            setPreviewUrls(existingImages.filter(Boolean));
        } else {
            setCurrentProduct(null);
            setFormData({
                name: '',
                description: '',
                price: '',
                discountPercentage: '0',
                stock: '',
                minStock: '5',
                categoryId: categories[0]?.id || '',
                brandId: '',
            });
            setPreviewUrls([]);
        }
        setSelectedFiles([]);
        setIsModalOpen(true);
        setErrors({});
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedFiles([]);
        setPreviewUrls([]);
        setErrors({});
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10 text-left">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-text-main tracking-tight">Inventory</h1>
                    <p className="text-text-muted text-sm font-medium">Manage your product catalog and stock levels.</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-accent-blue text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-all active:scale-95 shadow-sm shadow-accent-blue/20"
                >
                    <Plus size={18} /> Add Product
                </button>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="search"
                        placeholder="Search products..."
                        className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-accent-blue/10 focus:border-accent-blue outline-none transition-all font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="w-full md:w-48">
                    <select
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-xs font-bold uppercase tracking-wider text-text-main cursor-pointer focus:ring-2 focus:ring-accent-blue/10 focus:border-accent-blue outline-none"
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

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto text-left">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-wider">Product Details</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-wider">Category</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-wider text-center">Brand</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-wider">Price</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-wider">Stock</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4 flex items-center gap-3">
                                            <div className="w-12 h-12 bg-slate-100 rounded-lg"></div>
                                            <div className="space-y-2">
                                                <div className="h-3 bg-slate-100 rounded-full w-32"></div>
                                                <div className="h-2 bg-slate-100 rounded-full w-20"></div>
                                            </div>
                                        </td>
                                        <td colSpan="5" className="px-6"><div className="h-4 bg-slate-50 rounded-full w-full"></div></td>
                                    </tr>
                                ))
                            ) : products.map(prod => (
                                <tr key={prod.id} className="hover:bg-slate-50/50 transition-all border-b border-slate-100 last:border-0">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-slate-50 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200 p-1">
                                                {prod.imageUrl ? (
                                                    <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-contain" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                        <ImageIcon size={20} />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-bold text-text-main text-sm truncate max-w-[200px]">{prod.name}</div>
                                                <div className="text-text-muted text-[10px] font-bold mt-1 uppercase tracking-tighter">SKU-{prod.id.slice(-6)}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="px-2.5 py-1 bg-slate-100 text-text-muted rounded-md text-[10px] font-bold uppercase tracking-wider border border-slate-200">
                                            {prod.category?.name || 'Uncategorized'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {prod.brand ? (
                                            <span className="px-2.5 py-1 bg-accent-blue/5 text-accent-blue rounded-md text-[10px] font-bold uppercase tracking-wider border border-accent-blue/10">
                                                {prod.brand.name}
                                            </span>
                                        ) : (
                                            <span className="text-[10px] font-bold text-slate-300 uppercase italic">No Brand</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-text-main text-sm">₹{prod.price}</span>
                                            {prod.discountPercentage > 0 && (
                                                <span className="text-emerald-600 text-[10px] font-bold mt-0.5">-{prod.discountPercentage}% off</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className={`inline-flex flex-col items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${
                                                prod.stock > (prod.minStock || 5) ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                                            }`}>
                                            <div className="flex items-center gap-1.5">
                                                <div className={`w-1.5 h-1.5 rounded-full ${prod.stock > (prod.minStock || 5) ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`}></div>
                                                {prod.stock} in stock
                                            </div>
                                            {prod.stock <= (prod.minStock || 5) && (
                                                <span className="text-[8px] opacity-70 tracking-tighter">(Min: {prod.minStock || 5})</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => openModal(prod)}
                                                className="p-2 text-slate-400 hover:text-accent-blue hover:bg-slate-100 rounded-lg transition-all"
                                                title="Edit product"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(prod.id)}
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                title="Delete product"
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
                            <div key={i} className="p-4 space-y-4 animate-pulse">
                                <div className="flex gap-4">
                                    <div className="w-16 h-16 bg-slate-100 rounded-lg"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-slate-100 rounded-full w-3/4"></div>
                                        <div className="h-3 bg-slate-100 rounded-full w-1/2"></div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : products.length > 0 ? (
                        products.map(prod => (
                            <div key={prod.id} className="p-4 space-y-4 hover:bg-slate-50 transition-colors">
                                <div className="flex gap-4">
                                    <div className="w-20 h-20 bg-slate-50 rounded-xl overflow-hidden flex-shrink-0 border border-slate-200 p-1">
                                        {prod.imageUrl ? (
                                            <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-contain" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                <ImageIcon size={24} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start gap-2">
                                            <h3 className="font-bold text-text-main text-sm line-clamp-2 leading-tight">{prod.name}</h3>
                                            <div className="flex gap-1 shrink-0">
                                                <button onClick={() => openModal(prod)} className="p-1.5 text-slate-400 hover:text-accent-blue hover:bg-accent-blue/5 rounded-md">
                                                    <Edit2 size={14} />
                                                </button>
                                                <button onClick={() => handleDelete(prod.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-[10px] font-bold text-text-muted mt-1 uppercase tracking-tight">SKU-{prod.id.slice(-6)}</p>
                                        
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            <span className="px-2 py-0.5 bg-slate-100 text-text-muted rounded-md text-[9px] font-bold uppercase tracking-wider border border-slate-200">
                                                {prod.category?.name || 'Uncategorized'}
                                            </span>
                                            {prod.brand && (
                                                <span className="px-2 py-0.5 bg-accent-blue/5 text-accent-blue rounded-md text-[9px] font-bold uppercase tracking-wider border border-accent-blue/10">
                                                    {prod.brand.name}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest leading-none mb-1">Price</span>
                                        <div className="flex items-center gap-1.5">
                                            <span className="font-black text-text-main text-base">₹{prod.price}</span>
                                            {prod.discountPercentage > 0 && (
                                                <span className="text-emerald-600 text-[10px] font-bold">-{prod.discountPercentage}%</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className={`flex flex-col items-end px-3 py-1.5 rounded-lg border ${
                                        prod.stock > (prod.minStock || 5) ? 'bg-emerald-50/50 border-emerald-100' : 'bg-red-50/50 border-red-100'
                                    }`}>
                                        <span className="text-[8px] font-bold text-text-muted uppercase tracking-widest mb-1">Available Stock</span>
                                        <div className="flex items-center gap-1.5">
                                            <div className={`w-1.5 h-1.5 rounded-full ${prod.stock > (prod.minStock || 5) ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`}></div>
                                            <span className={`text-[11px] font-black ${prod.stock > (prod.minStock || 5) ? 'text-emerald-700' : 'text-red-700'}`}>
                                                {prod.stock} Units
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-12 text-center">
                            <Package className="mx-auto text-slate-200 mb-4" size={48} />
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No products found</p>
                        </div>
                    )}
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
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[400] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white relative z-10">
                            <div>
                                <h2 className="text-xl font-bold text-text-main">
                                    {currentProduct ? 'Edit Product' : 'Add New Product'}
                                </h2>
                                <p className="text-xs text-text-muted font-medium mt-0.5">Enter the product details below.</p>
                            </div>
                            <button
                                onClick={closeModal}
                                className="p-2 hover:bg-slate-50 rounded-lg transition-all text-slate-400"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col max-h-[85vh] overflow-y-auto bg-white">
                            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Image Upload */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Product Gallery</label>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedFiles.length + (currentProduct?.images?.length || 0)} Images</span>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-3 min-h-[200px]">
                                        {previewUrls.map((url, index) => (
                                            <div key={index} className="group relative aspect-square bg-slate-50 rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all">
                                                <img src={url} alt={`Preview ${index}`} className="w-full h-full object-contain p-2" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(index)}
                                                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                                >
                                                    <X size={12} />
                                                </button>
                                                {index === 0 && (
                                                    <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-accent-blue text-white text-[8px] font-black uppercase tracking-widest rounded-md shadow-lg">
                                                        Main
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        
                                        {(previewUrls.length < 10) && (
                                            <div
                                                onClick={() => fileInputRef.current?.click()}
                                                className={`aspect-square bg-slate-50 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-white hover:border-accent-blue transition-all group ${errors.image ? 'border-red-300' : 'border-slate-200'}`}
                                            >
                                                <div className="text-center p-4">
                                                    <Upload size={20} className={`mx-auto mb-2 group-hover:text-accent-blue transition-colors ${errors.image ? 'text-red-400' : 'text-slate-400'}`} />
                                                    <p className={`text-[10px] font-bold uppercase tracking-wider group-hover:text-accent-blue transition-colors ${errors.image ? 'text-red-500' : 'text-slate-400'}`}>
                                                        {previewUrls.length > 0 ? 'Add More' : 'Upload Images'}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        multiple
                                        onChange={handleFileChange}
                                    />
                                    {errors.image && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.image}</p>}
                                </div>

                                {/* Details */}
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-text-muted ml-0.5">Product Name</label>
                                        <input
                                            type="text" placeholder="e.g. Premium Watch"
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
                                        <label className="text-xs font-bold text-text-muted ml-0.5">Category</label>
                                        <select
                                            className={`w-full px-4 py-2.5 bg-white border ${errors.categoryId ? 'border-red-500 bg-red-50/10' : 'border-slate-200'} rounded-lg text-sm focus:ring-2 focus:ring-accent-blue/10 focus:border-accent-blue outline-none transition-all font-medium cursor-pointer`}
                                            value={formData.categoryId}
                                            onChange={(e) => {
                                                setFormData({ ...formData, categoryId: e.target.value });
                                                if (errors.categoryId) setErrors({ ...errors, categoryId: null });
                                            }}
                                        >
                                            <option value="" disabled>Select a category</option>
                                            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                        </select>
                                        {errors.categoryId && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.categoryId}</p>}
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-text-muted ml-0.5">Brand (Optional)</label>
                                        <select
                                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-accent-blue/10 focus:border-accent-blue outline-none transition-all font-medium cursor-pointer"
                                            value={formData.brandId}
                                            onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
                                        >
                                            <option value="">No Brand</option>
                                            {brands.map(brand => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-text-muted ml-0.5">Price (₹)</label>
                                            <input
                                                type="number" step="1" placeholder="0"
                                                className={`w-full px-4 py-2.5 bg-white border ${errors.price ? 'border-red-500 bg-red-50/10' : 'border-slate-200'} rounded-lg text-sm focus:ring-2 focus:ring-accent-blue/10 focus:border-accent-blue outline-none transition-all font-bold`}
                                                value={formData.price}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, price: e.target.value });
                                                    if (errors.price) setErrors({ ...errors, price: null });
                                                }}
                                            />
                                            {errors.price && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.price}</p>}
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-text-muted ml-0.5">Stock</label>
                                            <input
                                                type="number" placeholder="0"
                                                className={`w-full px-4 py-2.5 bg-white border ${errors.stock ? 'border-red-500 bg-red-50/10' : 'border-slate-200'} rounded-lg text-sm focus:ring-2 focus:ring-accent-blue/10 focus:border-accent-blue outline-none transition-all font-bold`}
                                                value={formData.stock}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, stock: e.target.value });
                                                    if (errors.stock) setErrors({ ...errors, stock: null });
                                                }}
                                            />
                                            {errors.stock && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.stock}</p>}
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-text-muted ml-0.5">Min Stock</label>
                                            <input
                                                type="number" placeholder="5"
                                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-accent-blue/10 focus:border-accent-blue outline-none transition-all font-bold text-accent-blue"
                                                value={formData.minStock}
                                                onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-text-muted ml-0.5">Discount (%)</label>
                                        <input
                                            type="number" placeholder="0"
                                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-accent-blue/10 focus:border-accent-blue outline-none transition-all font-bold"
                                            value={formData.discountPercentage}
                                            onChange={(e) => setFormData({ ...formData, discountPercentage: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="md:col-span-2 space-y-1.5">
                                    <label className="text-xs font-bold text-text-muted ml-0.5">Product Description</label>
                                    <textarea
                                        rows="3" placeholder="Enter broad description of the product..."
                                        className={`w-full px-4 py-3 bg-white border ${errors.description ? 'border-red-500 bg-red-50/10' : 'border-slate-200'} rounded-lg text-sm focus:ring-2 focus:ring-accent-blue/10 focus:border-accent-blue outline-none transition-all font-medium leading-relaxed`}
                                        value={formData.description}
                                        onChange={(e) => {
                                            setFormData({ ...formData, description: e.target.value });
                                            if (errors.description) setErrors({ ...errors, description: null });
                                        }}
                                    />
                                    {errors.description && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.description}</p>}
                                </div>
                            </div>

                            <div className="px-8 py-6 border-t border-slate-100 flex gap-4 bg-slate-50/50">
                                <button
                                    type="button" onClick={closeModal}
                                    className="px-6 py-2.5 bg-white border border-slate-200 text-text-muted rounded-lg font-bold text-xs hover:bg-slate-50 transition-all active:scale-95"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit" disabled={submitting}
                                    className="flex-1 py-2.5 bg-accent-blue text-white rounded-lg font-bold text-xs hover:bg-blue-700 transition-all active:scale-95 shadow-sm shadow-accent-blue/20 disabled:opacity-50"
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
