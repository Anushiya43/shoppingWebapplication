import React, { useState, useEffect } from 'react';
import { Layers, Check, Save, X, Search, Filter, AlertCircle, ChevronDown, Percent } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import { getProducts, bulkUpdateProducts } from '../api/products';
import { getCategories } from '../api/categories';
import { getBrands } from '../api/brands';

const BulkInventoryPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
  const { showNotification } = useNotification();

  // Bulk Edit Form State
  const [bulkData, setBulkData] = useState({
    price: '',
    stock: '',
    minStock: '',
    discountPercentage: '',
    categoryId: '',
    brandId: '',
  });

  const [modes, setModes] = useState({
    price: 'fixed',
    stock: 'fixed',
    discountPercentage: 'fixed',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes, brandRes] = await Promise.all([
        getProducts({ limit: 100 }), // Paginate properly in a real app
        getCategories(),
        getBrands()
      ]);
      setProducts(prodRes.data.products || []);
      setCategories(catRes.data || []);
      setBrands(brandRes.data || []);
    } catch (err) {
      console.error('Failed to fetch bulk data:', err);
      showNotification('error', 'Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(products.map(p => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkUpdate = async () => {
    if (selectedIds.length === 0) return;
    
    // Clean bulk data - only send values that are not empty
    const payload = {};
    if (bulkData.price !== '') {
      if (modes.price === 'percentage') payload.priceAdj = { type: 'percentage', value: bulkData.price };
      else payload.price = bulkData.price;
    }
    if (bulkData.stock !== '') {
      if (modes.stock === 'percentage') payload.stockAdj = { type: 'percentage', value: bulkData.stock };
      else payload.stock = bulkData.stock;
    }
    if (bulkData.discountPercentage !== '') {
      if (modes.discountPercentage === 'percentage') payload.discountAdj = { type: 'percentage', value: bulkData.discountPercentage };
      else payload.discountPercentage = bulkData.discountPercentage;
    }
    if (bulkData.minStock !== '') payload.minStock = bulkData.minStock;
    if (bulkData.categoryId) payload.categoryId = bulkData.categoryId;
    if (bulkData.brandId) payload.brandId = bulkData.brandId;

    if (Object.keys(payload).length === 0) {
      showNotification('warning', 'No changes specified for bulk update');
      return;
    }

    try {
      showNotification('info', `Updating ${selectedIds.length} products...`);
      await bulkUpdateProducts(selectedIds, payload);
      showNotification('success', 'Bulk update completed successfully');
      setIsBulkEditOpen(false);
      setBulkData({ price: '', stock: '', minStock: '', discountPercentage: '', categoryId: '', brandId: '' });
      setSelectedIds([]);
      fetchData(); // Refresh data
    } catch (err) {
      showNotification('error', 'Bulk update failed');
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const ModeToggle = ({ field }) => (
    <div className="flex bg-slate-100 p-1 rounded-xl w-fit ml-auto mb-2 border border-slate-200 shadow-inner">
      <button
        onClick={() => setModes({ ...modes, [field]: 'fixed' })}
        className={`px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-lg transition-all ${
          modes[field] === 'fixed' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 opacity-60'
        }`}
      >
        Set Fixed
      </button>
      <button
        onClick={() => setModes({ ...modes, [field]: 'percentage' })}
        className={`px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-lg transition-all ${
          modes[field] === 'percentage' ? 'bg-accent-blue text-white shadow-md' : 'text-slate-400 opacity-60'
        }`}
      >
        Adjust %
      </button>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-500 pb-12 text-left">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-xl font-black text-text-main tracking-tight uppercase">Bulk Operations</h2>
          <p className="text-[10px] text-text-muted font-bold opacity-60 uppercase tracking-widest">Rapid inventory & pricing Management</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-accent-blue transition-colors" size={14} />
            <input
              type="text"
              placeholder="Filter by name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-100/50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-accent-blue/20 focus:bg-white transition-all w-64 shadow-inner"
            />
          </div>

          <button
            onClick={() => setIsBulkEditOpen(true)}
            disabled={selectedIds.length === 0}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg ${
              selectedIds.length > 0 
                ? 'bg-slate-900 text-white hover:bg-slate-800 hover:shadow-xl active:scale-95' 
                : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-50 shadow-none'
            }`}
          >
            <Layers size={14} />
            Batch Edit ({selectedIds.length})
          </button>
        </div>
      </div>

      {/* Bulk Edit Modal/Drawer */}
      {isBulkEditOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setIsBulkEditOpen(false)}></div>
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden border border-slate-200 animate-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Bulk Configuration</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Applying changes to {selectedIds.length} items</p>
              </div>
              <button 
                onClick={() => setIsBulkEditOpen(false)}
                className="w-10 h-10 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-900 hover:rotate-90 transition-all shadow-sm"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 grid grid-cols-2 gap-6">
              <div className="space-y-4">
                 <div>
                    <div className="flex items-center justify-between ml-4">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block italic">Price Change {modes.price === 'percentage' ? '(%)' : '(₹)'}</label>
                      <ModeToggle field="price" />
                    </div>
                    <input 
                       type="number"
                       placeholder={modes.price === 'percentage' ? "e.g. 10 for +10%, -5 for -5%" : "Leave blank for no change"}
                       value={bulkData.price}
                       onChange={(e) => setBulkData({...bulkData, price: e.target.value})}
                       className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-accent-blue/10 focus:border-accent-blue outline-none transition-all"
                    />
                 </div>
                 <div>
                    <div className="flex items-center justify-between ml-4">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block italic">Stock Update {modes.stock === 'percentage' ? '(%)' : '(QTY)'}</label>
                      <ModeToggle field="stock" />
                    </div>
                    <input 
                       type="number"
                       placeholder={modes.stock === 'percentage' ? "e.g. 50 for +50%, -10 for -10%" : "Leave blank for no change"}
                       value={bulkData.stock}
                       onChange={(e) => setBulkData({...bulkData, stock: e.target.value})}
                       className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-accent-blue/10 focus:border-accent-blue outline-none transition-all"
                    />
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 mb-2 block italic">Min Stock Threshold</label>
                    <input 
                       type="number"
                       placeholder="Alert when below this"
                       value={bulkData.minStock}
                       onChange={(e) => setBulkData({...bulkData, minStock: e.target.value})}
                       className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-accent-blue/10 focus:border-accent-blue outline-none transition-all"
                    />
                 </div>
              </div>
              <div className="space-y-4">
                 <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 mb-2 block italic">Category Reassignment</label>
                    <select
                      value={bulkData.categoryId}
                      onChange={(e) => setBulkData({...bulkData, categoryId: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-accent-blue/10 focus:border-accent-blue outline-none transition-all appearance-none"
                    >
                      <option value="">No Change</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 mb-2 block italic">Brand Migration</label>
                    <select
                      value={bulkData.brandId}
                      onChange={(e) => setBulkData({...bulkData, brandId: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-accent-blue/10 focus:border-accent-blue outline-none transition-all appearance-none"
                    >
                      <option value="">No Change</option>
                      {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                 </div>
                 <div>
                    <div className="flex items-center justify-between ml-4">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block italic">Discount Rate {modes.discountPercentage === 'percentage' ? '(Adj %)' : '(New %)'}</label>
                      <ModeToggle field="discountPercentage" />
                    </div>
                    <div className="relative group/input">
                      <Percent className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/input:text-accent-pink transition-colors" size={16} />
                      <input 
                         type="number"
                         placeholder={modes.discountPercentage === 'percentage' ? "e.g. 10 for +10% of current disc" : "Fixed percentage (0-99)"}
                         value={bulkData.discountPercentage}
                         onChange={(e) => setBulkData({...bulkData, discountPercentage: e.target.value})}
                         className="w-full pl-12 pr-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-accent-pink/10 focus:border-accent-pink outline-none transition-all"
                      />
                    </div>
                 </div>
              </div>
            </div>

            <div className="p-8 bg-slate-900 border-t border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-3 text-white/40">
                <AlertCircle size={20} className="text-amber-500" />
                <p className="text-[10px] font-black uppercase tracking-widest leading-none">Changes are permanent<br/>and apply instantly</p>
              </div>
              <button
                onClick={handleBulkUpdate}
                className="flex items-center gap-3 px-8 py-4 bg-white text-slate-900 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] hover:bg-slate-100 transition-all active:scale-95 shadow-xl shadow-white/10"
              >
                <Save size={18} />
                Deploy Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Table */}
      <div className="bg-white border border-slate-200/60 rounded-[2.5rem] shadow-xl overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-6 text-left">
                  <input 
                    type="checkbox"
                    checked={selectedIds.length === products.length && products.length > 0}
                    onChange={handleSelectAll}
                    className="w-5 h-5 rounded-lg border-2 border-slate-200 text-accent-blue focus:ring-accent-blue transition-all cursor-pointer"
                  />
                </th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Product Identity</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic text-center">Current Stock</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic text-center">Unit Price</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic text-center">Discount</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic text-right">Class</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="6" className="px-6 py-6 h-16 bg-slate-50/30"></td>
                  </tr>
                ))
              ) : filteredProducts.map((product) => (
                <tr 
                  key={product.id} 
                  className={`hover:bg-slate-50/50 transition-colors group cursor-pointer ${
                    selectedIds.includes(product.id) ? 'bg-accent-blue/[0.03]' : ''
                  }`}
                  onClick={() => handleSelectOne(product.id)}
                >
                  <td className="px-6 py-5" onClick={(e) => e.stopPropagation()}>
                    <input 
                      type="checkbox"
                      checked={selectedIds.includes(product.id)}
                      onChange={() => handleSelectOne(product.id)}
                      className="w-5 h-5 rounded-lg border-2 border-slate-200 text-accent-blue focus:ring-accent-blue transition-all cursor-pointer"
                    />
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 group-hover:scale-105 transition-transform">
                        {product.imageUrl ? (
                           <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                           <Layers size={20} className="m-auto mt-3 text-slate-300" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 tracking-tight">{product.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-60">SKU: {product.sku || 'N/A'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className={`text-xs font-black px-3 py-1.5 rounded-xl uppercase tracking-widest ${
                      product.stock <= product.minStock 
                        ? 'bg-red-50 text-red-600 border border-red-100 shadow-sm shadow-red-500/10' 
                        : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                    }`}>
                      {product.stock} Units
                    </span>
                    {product.stock <= product.minStock && (
                       <p className="text-[8px] font-black text-red-500 uppercase mt-1.5 flex items-center justify-center gap-1">
                          <AlertCircle size={8} /> CRITICAL
                       </p>
                    )}
                  </td>
                  <td className="px-6 py-5 text-center">
                    <p className="text-xs font-black text-slate-900 italic">₹{Number(product.price).toLocaleString()}</p>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className="text-xs font-black text-accent-pink bg-pink-50 border border-pink-100 px-3 py-1.5 rounded-xl uppercase tracking-widest">
                      {product.discountPercentage}% OFF
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{product.category?.name || 'Unmapped'}</p>
                    <p className="text-[9px] font-bold text-slate-300 uppercase tracking-wider">{product.brand?.name || 'Generics'}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {!loading && filteredProducts.length === 0 && (
          <div className="py-20 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mb-4">
               <Package className="text-slate-200" size={32} />
            </div>
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No products found in matrix</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkInventoryPage;
