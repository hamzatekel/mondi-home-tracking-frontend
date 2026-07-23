import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { getCurrentUser } from '../services/auth';
import SiteModal from '../components/SiteModal';

export default function PriceLists() {
    const [priceLists, setPriceLists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedList, setSelectedList] = useState(null);
    const [selectedListItems, setSelectedListItems] = useState([]);
    const [loadingItems, setLoadingItems] = useState(false);
    
    // Add Price List Modal State
    const [showAddListModal, setShowAddListModal] = useState(false);
    const [listName, setListName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isActive, setIsActive] = useState(true);

    // Add Price Item Modal State
    const [showAddItemModal, setShowAddItemModal] = useState(false);
    const [availableVariants, setAvailableVariants] = useState([]);
    const [selectedVariantId, setSelectedVariantId] = useState('');
    const [overridePrice, setOverridePrice] = useState('');

    const [modalOpen, setModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalMessage, setModalMessage] = useState('');
    const [modalVariant, setModalVariant] = useState('info');

    const user = getCurrentUser();
    const customerRole = localStorage.getItem('customerRole') || user?.role || 'ROLE_CUSTOMER';
    const isAdmin = customerRole === 'ROLE_ADMIN' || customerRole === 'admin';

    const fetchPriceLists = async () => {
        try {
            setLoading(true);
            const res = await api.get('/api/price-lists');
            setPriceLists(res.data || res);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchListDetails = async (id) => {
        try {
            setLoadingItems(true);
            const res = await api.get(`/api/price-lists/${id}`);
            const data = res.data || res;
            setSelectedList(data);
            setSelectedListItems(data.items || []);
        } catch (err) {
            console.error(err);
            setSelectedListItems([]);
        } finally {
            setLoadingItems(false);
        }
    };

    const handleDeleteItemFromPriceList = async (priceListId, itemId) => {
        if (!window.confirm('Bu fiyatlandırma kaydını silmek istediğinize emin misiniz?')) return;
        try {
            await api.delete(`/api/price-lists/${priceListId}/items/${itemId}`);
            setModalTitle('Başarılı');
            setModalMessage('Varyant fiyat kaydı silindi.');
            setModalVariant('success');
            setModalOpen(true);
            fetchListDetails(priceListId);
        } catch (err) {
            console.error(err);
            setModalTitle('Hata');
            setModalMessage('Fiyat kaydı silinirken hata oluştu.');
            setModalVariant('error');
            setModalOpen(true);
        }
    };

    const fetchAvailableVariantsForSelect = async () => {
        try {
            const res = await api.get('/api/products');
            const prods = res.data || [];
            const vars = [];
            prods.forEach(p => {
                if (p.variants && p.variants.length > 0) {
                    p.variants.forEach(v => {
                        vars.push({
                            id: v.id,
                            label: `${p.name} - ${v.sku} (${v.color || 'Standart Color'}, ${v.material || 'Standart Material'}, ${v.size || 'Standart Size'})`
                        });
                    });
                }
            });
            setAvailableVariants(vars);
            if (vars.length > 0) setSelectedVariantId(vars[0].id);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchPriceLists();
    }, []);

    const handleCreateList = async (e) => {
        e.preventDefault();
        try {
            const payload = { name: listName, startDate, endDate, isActive };
            await api.post('/api/price-lists', payload);
            setShowAddListModal(false);
            setListName('');
            setStartDate('');
            setEndDate('');
            setIsActive(true);

            setModalTitle('Başarılı');
            setModalMessage('Fiyat listesi başarıyla oluşturuldu.');
            setModalVariant('success');
            setModalOpen(true);
            fetchPriceLists();
        } catch (err) {
            console.error(err);
            setModalTitle('Hata');
            setModalMessage('Liste eklenirken hata oluştu.');
            setModalVariant('error');
            setModalOpen(true);
        }
    };

    const handleDeleteList = async (id, e) => {
        e.stopPropagation(); // Avoid triggering list select details click
        if (!window.confirm('Bu fiyat listesini silmek istediğinize emin misiniz?')) return;
        try {
            await api.delete(`/api/price-lists/${id}`);
            if (selectedList && selectedList.id === id) {
                setSelectedList(null);
                setSelectedListItems([]);
            }
            setModalTitle('Başarılı');
            setModalMessage('Fiyat listesi başarıyla silindi.');
            setModalVariant('success');
            setModalOpen(true);
            fetchPriceLists();
        } catch (err) {
            console.error(err);
            setModalTitle('Hata');
            setModalMessage('Liste silinirken hata oluştu.');
            setModalVariant('error');
            setModalOpen(true);
        }
    };

    const handleAddItemToPriceList = async (e) => {
        e.preventDefault();
        if (!selectedList || !selectedVariantId || !overridePrice) return;
        try {
            const payload = { variantId: Number(selectedVariantId), price: Number(overridePrice) };
            await api.post(`/api/price-lists/${selectedList.id}/items`, payload);
            
            setShowAddItemModal(false);
            setOverridePrice('');
            
            setModalTitle('Başarılı');
            setModalMessage('Fiyat listesine ürün/varyant eklendi.');
            setModalVariant('success');
            setModalOpen(true);
            
            fetchListDetails(selectedList.id);
        } catch (err) {
            console.error(err);
            setModalTitle('Hata');
            setModalMessage('Varyant fiyata eklenirken hata oluştu.');
            setModalVariant('error');
            setModalOpen(true);
        }
    };

    const openAddItemDialog = () => {
        fetchAvailableVariantsForSelect();
        setShowAddItemModal(true);
    };

    return (
        <div className="animate-fade-in" style={{ display: 'flex', gap: '30px', flexDirection: 'column' }}>
            {/* Header Area */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 className="serif-title" style={{ fontSize: '28px', color: 'var(--primary)', marginBottom: '6px' }}>Fiyat Listeleri</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Dönemsel kampanyalar, iskonto oranları ve mağaza fiyat listelerini yönetin.</p>
                </div>
                {isAdmin && (
                    <button className="btn btn-accent" onClick={() => setShowAddListModal(true)}>
                        <i className='bx bx-plus' style={{ fontSize: '18px' }}></i>
                        Yeni Fiyat Listesi Oluştur
                    </button>
                )}
            </div>

            <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
                {/* Left side: Lists Grid */}
                <div style={{ flex: '1', minWidth: '350px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <i className='bx bx-list-ul' style={{ color: 'var(--accent)' }}></i>
                        Aktif / Tanımlı Listeler
                    </h3>
                    
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>Yükleniyor...</div>
                    ) : priceLists.length === 0 ? (
                        <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                            Tanımlı fiyat listesi bulunamadı.
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {priceLists.map((list) => {
                                const isSelected = selectedList && selectedList.id === list.id;
                                return (
                                    <div 
                                        key={list.id} 
                                        onClick={() => fetchListDetails(list.id)}
                                        className="card" 
                                        style={{ 
                                            cursor: 'pointer', 
                                            border: isSelected ? '2px solid var(--accent)' : '1px solid var(--border-color)',
                                            backgroundColor: isSelected ? '#fafbfc' : 'white',
                                            padding: '20px',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <span style={{ fontSize: '16px', fontWeight: '700', color: 'var(--primary)' }}>{list.name}</span>
                                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                                <i className='bx bx-calendar' style={{ marginRight: '4px' }}></i>
                                                {list.startDate} ile {list.endDate} arası
                                            </span>
                                            <span style={{ 
                                                fontSize: '11px', 
                                                fontWeight: '700', 
                                                color: list.isActive ? 'var(--success)' : 'var(--text-muted)',
                                                textTransform: 'uppercase',
                                                marginTop: '4px'
                                            }}>
                                                {list.isActive ? '● Aktif' : '○ Pasif'}
                                            </span>
                                        </div>
                                        
                                        {isAdmin && (
                                            <button 
                                                className="btn" 
                                                onClick={(e) => handleDeleteList(list.id, e)}
                                                style={{ padding: '8px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', borderRadius: '8px' }}
                                                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--error)'; e.currentTarget.style.color = 'white'; }}
                                                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.color = 'var(--error)'; }}
                                            >
                                                <i className='bx bx-trash' style={{ fontSize: '18px' }}></i>
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Right side: Selected List Items */}
                <div style={{ flex: '1.5', minWidth: '400px' }}>
                    {selectedList ? (
                        <div className="card" style={{ minHeight: '300px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                                <div>
                                    <span style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: '700', textTransform: 'uppercase' }}>Fiyat Listesi Detayı</span>
                                    <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--primary)' }}>{selectedList.name}</h3>
                                </div>
                                {isAdmin && (
                                    <button className="btn btn-primary" onClick={openAddItemDialog}>
                                        <i className='bx bx-plus' style={{ fontSize: '16px' }}></i>
                                        Varyant Fiyat Ekle
                                    </button>
                                )}
                            </div>

                            {loadingItems ? (
                                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                    <i className='bx bx-loader-alt bx-spin' style={{ fontSize: '24px' }}></i>
                                </div>
                            ) : selectedListItems.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                    <i className='bx bx-info-circle' style={{ fontSize: '36px', color: '#cbd5e1', marginBottom: '10px' }}></i>
                                    <div>Bu fiyat listesinde henüz fiyatlandırılmış varyant bulunmuyor.</div>
                                </div>
                            ) : (
                                <div className="table-wrapper">
                                    <table className="elegant-table">
                                        <thead>
                                            <tr>
                                                <th>Varyant / Ürün</th>
                                                <th>Özel Liste Fiyatı</th>
                                                {isAdmin && <th style={{ textAlign: 'right' }}>İşlem</th>}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedListItems.map((item) => (
                                                <tr key={item.id}>
                                                    <td style={{ fontWeight: '500' }}>
                                                        {item.variantName || item.variantSku || `Varyant #${item.variantId || item.id}`}
                                                    </td>
                                                    <td style={{ fontWeight: '700', color: 'var(--accent)', fontSize: '15px' }}>
                                                        {item.price ? `${item.price} ₺` : '-'}
                                                    </td>
                                                    {isAdmin && (
                                                        <td style={{ textAlign: 'right' }}>
                                                            <button 
                                                                onClick={() => handleDeleteItemFromPriceList(selectedList.id, item.id)}
                                                                style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', fontSize: '18px' }}
                                                                title="Kaydı Sil"
                                                            >
                                                                <i className='bx bx-trash'></i>
                                                            </button>
                                                        </td>
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '350px', borderStyle: 'dashed', borderWidth: '2px', borderColor: '#cbd5e1', backgroundColor: 'transparent' }}>
                            <i className='bx bx-mouse' style={{ fontSize: '48px', color: '#94a3b8', marginBottom: '16px' }}></i>
                            <h4 style={{ color: 'var(--text-dark)', fontWeight: '600' }}>Detayları Görüntüle</h4>
                            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>İçerisindeki özel fiyatlandırılmış varyant listesini görmek için soldan bir fiyat listesine tıklayın.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Add List Modal */}
            {showAddListModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '20px', fontWeight: '700' }}>Yeni Fiyat Listesi Oluştur</h3>
                            <button onClick={() => setShowAddListModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px', color: 'var(--text-muted)' }}>
                                <i className='bx bx-x'></i>
                            </button>
                        </div>
                        <form onSubmit={handleCreateList}>
                            <div className="form-group">
                                <label className="form-label">Liste Adı</label>
                                <input 
                                    type="text" 
                                    placeholder="Örn: 2026 Yaz Sezonu İndirimi" 
                                    value={listName}
                                    onChange={(e) => setListName(e.target.value)}
                                    required
                                    className="form-control"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Başlangıç Tarihi</label>
                                <input 
                                    type="date" 
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    required
                                    className="form-control"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Bitiş Tarihi</label>
                                <input 
                                    type="date" 
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    required
                                    className="form-control"
                                />
                            </div>
                            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                                <input 
                                    type="checkbox" 
                                    id="isActive"
                                    checked={isActive}
                                    onChange={(e) => setIsActive(e.target.checked)}
                                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                />
                                <label htmlFor="isActive" style={{ fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>Varsayılan Olarak Aktif Et</label>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowAddListModal(false)}>İptal</button>
                                <button type="submit" className="btn btn-primary">Oluştur</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Price Item Modal */}
            {showAddItemModal && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '600px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '20px', fontWeight: '700' }}>Fiyat Listesine Varyant Ekle</h3>
                            <button onClick={() => setShowAddItemModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px', color: 'var(--text-muted)' }}>
                                <i className='bx bx-x'></i>
                            </button>
                        </div>
                        <form onSubmit={handleAddItemToPriceList}>
                            <div className="form-group">
                                <label className="form-label">Ürün Varyantı Seçin</label>
                                {availableVariants.length === 0 ? (
                                    <div style={{ color: 'var(--error)', fontSize: '13px', padding: '10px 0' }}>Sistemde kayıtlı varyant bulunamadı! Lütfen önce ürün sayfasına gidip ürünlere varyant tanımlayın.</div>
                                ) : (
                                    <select 
                                        value={selectedVariantId}
                                        onChange={(e) => setSelectedVariantId(e.target.value)}
                                        className="form-control"
                                        required
                                    >
                                        {availableVariants.map(v => (
                                            <option key={v.id} value={v.id}>{v.label}</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                            
                            <div className="form-group">
                                <label className="form-label">Özel Liste Fiyatı (₺)</label>
                                <input 
                                    type="number" 
                                    step="0.01"
                                    placeholder="Liste kapsamında uygulanacak fiyatı girin" 
                                    value={overridePrice}
                                    onChange={(e) => setOverridePrice(e.target.value)}
                                    required
                                    className="form-control"
                                    disabled={availableVariants.length === 0}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowAddItemModal(false)}>İptal</button>
                                <button type="submit" className="btn btn-primary" disabled={availableVariants.length === 0}>Fiyata Ekle</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <SiteModal open={modalOpen} title={modalTitle} message={modalMessage} variant={modalVariant} onClose={() => setModalOpen(false)} />
        </div>
    );
}
