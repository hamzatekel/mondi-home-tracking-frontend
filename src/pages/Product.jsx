import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { getCurrentUser } from '../services/auth';
import SiteModal from '../components/SiteModal';

export default function Products() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const user = getCurrentUser();
    const isAdmin = user && (user.role === 'admin' || (Array.isArray(user.roles) && user.roles.includes('admin')) || user.isAdmin);

    // Ürünleri backend'den çekme
    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/products'); // Backend'deki ürün listeleme endpoint'i
            setProducts(response.data);
        } catch (err) {
            console.error(err);
            setError('Ürünler yüklenirken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async (product) => {
        // Try server-side add first (requires authenticated user). Fallback to localStorage.
        const payload = {
            variantId: product.variantId || product.id || product.productId,
            quantity: 1,
        };

        // include numeric customerId only if available (token may contain email as 'sub')
        if (user) {
            const cid = user.id || user.userId || user.customerId;
            if (typeof cid === 'number') payload.customerId = cid;
        }

        try {
            if (user) {
                const res = await api.post('/api/carts/add', payload);
                // Expect CartResponse back; update UI accordingly or fallback to localStorage
                setModalTitle('Sepete Eklendi');
                setModalMessage(`${product.name || product.title} sepete eklendi.`);
                setModalVariant('success');
                setModalOpen(true);
                return;
            }
        } catch (err) {
            console.warn('Server addToCart failed, falling back to localStorage', err);
            // continue to local fallback
        }

        // Local storage fallback
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existing = cart.find((p) => p.id === (product.id || product.productId));
        if (existing) {
            existing.qty = (existing.qty || 1) + 1;
        } else {
            cart.push({ id: product.id || product.productId, name: product.name || product.title, price: product.price || 0, qty: 1 });
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        setModalTitle('Sepete Eklendi');
        setModalMessage(`${product.name || product.title} sepete eklendi (çevrimdışı).`);
        setModalVariant('success');
        setModalOpen(true);
    };

    const [modalOpen, setModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalMessage, setModalMessage] = useState('');
    const [modalVariant, setModalVariant] = useState('info');

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                    <h2 style={{ margin: '0 0 5px 0', color: '#0f172a', fontSize: '22px' }}>Ürünler ve Varyantlar</h2>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>Sistemdeki tüm ürünleri ve stok durumlarını buradan takip edebilirsiniz.</p>
                </div>
                {isAdmin && (
                    <button
                        onClick={() => alert('Yeni ürün ekleme modalı buraya gelecek.')}
                        style={{
                            backgroundColor: '#0284c7',
                            color: 'white',
                            border: 'none',
                            padding: '10px 16px',
                            borderRadius: '6px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            fontSize: '13px'
                        }}
                    >
                        + Yeni Ürün Ekle
                    </button>
                )}
            </div>

            {error && (
                <div style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '12px', borderRadius: '6px', fontSize: '13px', marginBottom: '20px', border: '1px solid #fecaca' }}>
                    {error}
                </div>
            )}

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Yükleniyor...</div>
            ) : (
                <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                                <th style={{ padding: '12px 16px', fontWeight: '600' }}>Ürün Adı</th>
                                <th style={{ padding: '12px 16px', fontWeight: '600' }}>Kategori</th>
                                <th style={{ padding: '12px 16px', fontWeight: '600' }}>Fiyat</th>
                                <th style={{ padding: '12px 16px', fontWeight: '600' }}>Stok / Varyant</th>
                                <th style={{ padding: '12px 16px', fontWeight: '600', textAlign: 'right' }}>İşlemler</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                                        Henüz kayıtlı ürün bulunmuyor.
                                    </td>
                                </tr>
                            ) : (
                                products.map((product) => (
                                    <tr key={product.id || product.productId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '12px 16px', color: '#1e293b', fontWeight: '500' }}>{product.name || product.title}</td>
                                        <td style={{ padding: '12px 16px', color: '#64748b' }}>{product.categoryName || 'Genel'}</td>
                                        <td style={{ padding: '12px 16px', color: '#1e293b' }}>{product.price ? `${product.price} ₺` : '-'}</td>
                                        <td style={{ padding: '12px 16px', color: '#64748b' }}>{product.stock ?? 'Stok Yok'}</td>
                                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                                            {isAdmin ? (
                                                <>
                                                    <button style={{ background: 'none', border: 'none', color: '#0284c7', cursor: 'pointer', fontWeight: '600', marginRight: '10px' }}>Düzenle</button>
                                                    <button style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontWeight: '600' }}>Sil</button>
                                                </>
                                            ) : (
                                                <button onClick={() => addToCart(product)} style={{ background: '#06b6d4', border: 'none', color: 'white', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Sepete Ekle</button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
            <SiteModal open={modalOpen} title={modalTitle} message={modalMessage} variant={modalVariant} onClose={() => setModalOpen(false)} />
        </div>
    );
}