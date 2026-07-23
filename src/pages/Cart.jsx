import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../services/auth';
import SiteModal from '../components/SiteModal';

export default function Cart() {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [serverCartId, setServerCartId] = useState(null);
    const [deliveryAddress, setDeliveryAddress] = useState('Merkez Mahallesi, Mondi Home Caddesi No:38, Kayseri');
    
    const [modalOpen, setModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalMessage, setModalMessage] = useState('');
    const [modalVariant, setModalVariant] = useState('info');

    const user = getCurrentUser();
    const navigate = useNavigate();

    const getCustomerId = () => {
        const raw = user?.id || user?.userId || user?.customerId || user?.sub || null;
        if (raw != null && !isNaN(Number(raw))) return Number(raw);
        const localId = localStorage.getItem('customerId');
        if (localId) return Number(localId);
        return null;
    };

    const fetchServerCart = async (customerId) => {
        try {
            setLoading(true);
            const res = await api.get(`/api/carts/customer/${customerId}`);
            const data = res.data || res;
            if (data) {
                setServerCartId(data.id);
                setCartItems(data.items || []);
                return true;
            }
        } catch (err) {
            console.warn('Sunucu sepeti yüklenemedi, yerel sepet kontrol ediliyor', err);
        } finally {
            setLoading(false);
        }
        return false;
    };

    const loadCart = async () => {
        const customerId = getCustomerId();
        if (customerId) {
            const success = await fetchServerCart(customerId);
            if (success) return;
        }

        // Fallback to local storage if offline/no backend connection
        const stored = JSON.parse(localStorage.getItem('cart') || '[]');
        setCartItems(stored);
    };

    useEffect(() => {
        loadCart();
    }, []);

    const removeItem = async (itemId) => {
        const customerId = getCustomerId();
        try {
            if (serverCartId) {
                await api.delete(`/api/carts/${serverCartId}/items/${itemId}`);
                if (customerId) {
                    fetchServerCart(customerId);
                    // Dispatch event to update layout badge
                    window.dispatchEvent(new Event('storage'));
                    return;
                }
            }
        } catch (err) {
            console.warn('Sunucudan ürün silinemedi, yerel güncelleniyor', err);
        }

        // Local fallback
        const next = cartItems.filter(item => (item.id || item.variantId) !== itemId);
        setCartItems(next);
        localStorage.setItem('cart', JSON.stringify(next));
        window.dispatchEvent(new Event('storage'));
    };

    const changeQty = async (itemId, currentQty, amount) => {
        const nextQty = currentQty + amount;
        if (nextQty < 1) return;

        const customerId = getCustomerId();
        try {
            if (serverCartId) {
                await api.put(`/api/carts/${serverCartId}/items/${itemId}?quantity=${nextQty}`);
                if (customerId) {
                    fetchServerCart(customerId);
                    window.dispatchEvent(new Event('storage'));
                    return;
                }
            }
        } catch (err) {
            console.warn('Sunucuda adet güncellenemedi, yerel güncelleniyor', err);
        }

        // Local fallback
        const next = cartItems.map(item => {
            const matchId = item.id || item.variantId;
            return matchId === itemId ? { ...item, qty: nextQty, quantity: nextQty } : item;
        });
        setCartItems(next);
        localStorage.setItem('cart', JSON.stringify(next));
        window.dispatchEvent(new Event('storage'));
    };

    const handleCheckout = async () => {
        const customerId = getCustomerId();
        if (!customerId) {
            setModalTitle('Hata');
            setModalMessage('Kullanıcı kimliği bulunamadı. Lütfen giriş yapın.');
            setModalVariant('error');
            setModalOpen(true);
            return;
        }

        if (cartItems.length === 0) return;

        try {
            setLoading(true);
            
            // Map cart items into OrderItemRequests
            const orderItems = cartItems.map(item => ({
                productId: item.productId || item.id, // Fallbacks
                quantity: item.quantity || item.qty || 1
            }));

            const payload = {
                customerId,
                items: orderItems,
                deliveryAddress
            };

            await api.post('/api/orders', payload);

            // Successfully ordered! Clear local storage
            localStorage.removeItem('cart');
            setCartItems([]);
            setServerCartId(null);
            window.dispatchEvent(new Event('storage'));

            setModalTitle('Sipariş Alındı');
            setModalMessage('Siparişiniz başarıyla oluşturuldu ve durum takibine alındı.');
            setModalVariant('success');
            setModalOpen(true);
        } catch (err) {
            console.error(err);
            const serverMsg = err?.response?.data?.message || err?.response?.data || err.message;
            setModalTitle('Sipariş Hatası');
            setModalMessage(typeof serverMsg === 'string' ? serverMsg : 'Stok yetersiz veya sipariş oluşturulamadı.');
            setModalVariant('error');
            setModalOpen(true);
        } finally {
            setLoading(false);
        }
    };

    // Calculate total price based on item total prices
    const cartTotal = cartItems.reduce((acc, item) => acc + (item.itemTotalPrice || ((item.unitPrice || item.price || 0) * (item.quantity || item.qty || 1))), 0);

    return (
        <div className="animate-fade-in" style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
            
            {/* Left Column: Cart Items List */}
            <div style={{ flex: '2', minWidth: '500px' }}>
                <h2 className="serif-title" style={{ fontSize: '28px', color: 'var(--primary)', marginBottom: '24px' }}>Sepetim</h2>
                
                {loading && cartItems.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <i className='bx bx-loader-alt bx-spin' style={{ fontSize: '32px' }}></i>
                    </div>
                ) : cartItems.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '50px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                        <i className='bx bx-shopping-bag' style={{ fontSize: '56px', color: '#cbd5e1' }}></i>
                        <h4 style={{ fontSize: '18px', fontWeight: '700' }}>Sepetiniz Boş</h4>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '300px' }}>Kataloğumuza göz atarak Mondi Home mobilya varyasyonlarından sepetinize ekleyebilirsiniz.</p>
                        <button className="btn btn-primary" onClick={() => navigate('/products')} style={{ marginTop: '10px' }}>
                            Alışverişe Başla
                        </button>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table className="elegant-table">
                            <thead>
                                <tr>
                                    <th>Ürün Varyasyonu</th>
                                    <th>Birim Fiyat</th>
                                    <th>Miktar</th>
                                    <th>Toplam</th>
                                    <th>İşlem</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cartItems.map((item) => {
                                    const matchId = item.id || item.variantId;
                                    const qty = item.quantity || item.qty || 1;
                                    const price = item.unitPrice || item.price || 0;
                                    const total = item.itemTotalPrice || (price * qty);

                                    return (
                                        <tr key={matchId}>
                                            <td style={{ fontWeight: '600', color: 'var(--primary)' }}>
                                                {item.variantName || item.name || 'Mobilya Varyantı'}
                                            </td>
                                            <td>{price} ₺</td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <button 
                                                        className="btn btn-secondary" 
                                                        style={{ padding: '4px 8px', borderRadius: '4px', minWidth: '24px' }}
                                                        onClick={() => changeQty(matchId, qty, -1)}
                                                        disabled={qty <= 1}
                                                    >
                                                        <i className='bx bx-minus'></i>
                                                    </button>
                                                    <span style={{ fontWeight: '700', fontSize: '14px', minWidth: '20px', textAlign: 'center' }}>
                                                        {qty}
                                                    </span>
                                                    <button 
                                                        className="btn btn-secondary" 
                                                        style={{ padding: '4px 8px', borderRadius: '4px', minWidth: '24px' }}
                                                        onClick={() => changeQty(matchId, qty, 1)}
                                                    >
                                                        <i className='bx bx-plus'></i>
                                                    </button>
                                                </div>
                                            </td>
                                            <td style={{ fontWeight: '700', color: 'var(--accent)' }}>{total} ₺</td>
                                            <td>
                                                <button 
                                                    className="btn btn-danger"
                                                    style={{ padding: '6px 10px', fontSize: '11px', borderRadius: '6px' }}
                                                    onClick={() => removeItem(matchId)}
                                                >
                                                    <i className='bx bx-trash' style={{ fontSize: '14px' }}></i>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Right Column: Checkout Summary Card */}
            {cartItems.length > 0 && (
                <div style={{ flex: '1', minWidth: '300px' }}>
                    <div className="card" style={{ position: 'sticky', top: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '700', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                            Sipariş Özeti
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Ürün Toplamı</span>
                                <span style={{ fontWeight: '600' }}>{cartTotal} ₺</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Kargo / Nakliye</span>
                                <span style={{ color: 'var(--success)', fontWeight: '600' }}>Ücretsiz</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '12px', fontSize: '16px', fontWeight: '800' }}>
                                <span>Genel Toplam</span>
                                <span style={{ color: 'var(--accent)' }}>{cartTotal} ₺</span>
                            </div>
                        </div>

                        {/* Delivery Address Field */}
                        <div className="form-group" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginBottom: 0 }}>
                            <label className="form-label">Teslimat Adresi</label>
                            <textarea 
                                value={deliveryAddress}
                                onChange={(e) => setDeliveryAddress(e.target.value)}
                                className="form-control"
                                rows="3"
                                style={{ resize: 'none', fontSize: '13px', lineHeight: '1.4' }}
                                placeholder="Teslimat adresini buraya yazabilirsiniz..."
                            />
                        </div>

                        <button 
                            className="btn btn-accent" 
                            style={{ width: '100%', padding: '14px', fontSize: '15px' }}
                            onClick={handleCheckout}
                            disabled={loading}
                        >
                            <i className='bx bx-check-double' style={{ fontSize: '20px' }}></i>
                            {loading ? 'İşleniyor...' : 'Siparişi Onayla & Ver'}
                        </button>
                    </div>
                </div>
            )}

            <SiteModal 
                open={modalOpen} 
                title={modalTitle} 
                message={modalMessage} 
                variant={modalVariant} 
                onClose={() => {
                    setModalOpen(false);
                    if (modalVariant === 'success') {
                        navigate('/orders');
                    }
                }} 
            />
        </div>
    );
}