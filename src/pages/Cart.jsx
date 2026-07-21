import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { getCurrentUser } from '../services/auth';
import SiteModal from '../components/SiteModal';

export default function Cart() {
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(false);
    const [serverCartId, setServerCartId] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalMessage, setModalMessage] = useState('');
    const [modalVariant, setModalVariant] = useState('info');

    const user = getCurrentUser();

    // Geliştirilmiş ve esnek kullanıcı ID yakalama fonksiyonu
    const getCustomerId = () => {
        // 1. Önce doğrudan user objesindeki olası alanlara bak
        const raw = user?.id || user?.userId || user?.customerId || user?.sub || user?.kullaniciId || null;
        if (raw != null && !isNaN(Number(raw))) {
            return Number(raw);
        }

        // 2. Eğer user objesinde bulunamadıysa, localStorage'daki token'ı decode etmeyi dene (JWT için)
        try {
            const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
            if (token && token.split('.').length === 3) {
                const payload = JSON.parse(atob(token.split('.')[1]));
                const tokenParsedId = payload?.id || payload?.userId || payload?.sub || payload?.customerId;
                if (tokenParsedId != null && !isNaN(Number(tokenParsedId))) {
                    return Number(tokenParsedId);
                }
            }
        } catch (e) {
            console.warn('Token çözümlenemedi:', e);
        }

        return null;
    };

    const fetchServerCart = async (customerId) => {
        try {
            const res = await api.get(`/api/carts/customer/${customerId}`);
            const data = res.data || res;
            if (data && data.items) {
                const mapped = data.items.map((it) => ({
                    id: it.itemId || it.id,
                    productId: it.productId || it.product?.id || it.product?.productId || it.id,
                    name: it.productName || it.title || it.product?.name || 'Ürün',
                    price: it.price || it.product?.price || 0,
                    qty: it.quantity || it.qty || 1,
                    cartId: data.id || data.cartId
                }));
                setCart(mapped);
                setServerCartId(data.id || data.cartId);
                return true;
            }
        } catch (err) {
            console.warn('Sunucu sepeti yüklenemedi, yerel sepete geçiliyor', err);
        }
        return false;
    };

    useEffect(() => {
        const loadCart = async () => {
            const customerId = getCustomerId();
            if (customerId) {
                const success = await fetchServerCart(customerId);
                if (success) return;
            }

            const stored = JSON.parse(localStorage.getItem('cart') || '[]');
            const normalizedStored = stored.map((item) => ({
                ...item,
                productId: item.productId || item.id
            }));
            setCart(normalizedStored);
        };

        loadCart();
    }, []);

    const removeItem = async (id) => {
        try {
            if (serverCartId && typeof id === 'number') {
                await api.delete(`/api/carts/${serverCartId}/items/${id}`);
                const customerId = getCustomerId();
                if (customerId && (await fetchServerCart(customerId))) return;
            }
        } catch (err) {
            console.warn('Sunucudan ürün silinemedi, yerel güncelleniyor', err);
        }

        const next = cart.filter((c) => c.id !== id);
        setCart(next);
        localStorage.setItem('cart', JSON.stringify(next));
    };

    const changeQty = async (id, qty) => {
        try {
            if (serverCartId && typeof id === 'number') {
                await api.put(`/api/carts/${serverCartId}/items/${id}?quantity=${qty}`);
                const customerId = getCustomerId();
                if (customerId && (await fetchServerCart(customerId))) return;
            }
        } catch (err) {
            console.warn('Sunucuda adet güncellenemedi, yerel güncelleniyor', err);
        }

        const next = cart.map((c) => (c.id === id ? { ...c, qty } : c));
        setCart(next);
        localStorage.setItem('cart', JSON.stringify(next));
    };

    const checkout = async () => {
        const customerId = getCustomerId();
        if (!customerId) {
            setModalTitle('Hata');
            setModalMessage('Kullanıcı ID bilgisi bulunamadı. Lütfen tekrar giriş yapın.');
            setModalVariant('error');
            setModalOpen(true);
            return;
        }

        try {
            setLoading(true);
            const orderPayload = {
                customerId,
                items: cart.map((c) => ({
                    productId: c.productId || c.id,
                    quantity: c.qty || c.quantity || 1
                }))
            };

            if (orderPayload.items.some((item) => !item.productId)) {
                throw new Error('Sepetteki bazı ürünlerin ID bilgisi eksik (null).');
            }

            await api.post('/api/orders', orderPayload);

            localStorage.removeItem('cart');
            setCart([]);
            setServerCartId(null);

            setModalTitle('Sipariş Başarılı');
            setModalMessage('Siparişiniz başarıyla oluşturuldu.');
            setModalVariant('success');
            setModalOpen(true);
        } catch (err) {
            console.error(err);
            const serverMsg = err?.response?.data?.message || err?.response?.data || err.message || 'Checkout sırasında hata oluştu.';
            setModalTitle('Hata');
            setModalMessage(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg));
            setModalVariant('error');
            setModalOpen(true);
        } finally {
            setLoading(false);
        }
    };

    const total = cart.reduce((s, i) => s + (i.price || 0) * (i.qty || 1), 0);

    return (
        <div>
            <h2>Sepetim</h2>
            {cart.length === 0 ? (
                <div>Sepetiniz boş.</div>
            ) : (
                <div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th style={{ textAlign: 'left', padding: '8px 12px' }}>Ürün</th>
                                <th style={{ textAlign: 'left', padding: '8px 12px' }}>Fiyat</th>
                                <th style={{ textAlign: 'left', padding: '8px 12px' }}>Adet</th>
                                <th style={{ textAlign: 'left', padding: '8px 12px' }}>Toplam</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {cart.map((c) => (
                                <tr key={c.id || c.productId}>
                                    <td style={{ padding: '8px 12px' }}>{c.name}</td>
                                    <td style={{ padding: '8px 12px' }}>{c.price} ₺</td>
                                    <td style={{ padding: '8px 12px' }}>
                                        <input
                                            type="number"
                                            value={c.qty}
                                            min={1}
                                            onChange={(e) => changeQty(c.id, Number(e.target.value))}
                                            style={{ width: 60 }}
                                        />
                                    </td>
                                    <td style={{ padding: '8px 12px' }}>{(c.price * c.qty) || 0} ₺</td>
                                    <td style={{ padding: '8px 12px' }}>
                                        <button
                                            onClick={() => removeItem(c.id)}
                                            style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer' }}
                                        >
                                            Kaldır
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div style={{ marginTop: 16, textAlign: 'right' }}>
                        <strong>Toplam: {total} ₺</strong>
                        <div style={{ marginTop: 12 }}>
                            <button
                                onClick={checkout}
                                disabled={loading}
                                style={{ padding: '10px 16px', background: '#06b6d4', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}
                            >
                                {loading ? 'İşleniyor...' : 'Satın Al / Sipariş Ver'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <SiteModal open={modalOpen} title={modalTitle} message={modalMessage} variant={modalVariant} onClose={() => setModalOpen(false)} />
        </div>
    );
}