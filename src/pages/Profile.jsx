import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { getCurrentUser } from '../services/auth';
import SiteModal from '../components/SiteModal';

export default function Profile() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState('');

    // Site modal notifications
    const [modalOpen, setModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalMessage, setModalMessage] = useState('');
    const [modalVariant, setModalVariant] = useState('info');

    const user = getCurrentUser();
    const getCustomerId = () => {
        const raw = user?.id || user?.userId || user?.customerId || user?.sub || null;
        if (raw != null && !isNaN(Number(raw))) return Number(raw);
        const localId = localStorage.getItem('customerId');
        if (localId) return Number(localId);
        return null;
    };

    const customerId = getCustomerId();

    useEffect(() => {
        if (!customerId) {
            setError('Profil bilgilerini yüklemek için lütfen giriş yapın.');
            setLoading(false);
            return;
        }

        const fetchProfile = async () => {
            try {
                const response = await api.get(`/api/customers/${customerId}`);
                const data = response.data || response;
                setName(data.name || '');
                setEmail(data.email || '');
                setPhone(data.phone || '');
            } catch (err) {
                console.error(err);
                setError('Profil bilgileri sunucudan yüklenemedi. Çevrimdışı modda bilgiler yerel hafızadan yükleniyor.');
                // Fallback to local storage user details
                if (user) {
                    setName(user.name || '');
                    setEmail(user.email || '');
                    setPhone(user.phone || '');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [customerId]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (password && password !== confirmPassword) {
            setModalTitle('Hata');
            setModalMessage('Şifreler uyuşmuyor.');
            setModalVariant('error');
            setModalOpen(true);
            return;
        }

        setUpdating(true);
        try {
            const payload = {
                name,
                email,
                phone,
                password: password || null
            };

            await api.put(`/api/customers/${customerId}`, payload);

            // Update user in local storage to update sidebar name instantly
            if (user) {
                const updatedUser = { ...user, name };
                localStorage.setItem('currentUser', JSON.stringify(updatedUser));
                // Dispatch storage event to trigger sidebar refresh
                window.dispatchEvent(new Event('storage'));
            }

            setPassword('');
            setConfirmPassword('');
            
            setModalTitle('Profil Güncellendi');
            setModalMessage('Profil bilgileriniz başarıyla güncellendi.');
            setModalVariant('success');
            setModalOpen(true);
        } catch (err) {
            console.error(err);
            const serverMsg = err?.response?.data?.message || err?.response?.data || err.message;
            setModalTitle('Hata');
            setModalMessage(typeof serverMsg === 'string' ? serverMsg : 'Profil güncellenirken bir hata oluştu.');
            setModalVariant('error');
            setModalOpen(true);
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '100px', color: 'var(--text-muted)' }}>
                <i className='bx bx-loader-alt bx-spin' style={{ fontSize: '48px', marginBottom: '16px', color: 'var(--primary)' }}></i>
                <div>Yükleniyor...</div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in" style={{ maxWidth: '650px', margin: '0 auto', paddingBottom: '50px' }}>
            <div style={{ marginBottom: '28px' }}>
                <h2 className="serif-title" style={{ fontSize: '28px', color: 'var(--primary)', marginBottom: '6px' }}>Hesap Profilim</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Hesap bilgilerinizi güncelleyebilir, şifrenizi değiştirebilirsiniz.</p>
            </div>

            {error && (
                <div className="login-alert login-alert-error" style={{ marginBottom: '20px' }}>
                    <i className='bx bx-info-circle' style={{ fontSize: '18px' }}></i>
                    <span>{error}</span>
                </div>
            )}

            <div className="card" style={{ padding: '30px' }}>
                <form onSubmit={handleUpdate}>
                    <div className="form-group">
                        <label className="form-label">Ad Soyad</label>
                        <div style={{ position: 'relative' }}>
                            <input 
                                type="text" 
                                className="form-control" 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required 
                                style={{ paddingLeft: '40px' }}
                            />
                            <i className='bx bx-user' style={{ position: 'absolute', left: '14px', top: '12px', color: 'var(--text-muted)', fontSize: '18px' }}></i>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">E-posta Adresi</label>
                        <div style={{ position: 'relative' }}>
                            <input 
                                type="email" 
                                className="form-control" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required 
                                style={{ paddingLeft: '40px' }}
                            />
                            <i className='bx bx-envelope' style={{ position: 'absolute', left: '14px', top: '12px', color: 'var(--text-muted)', fontSize: '18px' }}></i>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Telefon Numarası</label>
                        <div style={{ position: 'relative' }}>
                            <input 
                                type="tel" 
                                className="form-control" 
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                required 
                                style={{ paddingLeft: '40px' }}
                            />
                            <i className='bx bx-phone' style={{ position: 'absolute', left: '14px', top: '12px', color: 'var(--text-muted)', fontSize: '18px' }}></i>
                        </div>
                    </div>

                    <div style={{ borderTop: '1px solid var(--border-color)', margin: '24px 0', paddingTop: '20px' }}>
                        <h4 style={{ fontSize: '15px', color: 'var(--primary)', fontWeight: '700', marginBottom: '14px' }}>Şifre Değiştir (İsteğe Bağlı)</h4>
                        
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <div className="form-group" style={{ flex: 1 }}>
                                <label className="form-label">Yeni Şifre</label>
                                <div style={{ position: 'relative' }}>
                                    <input 
                                        type="password" 
                                        className="form-control" 
                                        placeholder="Boş bırakırsanız değişmez"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        style={{ paddingLeft: '40px' }}
                                    />
                                    <i className='bx bx-lock-alt' style={{ position: 'absolute', left: '14px', top: '12px', color: 'var(--text-muted)', fontSize: '18px' }}></i>
                                </div>
                            </div>
                            
                            <div className="form-group" style={{ flex: 1 }}>
                                <label className="form-label">Yeni Şifre (Tekrar)</label>
                                <div style={{ position: 'relative' }}>
                                    <input 
                                        type="password" 
                                        className="form-control" 
                                        placeholder="Boş bırakırsanız değişmez"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        style={{ paddingLeft: '40px' }}
                                    />
                                    <i className='bx bx-check-shield' style={{ position: 'absolute', left: '14px', top: '12px', color: 'var(--text-muted)', fontSize: '18px' }}></i>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        className="btn btn-accent" 
                        style={{ width: '100%', padding: '12px', fontWeight: '700', marginTop: '10px' }}
                        disabled={updating}
                    >
                        {updating ? (
                            <>
                                <i className='bx bx-loader-alt bx-spin' style={{ marginRight: '6px' }}></i>
                                Güncelleniyor...
                            </>
                        ) : 'Profil Bilgilerimi Güncelle'}
                    </button>
                </form>
            </div>
            
            <SiteModal open={modalOpen} title={modalTitle} message={modalMessage} variant={modalVariant} onClose={() => setModalOpen(false)} />
        </div>
    );
}
