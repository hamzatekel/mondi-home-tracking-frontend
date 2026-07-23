import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { getCurrentUser } from '../services/auth';
import SiteModal from '../components/SiteModal';

export default function Stores() {
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedCityFilter, setSelectedCityFilter] = useState('ALL');
    
    // Add Store Modal State
    const [showAddModal, setShowAddModal] = useState(false);
    const [storeName, setStoreName] = useState('');
    const [city, setCity] = useState('');
    const [district, setDistrict] = useState('');
    const [address, setAddress] = useState('');

    const [modalOpen, setModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalMessage, setModalMessage] = useState('');
    const [modalVariant, setModalVariant] = useState('info');

    const user = getCurrentUser();
    const customerRole = localStorage.getItem('customerRole') || user?.role || 'ROLE_CUSTOMER';
    const isAdmin = customerRole === 'ROLE_ADMIN' || customerRole === 'admin';

    const fetchStores = async () => {
        try {
            setLoading(true);
            const res = await api.get('/api/stores');
            setStores(res.data || res);
        } catch (err) {
            console.error(err);
            setError('Mağazalar yüklenirken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStores();
    }, []);

    const handleCreateStore = async (e) => {
        e.preventDefault();
        try {
            const payload = { name: storeName, city, district, address };
            await api.post('/api/stores', payload);
            
            setShowAddModal(false);
            setStoreName('');
            setCity('');
            setDistrict('');
            setAddress('');

            setModalTitle('Başarılı');
            setModalMessage('Mağaza başarıyla tanımlandı.');
            setModalVariant('success');
            setModalOpen(true);
            fetchStores();
        } catch (err) {
            console.error(err);
            setModalTitle('Hata');
            setModalMessage('Mağaza eklenirken hata oluştu.');
            setModalVariant('error');
            setModalOpen(true);
        }
    };

    // Extract unique cities for filtering options
    const uniqueCities = ['ALL', ...new Set(stores.map(s => s.city.toUpperCase()))];

    const filteredStores = selectedCityFilter === 'ALL'
        ? stores
        : stores.filter(s => s.city.toUpperCase() === selectedCityFilter);

    return (
        <div className="animate-fade-in">
            {/* Header Area */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                <div>
                    <h2 className="serif-title" style={{ fontSize: '28px', color: 'var(--primary)', marginBottom: '6px' }}>Mondi Home Akıllı Mağazalar</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Sistemdeki tüm akıllı showroom ve satış noktalarının lokasyonlarını görüntüleyin.</p>
                </div>
                {isAdmin && (
                    <button className="btn btn-accent" onClick={() => setShowAddModal(true)}>
                        <i className='bx bx-plus' style={{ fontSize: '18px' }}></i>
                        Yeni Mağaza Ekle
                    </button>
                )}
            </div>

            {error && (
                <div className="login-alert login-alert-error" style={{ marginBottom: '20px' }}>
                    <i className='bx bx-error-circle' style={{ fontSize: '18px' }}></i>
                    <span>{error}</span>
                </div>
            )}

            {/* City Filters */}
            {!loading && stores.length > 0 && (
                <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
                    {uniqueCities.map(c => (
                        <button
                            key={c}
                            onClick={() => setSelectedCityFilter(c)}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '20px',
                                border: '1px solid var(--border-color)',
                                fontSize: '13px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                backgroundColor: selectedCityFilter === c ? 'var(--primary)' : 'white',
                                color: selectedCityFilter === c ? 'white' : 'var(--text-dark)',
                                transition: 'var(--transition)'
                            }}
                        >
                            {c === 'ALL' ? 'Tüm Şehirler' : c}
                        </button>
                    ))}
                </div>
            )}

            {/* Store Grid */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    <i className='bx bx-loader-alt bx-spin' style={{ fontSize: '32px', marginBottom: '10px' }}></i>
                    <div>Yükleniyor...</div>
                </div>
            ) : filteredStores.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: 'var(--radius-lg)', color: 'var(--text-muted)' }}>
                    <i className='bx bx-store-alt' style={{ fontSize: '48px', color: '#cbd5e1', marginBottom: '16px' }}></i>
                    <div>Kayıtlı mağaza bulunamadı.</div>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                    {filteredStores.map((store) => (
                        <div key={store.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <div style={{ 
                                        width: '44px', 
                                        height: '44px', 
                                        borderRadius: '10px', 
                                        backgroundColor: 'rgba(13, 35, 58, 0.05)', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        color: 'var(--primary)',
                                        fontSize: '20px'
                                    }}>
                                        <i className='bx bx-store'></i>
                                    </div>
                                    <span style={{ fontSize: '18px', fontWeight: '700', color: 'var(--primary)' }}>{store.name}</span>
                                </div>
                                <span style={{ fontSize: '11px', fontWeight: '700', backgroundColor: 'var(--accent-light)', color: 'var(--accent)', padding: '4px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                                    {store.city}
                                </span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '12px', fontSize: '13px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                                    <i className='bx bx-map-pin' style={{ fontSize: '16px', color: 'var(--accent)' }}></i>
                                    <span style={{ fontWeight: '600' }}>{store.district} / {store.city}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: 'var(--text-dark)', marginTop: '4px' }}>
                                    <i className='bx bx-map' style={{ fontSize: '16px', color: 'var(--accent)', marginTop: '2px' }}></i>
                                    <span style={{ lineHeight: '1.4' }}>{store.address}</span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                                <button className="btn btn-secondary" style={{ flex: 1, padding: '8px', fontSize: '12px' }} onClick={() => alert(`${store.name} Akıllı IoT Sensörleri Bağlanıyor...`)}>
                                    <i className='bx bx-broadcast'></i> IoT Canlı
                                </button>
                                <button className="btn btn-primary" style={{ flex: 1, padding: '8px', fontSize: '12px' }} onClick={() => alert(`${store.name} stok durumları çekiliyor...`)}>
                                    <i className='bx bx-box'></i> Stok Sorgula
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Store Modal */}
            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '20px', fontWeight: '700' }}>Yeni Akıllı Mağaza Ekle</h3>
                            <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px', color: 'var(--text-muted)' }}>
                                <i className='bx bx-x'></i>
                            </button>
                        </div>
                        <form onSubmit={handleCreateStore}>
                            <div className="form-group">
                                <label className="form-label">Mağaza / Showroom Adı</label>
                                <input 
                                    type="text" 
                                    placeholder="Örn: Mondi Home Kayseri Park" 
                                    value={storeName}
                                    onChange={(e) => setStoreName(e.target.value)}
                                    required
                                    className="form-control"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Şehir</label>
                                <input 
                                    type="text" 
                                    placeholder="Örn: Kayseri, İstanbul..." 
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    required
                                    className="form-control"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">İlçe</label>
                                <input 
                                    type="text" 
                                    placeholder="Örn: Melikgazi, Kadıköy..." 
                                    value={district}
                                    onChange={(e) => setDistrict(e.target.value)}
                                    required
                                    className="form-control"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Açık Adres</label>
                                <textarea 
                                    placeholder="Bulvar, mahalle, cadde detaylı mağaza adresi..." 
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    required
                                    rows="2"
                                    className="form-control"
                                    style={{ resize: 'none' }}
                                />
                            </div>
                            
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>İptal</button>
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
