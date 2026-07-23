import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { getCurrentUser } from '../services/auth';
import SiteModal from '../components/SiteModal';

export default function Products() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategoryName, setSelectedCategoryName] = useState('ALL');

    // Showcase Carousel State
    const [activeSlide, setActiveSlide] = useState(0);

    // Modals
    const [showAddProductModal, setShowAddProductModal] = useState(false);
    const [showEditProductModal, setShowEditProductModal] = useState(false);
    const [showAddVariantModal, setShowAddVariantModal] = useState(false);
    const [showEditVariantModal, setShowEditVariantModal] = useState(false);
    const [showProductDetailModal, setShowProductDetailModal] = useState(false);
    
    const [selectedProductForVariant, setSelectedProductForVariant] = useState(null);
    const [selectedProductForEdit, setSelectedProductForEdit] = useState(null);
    const [selectedVariantForEdit, setSelectedVariantForEdit] = useState(null);
    const [selectedProductForDetail, setSelectedProductForDetail] = useState(null);

    // Form states - Add Product
    const [newProductName, setNewProductName] = useState('');
    const [newProductPrice, setNewProductPrice] = useState('');
    const [newProductStock, setNewProductStock] = useState('');
    const [newProductCategoryId, setNewProductCategoryId] = useState('');
    const [newProductImageUrl, setNewProductImageUrl] = useState('');

    // Form states - Edit Product
    const [editProductName, setEditProductName] = useState('');
    const [editProductPrice, setEditProductPrice] = useState('');
    const [editProductStock, setEditProductStock] = useState('');
    const [editProductCategoryId, setEditProductCategoryId] = useState('');
    const [editProductImageUrl, setEditProductImageUrl] = useState('');

    // Form states - Add Variant
    const [variantSku, setVariantSku] = useState('');
    const [variantColor, setVariantColor] = useState('');
    const [variantMaterial, setVariantMaterial] = useState('');
    const [variantSize, setVariantSize] = useState('');
    const [variantPrice, setVariantPrice] = useState('');
    const [variantStock, setVariantStock] = useState('');

    // Form states - Edit Variant
    const [editVariantSku, setEditVariantSku] = useState('');
    const [editVariantColor, setEditVariantColor] = useState('');
    const [editVariantMaterial, setEditVariantMaterial] = useState('');
    const [editVariantSize, setEditVariantSize] = useState('');
    const [editVariantPrice, setEditVariantPrice] = useState('');
    const [editVariantStock, setEditVariantStock] = useState('');

    // Selected variant per product map (productId -> selectedVariantId)
    const [selectedVariants, setSelectedVariants] = useState({});

    // Site modal notifications
    const [modalOpen, setModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalMessage, setModalMessage] = useState('');
    const [modalVariant, setModalVariant] = useState('info');

    const user = getCurrentUser();
    const customerRole = localStorage.getItem('customerRole') || user?.role || 'ROLE_CUSTOMER';
    const isAdmin = customerRole === 'ROLE_ADMIN' || customerRole === 'admin';

    const getCustomerId = () => {
        const raw = user?.id || user?.userId || user?.customerId || user?.sub || null;
        if (raw != null && !isNaN(Number(raw))) return Number(raw);
        const localId = localStorage.getItem('customerId');
        if (localId) return Number(localId);
        return null;
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/products');
            const data = response.data || response;
            setProducts(data);
            
            // Initialize default selected variants (first variant of each product)
            const defaults = {};
            data.forEach(p => {
                if (p.variants && p.variants.length > 0) {
                    defaults[p.id] = p.variants[0].id;
                }
            });
            setSelectedVariants(defaults);
            
            // Update selected product in detail view if it's currently open
            if (selectedProductForDetail) {
                const updated = data.find(p => p.id === selectedProductForDetail.id);
                if (updated) setSelectedProductForDetail(updated);
            }
        } catch (err) {
            console.error(err);
            setError('Ürünler yüklenirken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await api.get('/api/categories');
            const data = res.data || res;
            setCategories(data);
            if (data.length > 0) setNewProductCategoryId(data[0].id);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchCategories();

        // Auto play carousel
        const interval = setInterval(() => {
            setActiveSlide(prev => (prev + 1) % 3);
        }, 6000);
        return () => clearInterval(interval);
    }, []);

    // Create Product
    const handleCreateProduct = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                name: newProductName,
                price: Number(newProductPrice),
                stockQuantity: Number(newProductStock),
                categoryId: newProductCategoryId ? Number(newProductCategoryId) : null,
                imageUrl: newProductImageUrl
            };
            await api.post('/api/products', payload);
            
            setShowAddProductModal(false);
            setNewProductName('');
            setNewProductPrice('');
            setNewProductStock('');
            setNewProductImageUrl('');

            setModalTitle('Başarılı');
            setModalMessage('Ürün başarıyla oluşturuldu.');
            setModalVariant('success');
            setModalOpen(true);
            fetchProducts();
        } catch (err) {
            console.error(err);
            const serverMsg = err?.response?.data?.message || err?.response?.data || err.message;
            setModalTitle('Hata');
            setModalMessage(typeof serverMsg === 'string' ? serverMsg : 'Ürün eklenirken hata oluştu.');
            setModalVariant('error');
            setModalOpen(true);
        }
    };

    // Update Product
    const handleUpdateProduct = async (e) => {
        e.preventDefault();
        if (!selectedProductForEdit) return;
        try {
            const payload = {
                name: editProductName,
                price: Number(editProductPrice),
                stockQuantity: Number(editProductStock),
                categoryId: editProductCategoryId ? Number(editProductCategoryId) : null,
                imageUrl: editProductImageUrl
            };
            await api.put(`/api/products/${selectedProductForEdit.id}`, payload);
            
            setShowEditProductModal(false);
            setSelectedProductForEdit(null);

            setModalTitle('Başarılı');
            setModalMessage('Ürün başarıyla güncellendi.');
            setModalVariant('success');
            setModalOpen(true);
            fetchProducts();
        } catch (err) {
            console.error(err);
            const serverMsg = err?.response?.data?.message || err?.response?.data || err.message;
            setModalTitle('Hata');
            setModalMessage(typeof serverMsg === 'string' ? serverMsg : 'Ürün güncellenirken hata oluştu.');
            setModalVariant('error');
            setModalOpen(true);
        }
    };

    // Delete Product
    const handleDeleteProduct = async (productId) => {
        if (!window.confirm('Bu ürünü silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) return;
        try {
            await api.delete(`/api/products/${productId}`);
            setModalTitle('Başarılı');
            setModalMessage('Ürün başarıyla silindi.');
            setModalVariant('success');
            setModalOpen(true);
            
            if (selectedProductForDetail && selectedProductForDetail.id === productId) {
                setShowProductDetailModal(false);
                setSelectedProductForDetail(null);
            }
            
            fetchProducts();
        } catch (err) {
            console.error(err);
            const serverMsg = err?.response?.data?.message || err?.response?.data || err.message;
            setModalTitle('Hata');
            setModalMessage(typeof serverMsg === 'string' ? serverMsg : 'Ürün silinirken hata oluştu.');
            setModalVariant('error');
            setModalOpen(true);
        }
    };

    // Create Variant
    const handleCreateVariant = async (e) => {
        e.preventDefault();
        if (!selectedProductForVariant) return;
        try {
            const payload = {
                sku: variantSku,
                color: variantColor,
                material: variantMaterial,
                size: variantSize,
                price: Number(variantPrice),
                stockQuantity: Number(variantStock)
            };
            await api.post(`/api/products/${selectedProductForVariant.id}/variants`, payload);
            
            setShowAddVariantModal(false);
            setSelectedProductForVariant(null);
            setVariantSku('');
            setVariantColor('');
            setVariantMaterial('');
            setVariantSize('');
            setVariantPrice('');
            setVariantStock('');

            setModalTitle('Başarılı');
            setModalMessage('Ürüne ait yeni varyant başarıyla eklendi.');
            setModalVariant('success');
            setModalOpen(true);
            fetchProducts();
        } catch (err) {
            console.error(err);
            const serverMsg = err?.response?.data?.message || err?.response?.data || err.message;
            setModalTitle('Hata');
            setModalMessage(typeof serverMsg === 'string' ? serverMsg : 'Varyant eklenirken hata oluştu.');
            setModalVariant('error');
            setModalOpen(true);
        }
    };

    // Update Variant
    const handleUpdateVariant = async (e) => {
        e.preventDefault();
        if (!selectedProductForVariant || !selectedVariantForEdit) return;
        try {
            const payload = {
                sku: editVariantSku,
                color: editVariantColor,
                material: editVariantMaterial,
                size: editVariantSize,
                price: Number(editVariantPrice),
                stockQuantity: Number(editVariantStock)
            };
            await api.put(`/api/products/${selectedProductForVariant.id}/variants/${selectedVariantForEdit.id}`, payload);
            
            setShowEditVariantModal(false);
            setSelectedProductForVariant(null);
            setSelectedVariantForEdit(null);

            setModalTitle('Başarılı');
            setModalMessage('Varyant başarıyla güncellendi.');
            setModalVariant('success');
            setModalOpen(true);
            fetchProducts();
        } catch (err) {
            console.error(err);
            const serverMsg = err?.response?.data?.message || err?.response?.data || err.message;
            setModalTitle('Hata');
            setModalMessage(typeof serverMsg === 'string' ? serverMsg : 'Varyant güncellenirken hata oluştu.');
            setModalVariant('error');
            setModalOpen(true);
        }
    };

    // Delete Variant
    const handleDeleteVariant = async (productId, variantId) => {
        if (!window.confirm('Bu varyantı silmek istediğinize emin misiniz?')) return;
        try {
            await api.delete(`/api/products/${productId}/variants/${variantId}`);
            setModalTitle('Başarılı');
            setModalMessage('Varyant başarıyla silindi.');
            setModalVariant('success');
            setModalOpen(true);
            fetchProducts();
        } catch (err) {
            console.error(err);
            const serverMsg = err?.response?.data?.message || err?.response?.data || err.message;
            setModalTitle('Hata');
            setModalMessage(typeof serverMsg === 'string' ? serverMsg : 'Varyant silinirken hata oluştu.');
            setModalVariant('error');
            setModalOpen(true);
        }
    };

    const handleVariantSelect = (productId, variantId) => {
        setSelectedVariants(prev => ({
            ...prev,
            [productId]: Number(variantId)
        }));
    };

    const handleAddToCart = async (product) => {
        const customerId = getCustomerId();
        if (!customerId) {
            setModalTitle('Giriş Gerekli');
            setModalMessage('Sepete ürün eklemek için lütfen giriş yapın.');
            setModalVariant('error');
            setModalOpen(true);
            return;
        }

        let selectedVariantId = selectedVariants[product.id];
        let selectedVariant = null;

        // If no variants exist, auto-create a default variant in the database on-the-fly
        if (!product.variants || product.variants.length === 0) {
            try {
                const variantPayload = {
                    sku: `DFT-${product.id}-${Math.floor(Math.random() * 1000)}`,
                    color: 'Standart',
                    material: 'Ahşap/Kumaş',
                    size: 'Standart',
                    price: product.price || 15000.0,
                    stockQuantity: product.stockQuantity || 10
                };
                const res = await api.post(`/api/products/${product.id}/variants`, variantPayload);
                selectedVariant = res.data;
                selectedVariantId = selectedVariant.id;
            } catch (err) {
                console.error('Failed to auto-create default variant', err);
                const serverMsg = err?.response?.data?.message || err?.response?.data || err.message;
                setModalTitle('Hata');
                setModalMessage(typeof serverMsg === 'string' ? serverMsg : 'Ürün varyasyonu oluşturulamadı.');
                setModalVariant('error');
                setModalOpen(true);
                return;
            }
        } else {
            selectedVariant = product.variants.find(v => v.id === selectedVariantId);
            // Fallback to first variant if none is in selected map
            if (!selectedVariant && product.variants.length > 0) {
                selectedVariant = product.variants[0];
                selectedVariantId = selectedVariant.id;
            }
        }

        if (!selectedVariantId) {
            setModalTitle('Hata');
            setModalMessage('Lütfen sepete eklemek için bir ürün varyantı seçin.');
            setModalVariant('error');
            setModalOpen(true);
            return;
        }

        const payload = {
            customerId,
            variantId: selectedVariantId,
            quantity: 1
        };

        try {
            await api.post('/api/carts/add', payload);
            
            // Dispatch storage event to update sidebar count
            window.dispatchEvent(new Event('storage'));

            setModalTitle('Sepete Eklendi');
            setModalMessage(`${product.name} (${selectedVariant.color || 'Standart'}, ${selectedVariant.material || 'Standart'}) sepete eklendi.`);
            setModalVariant('success');
            setModalOpen(true);
            
            // Reload products to populate variant lists in UI
            fetchProducts();
        } catch (err) {
            console.error(err);
            // Local Storage fallback
            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
            const existing = cart.find(c => c.variantId === selectedVariantId);
            if (existing) {
                existing.qty += 1;
            } else {
                cart.push({
                    id: selectedVariantId, // itemId
                    variantId: selectedVariantId,
                    name: `${product.name} (${selectedVariant.color || 'Standart'}, ${selectedVariant.material || 'Standart'})`,
                    price: selectedVariant.price || product.price || 1000.0,
                    qty: 1
                });
            }
            localStorage.setItem('cart', JSON.stringify(cart));
            window.dispatchEvent(new Event('storage'));

            setModalTitle('Sepete Eklendi');
            setModalMessage(`${product.name} sepete eklendi (Yerel/Çevrimdışı kayıt).`);
            setModalVariant('success');
            setModalOpen(true);
            fetchProducts();
        }
    };

    const openAddVariantDialog = (prod) => {
        setSelectedProductForVariant(prod);
        setShowAddVariantModal(true);
    };

    const openProductDetailDialog = (prod) => {
        setSelectedProductForDetail(prod);
        setShowProductDetailModal(true);
    };

    const openEditProductDialog = (prod) => {
        setSelectedProductForEdit(prod);
        setEditProductName(prod.name);
        setEditProductPrice(prod.price || '');
        setEditProductStock(prod.stockQuantity || '');
        setEditProductImageUrl(prod.imageUrl || '');
        
        // Find category ID matching the category name
        const match = categories.find(c => c.name === prod.categoryName);
        setEditProductCategoryId(match ? match.id : '');
        setShowEditProductModal(true);
    };

    const openEditVariantDialog = (prod, vr) => {
        setSelectedProductForVariant(prod);
        setSelectedVariantForEdit(vr);
        setEditVariantSku(vr.sku);
        setEditVariantColor(vr.color || '');
        setEditVariantMaterial(vr.material || '');
        setEditVariantSize(vr.size || '');
        setEditVariantPrice(vr.price || '');
        setEditVariantStock(vr.stockQuantity || '');
        setShowEditVariantModal(true);
    };

    // Helper: dynamic beautiful unsplash images
    const getProductImage = (product) => {
        if (!product) return '';
        if (product.imageUrl && product.imageUrl.trim() !== '') {
            return product.imageUrl;
        }
        const name = (product.name || '').toLowerCase();
        const cat = (product.categoryName || '').toLowerCase();

        if (name.includes('vienna') && (name.includes('koltuk') || name.includes('takım'))) {
            return 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=600&q=80';
        }
        if (name.includes('premium') || name.includes('koltuk') || cat.includes('koltuk')) {
            return 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80';
        }
        if (name.includes('yatak') || name.includes('baza') || cat.includes('yatak')) {
            return 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80';
        }
        if (name.includes('yemek') || name.includes('masa') || cat.includes('yemek')) {
            return 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=600&q=80';
        }
        if (name.includes('dolap') || name.includes('gardrop') || cat.includes('dolap')) {
            return 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=600&q=80';
        }
        return 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=600&q=80';
    };

    // Filter products
    const filteredProducts = products.filter(p => {
        const matchesCategory = selectedCategoryName === 'ALL' || p.categoryName === selectedCategoryName;
        const matchesSearch = p.name && p.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const uniqueCategories = ['ALL', ...new Set(products.map(p => p.categoryName).filter(Boolean))];

    // Carousel slides definitions
    const slides = [
        {
            title: 'Vienna Koleksiyonu',
            sub: 'Zarafet ve Konforun Muhteşem Uyumu',
            desc: 'Yaşam alanınıza modern bir soluk getiren, üstün kumaş kalitesi ve ergonomik tasarımıyla yeni Vienna Koltuk Takımı.',
            bg: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
            badge: 'Yeni Sezon'
        },
        {
            title: 'Loren Yemek Odası',
            sub: 'Aile Yemeklerinde Estetik Dokunuşlar',
            desc: 'Doğal ahşap yüzeyler, altın metalik detaylar ve zengin sandalye döşemeleriyle tasarlanmış seçkin bir davet alanı.',
            bg: 'https://images.unsplash.com/photo-1617806118233-18e1db207f62?auto=format&fit=crop&w=1200&q=80',
            badge: 'Kampanya'
        },
        {
            title: 'Akıllı Sipariş Takibi',
            sub: 'Üretimden Evinize Canlı IoT İzleme',
            desc: 'Koltuk ve mobilyalarınızın hazırlık, paketleme ve lojistik aşamalarını harita ve zaman çizelgemizden anlık olarak takip edin.',
            bg: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
            badge: 'Akıllı Hizmet'
        }
    ];

    return (
        <div className="animate-fade-in" style={{ paddingBottom: '40px' }}>
            
            {/* 1. Vitrin Showcase Carousel Banner */}
            <div style={{
                position: 'relative',
                height: '350px',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                marginBottom: '32px',
                boxShadow: 'var(--shadow-lg)',
                backgroundColor: '#0a1b2d',
                color: 'white',
                display: 'flex',
                alignItems: 'center'
            }}>
                {/* Background image transition */}
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundImage: `linear-gradient(to right, rgba(10,27,45,0.9) 30%, rgba(10,27,45,0.3) 100%), url(${slides[activeSlide].bg})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    transition: 'all 0.8s ease-in-out',
                    zIndex: 1
                }}></div>

                {/* Content Overlay */}
                <div style={{ position: 'relative', zIndex: 2, padding: '0 50px', maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <span style={{
                        alignSelf: 'flex-start',
                        backgroundColor: 'var(--accent)',
                        color: 'white',
                        fontSize: '11px',
                        fontWeight: '700',
                        padding: '4px 10px',
                        borderRadius: '4px',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                    }}>
                        {slides[activeSlide].badge}
                    </span>
                    <h1 className="serif-title" style={{ fontSize: '38px', color: 'white', margin: 0, lineHeight: '1.2' }}>
                        {slides[activeSlide].title}
                    </h1>
                    <h4 style={{ fontSize: '18px', color: 'var(--gold)', fontWeight: '500', margin: 0 }}>
                        {slides[activeSlide].sub}
                    </h4>
                    <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.5', margin: 0 }}>
                        {slides[activeSlide].desc}
                    </p>
                    <button 
                        className="btn btn-accent" 
                        style={{ alignSelf: 'flex-start', marginTop: '10px', padding: '8px 18px', fontSize: '12px' }}
                        onClick={() => {
                            const match = products.find(p => p.name.toLowerCase().includes('vienna'));
                            if (match) openProductDetailDialog(match);
                        }}
                    >
                        Koleksiyonu Keşfet
                    </button>
                </div>

                {/* Bullets navigation */}
                <div style={{
                    position: 'absolute',
                    bottom: '20px',
                    left: '50px',
                    display: 'flex',
                    gap: '8px',
                    zIndex: 3
                }}>
                    {slides.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setActiveSlide(idx)}
                            style={{
                                width: activeSlide === idx ? '24px' : '8px',
                                height: '8px',
                                borderRadius: '4px',
                                border: 'none',
                                backgroundColor: activeSlide === idx ? 'var(--accent)' : 'rgba(255,255,255,0.4)',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                        ></button>
                    ))}
                </div>
            </div>

            {/* Header Area */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                <div>
                    <h2 className="serif-title" style={{ fontSize: '28px', color: 'var(--primary)', marginBottom: '6px' }}>Ürün ve Varyant Kataloğu</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Mondi Home mobilya koleksiyonlarını, renk, kumaş ve boyut varyantlarıyla birlikte inceleyin.</p>
                </div>
                {isAdmin && (
                    <button className="btn btn-accent" onClick={() => setShowAddProductModal(true)}>
                        <i className='bx bx-plus' style={{ fontSize: '18px' }}></i>
                        Yeni Ürün Tanımla
                    </button>
                )}
            </div>

            {error && (
                <div className="login-alert login-alert-error" style={{ marginBottom: '20px' }}>
                    <i className='bx bx-error-circle' style={{ fontSize: '18px' }}></i>
                    <span>{error}</span>
                </div>
            )}

            {/* Filters bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', flexWrap: 'wrap', marginBottom: '32px' }}>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {uniqueCategories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategoryName(cat)}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '20px',
                                border: '1px solid var(--border-color)',
                                fontSize: '13px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                backgroundColor: selectedCategoryName === cat ? 'var(--primary)' : 'white',
                                color: selectedCategoryName === cat ? 'white' : 'var(--text-dark)',
                                transition: 'var(--transition)'
                            }}
                        >
                            {cat === 'ALL' ? 'Tüm Ürünler' : cat}
                        </button>
                    ))}
                </div>

                <div style={{ position: 'relative', width: '300px' }}>
                    <input 
                        type="text" 
                        placeholder="Katalogda ara..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="form-control"
                        style={{ paddingLeft: '40px', paddingRight: '16px', height: '40px' }}
                    />
                    <i className='bx bx-search' style={{ position: 'absolute', left: '14px', top: '12px', fontSize: '18px', color: 'var(--text-muted)' }}></i>
                </div>
            </div>

            {/* Product Cards Grid */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    <i className='bx bx-loader-alt bx-spin' style={{ fontSize: '32px', marginBottom: '10px' }}></i>
                    <div>Katalog yükleniyor...</div>
                </div>
            ) : filteredProducts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: 'var(--radius-lg)', color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>
                    <i className='bx bx-shopping-bag' style={{ fontSize: '48px', color: '#cbd5e1', marginBottom: '16px' }}></i>
                    <div>Aradığınız özelliklerde ürün bulunamadı.</div>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px' }}>
                    {filteredProducts.map((product) => {
                        const hasVariants = product.variants && product.variants.length > 0;
                        const currentSelectedVariantId = selectedVariants[product.id];
                        const currentSelectedVariant = hasVariants 
                            ? product.variants.find(v => v.id === currentSelectedVariantId) 
                            : null;

                        // Display price: if variant is selected, show variant price, else general product price
                        const displayPrice = currentSelectedVariant ? currentSelectedVariant.price : product.price;
                        const displayStock = currentSelectedVariant ? currentSelectedVariant.stockQuantity : (product.stockQuantity !== null && product.stockQuantity !== undefined ? product.stockQuantity : 10);

                        return (
                            <div key={product.id} className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', padding: '0', overflow: 'hidden' }}>
                                
                                {/* Product Image Block */}
                                <div style={{ height: '200px', width: '100%', position: 'relative', overflow: 'hidden' }}>
                                    <img 
                                        src={getProductImage(product)} 
                                        alt={product.name} 
                                        style={{ height: '100%', width: '100%', objectFit: 'cover', transition: 'transform 0.5s', cursor: 'pointer' }}
                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                        onClick={() => openProductDetailDialog(product)}
                                    />
                                    {isAdmin && (
                                        <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '6px' }}>
                                            <button 
                                                onClick={() => openEditProductDialog(product)}
                                                style={{ border: 'none', background: 'white', width: '32px', height: '32px', borderRadius: '50%', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-md)' }}
                                                title="Ürünü Düzenle"
                                            >
                                                <i className='bx bx-edit-alt' style={{ fontSize: '16px' }}></i>
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteProduct(product.id)}
                                                style={{ border: 'none', background: 'white', width: '32px', height: '32px', borderRadius: '50%', color: 'var(--error)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-md)' }}
                                                title="Ürünü Sil"
                                            >
                                                <i className='bx bx-trash' style={{ fontSize: '16px' }}></i>
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Product Body Content */}
                                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, justifyContent: 'space-between' }}>
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                {product.categoryName || 'Mobilya'}
                                            </span>
                                            <span style={{ 
                                                fontSize: '11px', 
                                                fontWeight: '700', 
                                                color: displayStock > 0 ? 'var(--success)' : 'var(--error)',
                                                backgroundColor: displayStock > 0 ? '#ecfdf5' : '#fef2f2',
                                                padding: '3px 8px',
                                                borderRadius: '4px'
                                            }}>
                                                {displayStock > 0 ? `Stok: ${displayStock}` : 'Stokta Yok'}
                                            </span>
                                        </div>

                                        <h3 
                                            style={{ fontSize: '18px', fontWeight: '700', color: 'var(--primary)', marginTop: '4px', marginBottom: '8px', cursor: 'pointer', transition: 'color 0.2s' }}
                                            onClick={() => openProductDetailDialog(product)}
                                            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent)'}
                                            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--primary)'}
                                        >
                                            {product.name}
                                        </h3>

                                        {/* Price tag */}
                                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '12px' }}>
                                            <span style={{ fontSize: '22px', fontWeight: '800', color: 'var(--primary)' }}>
                                                {displayPrice ? `${displayPrice} ₺` : 'Fiyat Belirtilmemiş'}
                                            </span>
                                        </div>

                                        {/* Variants Selector */}
                                        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                                            <label className="form-label" style={{ fontSize: '10px', marginBottom: '4px' }}>Ürün Varyasyonu</label>
                                            
                                            {hasVariants ? (
                                                <div style={{ position: 'relative' }}>
                                                    <select 
                                                        value={currentSelectedVariantId || ''} 
                                                        onChange={(e) => handleVariantSelect(product.id, e.target.value)}
                                                        className="form-control"
                                                        style={{ padding: '6px 10px', fontSize: '12px', height: '34px', appearance: 'none', cursor: 'pointer' }}
                                                    >
                                                        {product.variants.map(v => (
                                                            <option key={v.id} value={v.id}>
                                                                {v.sku} - {v.color || 'Standart'} ({v.material || 'Kumaş'}, {v.size || 'Ebat'}) - {v.price} ₺
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <i className='bx bx-chevron-down' style={{ position: 'absolute', right: '10px', top: '9px', pointerEvents: 'none', color: 'var(--text-muted)' }}></i>
                                                </div>
                                            ) : (
                                                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic', padding: '4px 0' }}>
                                                    Varyasyon tanımlanmamıştır.
                                                </div>
                                            )}
                                        </div>

                                        {/* Admin specific Variant list manager */}
                                        {isAdmin && product.variants && product.variants.length > 0 && (
                                            <div style={{ marginTop: '12px', fontSize: '12px', backgroundColor: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                                <strong style={{ display: 'block', marginBottom: '6px', color: 'var(--primary)' }}>Varyant Yönetimi:</strong>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                    {product.variants.map(v => (
                                                        <div key={v.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>
                                                            <span>{v.sku} ({v.color || 'Std'}) - <strong>{v.price} ₺</strong></span>
                                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                                <button 
                                                                    onClick={() => openEditVariantDialog(product, v)}
                                                                    style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '14px' }}
                                                                    title="Varyantı Düzenle"
                                                                >
                                                                    <i className='bx bx-edit-alt'></i>
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleDeleteVariant(product.id, v.id)}
                                                                    style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', fontSize: '14px' }}
                                                                    title="Varyantı Sil"
                                                                >
                                                                    <i className='bx bx-trash'></i>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions Section */}
                                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                        {isAdmin ? (
                                            <button 
                                                className="btn btn-secondary" 
                                                style={{ width: '100%', padding: '8px 12px', fontSize: '12px' }} 
                                                onClick={() => openAddVariantDialog(product)}
                                            >
                                                <i className='bx bx-plus-circle'></i> Varyant Ekle
                                            </button>
                                        ) : (
                                            <button 
                                                className="btn btn-accent" 
                                                style={{ width: '100%' }}
                                                onClick={() => handleAddToCart(product)}
                                                disabled={displayStock <= 0}
                                            >
                                                <i className='bx bx-cart-add' style={{ fontSize: '18px' }}></i>
                                                {displayStock <= 0 ? 'Stok Tükendi' : 'Sepete Ekle'}
                                            </button>
                                        )}
                                    </div>
                                </div>

                            </div>
                        );
                    })}
                </div>
            )}

            {/* Product Immersive Detail Modal */}
            {showProductDetailModal && selectedProductForDetail && (() => {
                const product = selectedProductForDetail;
                const hasVariants = product.variants && product.variants.length > 0;
                const currentSelectedVariantId = selectedVariants[product.id];
                const currentSelectedVariant = hasVariants 
                    ? product.variants.find(v => v.id === currentSelectedVariantId) 
                    : null;

                const displayPrice = currentSelectedVariant ? currentSelectedVariant.price : product.price;
                const displayStock = currentSelectedVariant ? currentSelectedVariant.stockQuantity : (product.stockQuantity !== null && product.stockQuantity !== undefined ? product.stockQuantity : 10);
                
                // Construct a mock details description based on product type
                const getMockDescription = (name) => {
                    const low = name.toLowerCase();
                    if (low.includes('vienna')) {
                        return 'Vienna Koleksiyonu, modern yaşam alanlarına şık ve elit bir dokunuş katmak için tasarlandı. Kolay temizlenebilir leke tutmaz ithal lüks kadife kumaşı, sağlam gürgen gövdesi, yüksek dansiteli soft sünger oturma minderi ve estetik ahşap ayak detayları ile hem konforu hem de uzun ömürlü kullanımı bir arada sunar. 2 Yıl Mondi Home Garantisi kapsamındadır.';
                    }
                    if (low.includes('loren')) {
                        return 'Loren serisi, lüks detayları minimalist hatlarla harmanlayan benzersiz tasarımıyla evinizde elit bir atmosfer yaratır. Sağlığa zararsız E1 standardında kaliteli ham madde kullanımı, soft kapak mekanizmaları, geniş iç hacmi ve şık altın kulp detaylarıyla zarafetin en fonksiyonel halidir.';
                    }
                    return 'Mondi Home kalitesiyle üretilen bu özel koleksiyon parçası, evinizin dekorasyonuna modern bir estetik kazandırır. Yüksek dayanıklılığa sahip iskelet yapısı, ergonomik tasarımı, hijyenik ve çevre dostu materyalleriyle sağlıklı ve konforlu bir yaşam alanı sunar.';
                };

                return (
                    <div className="modal-overlay" style={{ backdropFilter: 'blur(8px)', zIndex: 110 }}>
                        <div className="modal-content" style={{ maxWidth: '850px', padding: '0', overflow: 'hidden', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xl)' }}>
                            <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', minHeight: '450px' }}>
                                
                                {/* Left: Huge Image */}
                                <div style={{ flex: '1 1 380px', height: 'auto', minHeight: '350px', position: 'relative', overflow: 'hidden', backgroundColor: '#f8fafc' }}>
                                    <img 
                                        src={getProductImage(product)} 
                                        alt={product.name} 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                    <span style={{ 
                                        position: 'absolute', 
                                        top: '15px', 
                                        left: '15px',
                                        fontSize: '11px', 
                                        fontWeight: '700', 
                                        color: 'white',
                                        backgroundColor: 'var(--accent)',
                                        padding: '4px 10px',
                                        borderRadius: '4px',
                                        textTransform: 'uppercase'
                                    }}>
                                        {product.categoryName || 'Koleksiyon'}
                                    </span>
                                </div>

                                {/* Right: Info and selectors */}
                                <div style={{ flex: '1.2 1 400px', padding: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '20px' }}>
                                    
                                    {/* Header & Title */}
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--accent)', textTransform: 'uppercase' }}>MONDI HOME KATALOG</span>
                                            <button 
                                                onClick={() => { setShowProductDetailModal(false); setSelectedProductForDetail(null); }} 
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '26px', color: 'var(--text-muted)' }}
                                            >
                                                <i className='bx bx-x'></i>
                                            </button>
                                        </div>
                                        <h2 className="serif-title" style={{ fontSize: '28px', color: 'var(--primary)', margin: '0 0 10px 0', lineHeight: '1.2' }}>{product.name}</h2>
                                        
                                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '16px' }}>
                                            <span style={{ fontSize: '26px', fontWeight: '800', color: 'var(--accent)' }}>
                                                {displayPrice ? `${displayPrice} ₺` : 'Fiyat Belirtilmemiş'}
                                            </span>
                                            <span style={{ 
                                                fontSize: '12px', 
                                                fontWeight: '600', 
                                                color: displayStock > 0 ? 'var(--success)' : 'var(--error)',
                                                backgroundColor: displayStock > 0 ? '#ecfdf5' : '#fef2f2',
                                                padding: '3px 8px',
                                                borderRadius: '4px'
                                            }}>
                                                {displayStock > 0 ? `Stok: ${displayStock} Adet` : 'Stok Tükendi'}
                                            </span>
                                        </div>

                                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6', margin: '0 0 20px 0' }}>
                                            {getMockDescription(product.name)}
                                        </p>

                                        {/* Spec details grid */}
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', fontSize: '12px', backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '20px' }}>
                                            <div>
                                                <span style={{ color: 'var(--text-muted)' }}>Garanti Süresi:</span>
                                                <strong style={{ display: 'block', color: 'var(--primary)' }}>2 Yıl Yetkili Servis</strong>
                                            </div>
                                            <div>
                                                <span style={{ color: 'var(--text-muted)' }}>Teslimat Süresi:</span>
                                                <strong style={{ display: 'block', color: 'var(--primary)' }}>7-14 İş Günü</strong>
                                            </div>
                                            <div>
                                                <span style={{ color: 'var(--text-muted)' }}>Renk:</span>
                                                <strong style={{ display: 'block', color: 'var(--primary)' }}>{currentSelectedVariant?.color || 'Standart'}</strong>
                                            </div>
                                            <div>
                                                <span style={{ color: 'var(--text-muted)' }}>Kumaş & Malzeme:</span>
                                                <strong style={{ display: 'block', color: 'var(--primary)' }}>{currentSelectedVariant?.material || 'Kadife/Ahşap'}</strong>
                                            </div>
                                            <div>
                                                <span style={{ color: 'var(--text-muted)' }}>Boyut / Ebat:</span>
                                                <strong style={{ display: 'block', color: 'var(--primary)' }}>{currentSelectedVariant?.size || 'Standart Ölçü'}</strong>
                                            </div>
                                            <div>
                                                <span style={{ color: 'var(--text-muted)' }}>SKU (Kod):</span>
                                                <strong style={{ display: 'block', color: 'var(--primary)' }}>{currentSelectedVariant?.sku || `DFT-${product.id}`}</strong>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Variant selector dropdown inside modal */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {hasVariants && (
                                            <div>
                                                <label className="form-label" style={{ fontSize: '11px', fontWeight: '700', marginBottom: '6px' }}>Varyasyon Seçin</label>
                                                <div style={{ position: 'relative' }}>
                                                    <select 
                                                        value={currentSelectedVariantId || ''} 
                                                        onChange={(e) => handleVariantSelect(product.id, e.target.value)}
                                                        className="form-control"
                                                        style={{ padding: '8px 12px', fontSize: '13px', height: '38px', appearance: 'none', cursor: 'pointer' }}
                                                    >
                                                        {product.variants.map(v => (
                                                            <option key={v.id} value={v.id}>
                                                                {v.sku} - {v.color || 'Standart'} ({v.material || 'Kumaş'}, {v.size || 'Ebat'}) - {v.price} ₺
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <i className='bx bx-chevron-down' style={{ position: 'absolute', right: '12px', top: '11px', pointerEvents: 'none', color: 'var(--text-muted)' }}></i>
                                                </div>
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                            {isAdmin ? (
                                                <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                                                    <button 
                                                        className="btn btn-secondary" 
                                                        style={{ flex: 1 }}
                                                        onClick={() => { setShowProductDetailModal(false); openAddVariantDialog(product); }}
                                                    >
                                                        Varyant Ekle
                                                    </button>
                                                    <button 
                                                        className="btn btn-primary" 
                                                        style={{ flex: 1 }}
                                                        onClick={() => { setShowProductDetailModal(false); openEditProductDialog(product); }}
                                                    >
                                                        Ürünü Düzenle
                                                    </button>
                                                </div>
                                            ) : (
                                                <button 
                                                    className="btn btn-accent" 
                                                    style={{ width: '100%', padding: '12px', fontSize: '14px', fontWeight: '700' }}
                                                    onClick={() => handleAddToCart(product)}
                                                    disabled={displayStock <= 0}
                                                >
                                                    <i className='bx bx-cart-add' style={{ fontSize: '20px', marginRight: '6px' }}></i>
                                                    {displayStock <= 0 ? 'Stok Tükendi' : 'Seçilen Varyantı Sepete Ekle'}
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                </div>

                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* Add Product Modal */}
            {showAddProductModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '20px', fontWeight: '700' }}>Yeni Ürün Tanımla</h3>
                            <button onClick={() => setShowAddProductModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px', color: 'var(--text-muted)' }}>
                                <i className='bx bx-x'></i>
                            </button>
                        </div>
                        <form onSubmit={handleCreateProduct}>
                            <div className="form-group">
                                <label className="form-label">Ürün Adı</label>
                                <input 
                                    type="text" 
                                    placeholder="Örn: Loren Salon Koltuk Takımı" 
                                    value={newProductName}
                                    onChange={(e) => setNewProductName(e.target.value)}
                                    required
                                    className="form-control"
                                />
                            </div>
                            
                            <div className="form-group">
                                <label className="form-label">Kategori</label>
                                {categories.length === 0 ? (
                                    <div style={{ fontSize: '12px', color: 'var(--error)' }}>Kayıtlı kategori bulunamadı! Lütfen önce Kategori sekmesinden bir kategori ekleyin.</div>
                                ) : (
                                    <select 
                                        value={newProductCategoryId}
                                        onChange={(e) => setNewProductCategoryId(e.target.value)}
                                        className="form-control"
                                        required
                                    >
                                        {categories.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '15px' }}>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="form-label">Taban Fiyat (₺)</label>
                                    <input 
                                        type="number" 
                                        step="0.01"
                                        placeholder="Örn: 15400" 
                                        value={newProductPrice}
                                        onChange={(e) => setNewProductPrice(e.target.value)}
                                        required
                                        className="form-control"
                                    />
                                </div>

                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="form-label">Stok Miktarı</label>
                                    <input 
                                        type="number" 
                                        placeholder="Örn: 24" 
                                        value={newProductStock}
                                        onChange={(e) => setNewProductStock(e.target.value)}
                                        required
                                        className="form-control"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Ürün Resim Linki (imageUrl)</label>
                                <input 
                                    type="url" 
                                    placeholder="Örn: https://images.unsplash.com/..." 
                                    value={newProductImageUrl}
                                    onChange={(e) => setNewProductImageUrl(e.target.value)}
                                    className="form-control"
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowAddProductModal(false)}>İptal</button>
                                <button type="submit" className="btn btn-primary" disabled={categories.length === 0}>Oluştur</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Product Modal */}
            {showEditProductModal && selectedProductForEdit && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '20px', fontWeight: '700' }}>Ürünü Düzenle</h3>
                            <button onClick={() => { setShowEditProductModal(false); setSelectedProductForEdit(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px', color: 'var(--text-muted)' }}>
                                <i className='bx bx-x'></i>
                            </button>
                        </div>
                        <form onSubmit={handleUpdateProduct}>
                            <div className="form-group">
                                <label className="form-label">Ürün Adı</label>
                                <input 
                                    type="text" 
                                    value={editProductName}
                                    onChange={(e) => setEditProductName(e.target.value)}
                                    required
                                    className="form-control"
                                />
                            </div>
                            
                            <div className="form-group">
                                <label className="form-label">Kategori</label>
                                <select 
                                    value={editProductCategoryId}
                                    onChange={(e) => setEditProductCategoryId(e.target.value)}
                                    className="form-control"
                                >
                                    <option value="">Kategorisiz</option>
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ display: 'flex', gap: '15px' }}>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="form-label">Taban Fiyat (₺)</label>
                                    <input 
                                        type="number" 
                                        step="0.01"
                                        value={editProductPrice}
                                        onChange={(e) => setEditProductPrice(e.target.value)}
                                        required
                                        className="form-control"
                                    />
                                </div>

                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="form-label">Stok Miktarı</label>
                                    <input 
                                        type="number" 
                                        value={editProductStock}
                                        onChange={(e) => setEditProductStock(e.target.value)}
                                        required
                                        className="form-control"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Ürün Resim Linki</label>
                                <input 
                                    type="url" 
                                    value={editProductImageUrl}
                                    onChange={(e) => setEditProductImageUrl(e.target.value)}
                                    className="form-control"
                                    placeholder="https://images.unsplash.com/..."
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => { setShowEditProductModal(false); setSelectedProductForEdit(null); }}>İptal</button>
                                <button type="submit" className="btn btn-primary">Güncelle</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Variant Modal */}
            {showAddVariantModal && selectedProductForVariant && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '550px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <div>
                                <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--accent)', textTransform: 'uppercase' }}>Varyant Ekle</span>
                                <h3 style={{ fontSize: '20px', fontWeight: '700' }}>{selectedProductForVariant.name}</h3>
                            </div>
                            <button onClick={() => { setShowAddVariantModal(false); setSelectedProductForVariant(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px', color: 'var(--text-muted)' }}>
                                <i className='bx bx-x'></i>
                            </button>
                        </div>
                        <form onSubmit={handleCreateVariant}>
                            <div className="form-group">
                                <label className="form-label">SKU (Kod)</label>
                                <input 
                                    type="text" 
                                    placeholder="Örn: LRN-KLTK-01" 
                                    value={variantSku}
                                    onChange={(e) => setVariantSku(e.target.value)}
                                    required
                                    className="form-control"
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '15px' }}>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="form-label">Renk</label>
                                    <input 
                                        type="text" 
                                        placeholder="Örn: Kiremit, Krem..." 
                                        value={variantColor}
                                        onChange={(e) => setVariantColor(e.target.value)}
                                        required
                                        className="form-control"
                                    />
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="form-label">Kumaş / Malzeme</label>
                                    <input 
                                        type="text" 
                                        placeholder="Örn: Kadife, Nubuk..." 
                                        value={variantMaterial}
                                        onChange={(e) => setVariantMaterial(e.target.value)}
                                        required
                                        className="form-control"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Boyut / Ölçü</label>
                                <input 
                                    type="text" 
                                    placeholder="Örn: Üçlü Koltuk, 210cm..." 
                                    value={variantSize}
                                    onChange={(e) => setVariantSize(e.target.value)}
                                    required
                                    className="form-control"
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '15px' }}>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="form-label">Varyant Fiyatı (₺)</label>
                                    <input 
                                        type="number" 
                                        step="0.01"
                                        placeholder="Örn: 16500" 
                                        value={variantPrice}
                                        onChange={(e) => setVariantPrice(e.target.value)}
                                        required
                                        className="form-control"
                                    />
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="form-label">Varyant Stok</label>
                                    <input 
                                        type="number" 
                                        placeholder="Örn: 12" 
                                        value={variantStock}
                                        onChange={(e) => setVariantStock(e.target.value)}
                                        required
                                        className="form-control"
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => { setShowAddVariantModal(false); setSelectedProductForVariant(null); }}>İptal</button>
                                <button type="submit" className="btn btn-primary">Kaydet</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Variant Modal */}
            {showEditVariantModal && selectedProductForVariant && selectedVariantForEdit && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '550px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <div>
                                <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--accent)', textTransform: 'uppercase' }}>Varyant Düzenle</span>
                                <h3 style={{ fontSize: '20px', fontWeight: '700' }}>{selectedProductForVariant.name}</h3>
                            </div>
                            <button onClick={() => { setShowEditVariantModal(false); setSelectedVariantForEdit(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px', color: 'var(--text-muted)' }}>
                                <i className='bx bx-x'></i>
                            </button>
                        </div>
                        <form onSubmit={handleUpdateVariant}>
                            <div className="form-group">
                                <label className="form-label">SKU (Kod)</label>
                                <input 
                                    type="text" 
                                    value={editVariantSku}
                                    onChange={(e) => setEditVariantSku(e.target.value)}
                                    required
                                    className="form-control"
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '15px' }}>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="form-label">Renk</label>
                                    <input 
                                        type="text" 
                                        value={editVariantColor}
                                        onChange={(e) => setEditVariantColor(e.target.value)}
                                        required
                                        className="form-control"
                                    />
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="form-label">Kumaş / Malzeme</label>
                                    <input 
                                        type="text" 
                                        value={editVariantMaterial}
                                        onChange={(e) => setEditVariantMaterial(e.target.value)}
                                        required
                                        className="form-control"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Boyut / Ölçü</label>
                                <input 
                                    type="text" 
                                    value={editVariantSize}
                                    onChange={(e) => setEditVariantSize(e.target.value)}
                                    required
                                    className="form-control"
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '15px' }}>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="form-label">Varyant Fiyatı (₺)</label>
                                    <input 
                                        type="number" 
                                        step="0.01"
                                        value={editVariantPrice}
                                        onChange={(e) => setEditVariantPrice(e.target.value)}
                                        required
                                        className="form-control"
                                    />
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="form-label">Varyant Stok</label>
                                    <input 
                                        type="number" 
                                        value={editVariantStock}
                                        onChange={(e) => setEditVariantStock(e.target.value)}
                                        required
                                        className="form-control"
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => { setShowEditVariantModal(false); setSelectedProductForVariant(null); setSelectedVariantForEdit(null); }}>İptal</button>
                                <button type="submit" className="btn btn-primary">Kaydet</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <SiteModal open={modalOpen} title={modalTitle} message={modalMessage} variant={modalVariant} onClose={() => setModalOpen(false)} />
        </div>
    );
}