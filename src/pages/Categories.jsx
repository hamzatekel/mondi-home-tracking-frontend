import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { getCurrentUser } from '../services/auth';
import SiteModal from '../components/SiteModal';

export default function Categories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    const [modalOpen, setModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalMessage, setModalMessage] = useState('');
    const [modalVariant, setModalVariant] = useState('info');

    const user = getCurrentUser();
    const customerRole = localStorage.getItem('customerRole') || user?.role || 'ROLE_CUSTOMER';
    const isAdmin = customerRole === 'ROLE_ADMIN' || customerRole === 'admin';

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const res = await api.get('/api/categories');
            setCategories(res.data || res);
        } catch (err) {
            console.error(err);
            setError('Kategoriler yüklenirken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleAddCategory = async (e) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;

        try {
            await api.post('/api/categories', { name: newCategoryName });
            setNewCategoryName('');
            setShowAddModal(false);
            
            setModalTitle('Başarılı');
            setModalMessage('Kategori başarıyla oluşturuldu.');
            setModalVariant('success');
            setModalOpen(true);
            
            fetchCategories();
        } catch (err) {
            console.error(err);
            setModalTitle('Hata');
            setModalMessage('Kategori eklenirken hata oluştu.');
            setModalVariant('error');
            setModalOpen(true);
        }
    };

    // Helper to get category icons for premium looks
    const getCategoryIcon = (name) => {
        const lower = name.toLowerCase();
        if (lower.includes('koltuk') || lower.includes('sofa') || lower.includes('oturma')) return 'bx bx-chair';
        if (lower.includes('yatak') || lower.includes('baza') || lower.includes('uyku')) return 'bx bx-bed';
        if (lower.includes('yemek') || lower.includes('masa') || lower.includes('sandalye')) return 'bx bx-restaurant';
        if (lower.includes('dolap') || lower.includes('gardrop') || lower.includes('şifonyer')) return 'bx bx-cabinet';
        if (lower.includes('tv') || lower.includes('konsol') || lower.includes('sehpa')) return 'bx bx-tv';
        return 'bx bx-home';
    };

    return (
        <div className="animate-fade-in">
            {/* Header Area */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                <div>
                    <h2 className="serif-title" style={{ fontSize: '28px', color: 'var(--primary)', marginBottom: '6px' }}>Kategori Yönetimi</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Mobilya koleksiyonlarının sınıflandırılmasını ve hiyerarşisini buradan inceleyebilirsiniz.</p>
                </div>
                {isAdmin && (
                    <button 
                        className="btn btn-accent" 
                        onClick={() => setShowAddModal(true)}
                    >
                        <i className='bx bx-plus' style={{ fontSize: '18px' }}></i>
                        Yeni Kategori Ekle
                    </button>
                )}
            </div>

            {error && (
                <div className="login-alert login-alert-error" style={{ marginBottom: '20px' }}>
                    <i className='bx bx-error-circle' style={{ fontSize: '18px' }}></i>
                    <span>{error}</span>
                </div>
            )}

            {/* Content List */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    <i className='bx bx-loader-alt bx-spin' style={{ fontSize: '32px', marginBottom: '10px' }}></i>
                    <div>Yükleniyor...</div>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                    {categories.length === 0 ? (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', background: 'white', borderRadius: 'var(--radius-lg)', color: 'var(--text-muted)' }}>
                            <i className='bx bx-purchase-tag' style={{ fontSize: '48px', color: '#cbd5e1', marginBottom: '16px' }}></i>
                            <div>Kayıtlı kategori bulunamadı.</div>
                        </div>
                    ) : (
                        categories.map((cat) => (
                            <div key={cat.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '24px' }}>
                                <div style={{ 
                                    width: '60px', 
                                    height: '60px', 
                                    borderRadius: '12px', 
                                    backgroundColor: 'rgba(242, 111, 33, 0.08)', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    color: 'var(--accent)',
                                    fontSize: '28px'
                                }}>
                                    <i className={getCategoryIcon(cat.name)}></i>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: '18px', fontWeight: '700', color: 'var(--primary)' }}>{cat.name}</span>
                                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>ID: #{cat.id}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Add Category Modal */}
            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '20px', fontWeight: '700' }}>Yeni Kategori Ekle</h3>
                            <button 
                                onClick={() => setShowAddModal(false)} 
                                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px', color: 'var(--text-muted)' }}
                            >
                                <i className='bx bx-x'></i>
                            </button>
                        </div>
                        <form onSubmit={handleAddCategory}>
                            <div className="form-group">
                                <label className="form-label">Kategori Adı</label>
                                <input 
                                    type="text" 
                                    placeholder="Örn: Koltuk Takımları, Yatak Odası..." 
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    required
                                    className="form-control"
                                    autoFocus
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>İptal</button>
                                <button type="submit" className="btn btn-primary">Oluştur</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <SiteModal open={modalOpen} title={modalTitle} message={modalMessage} variant={modalVariant} onClose={() => setModalOpen(false)} />
        </div>
    );
}
