import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import SiteModal from '../components/SiteModal';

export default function Login() {
    const [isRegister, setIsRegister] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [address, setAddress] = useState('');
    const [role, setRole] = useState('ROLE_CUSTOMER'); // default to customer, but selectable
    
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalMessage, setModalMessage] = useState('');
    const [modalVariant, setModalVariant] = useState('info');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';

        const payload = isRegister 
            ? { 
                name, 
                email, 
                password, 
                role, 
                phoneNumber, 
                address 
              }
            : { 
                email, 
                password 
              };

        try {
            const response = await api.post(endpoint, payload);
            const data = response.data;

            // Save authentication response details for both login and register
            if (data.token) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('customerId', data.id);
                localStorage.setItem('customerName', data.name);
                localStorage.setItem('customerRole', data.role);
            }

            if (isRegister) {
                setModalTitle('Kayıt Başarılı');
                setModalMessage(`Tebrikler ${data.name || name}! Hesabınız başarıyla oluşturuldu ve oturum açıldı.`);
                setModalVariant('success');
                setModalOpen(true);
            } else {
                setModalTitle('Giriş Başarılı');
                setModalMessage(`Hoşgeldiniz ${data.name}! Oturum açıldı.`);
                setModalVariant('success');
                setModalOpen(true);
            }
        } catch (err) {
            console.error(err);
            const serverMsg = err?.response?.data?.message || err?.response?.data;
            setError(isRegister 
                ? (typeof serverMsg === 'string' ? serverMsg : 'Kayıt olurken bir hata oluştu.') 
                : 'E-posta veya şifre hatalı.'
            );
        }
    };

    const toggleMode = (registerState) => {
        setIsRegister(registerState);
        setName('');
        setEmail('');
        setPassword('');
        setPhoneNumber('');
        setAddress('');
        setError('');
        setSuccessMessage('');
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-card">
                    {/* Header */}
                    <div className="login-header">
                        <div className="login-logo-container">
                            <i className='bx bx-home-alt login-logo-icon'></i>
                            <span className="login-logo-text">MONDI <span>HOME</span></span>
                        </div>
                        <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--primary)', margin: '0 0 4px 0' }}>
                            {isRegister ? 'Hesap Oluştur' : 'Bayi & Müşteri Girişi'}
                        </h2>
                        <p className="login-subtitle">
                            {isRegister ? 'Akıllı mağaza portalına kayıt olun' : 'Sipariş ve mağaza takip sistemine bağlanın'}
                        </p>
                    </div>

                    {/* Feedback Messages */}
                    {error && (
                        <div className="login-alert login-alert-error">
                            <i className='bx bx-error-circle' style={{ fontSize: '18px' }}></i>
                            <span>{error}</span>
                        </div>
                    )}

                    {successMessage && (
                        <div className="login-alert login-alert-success">
                            <i className='bx bx-check-circle' style={{ fontSize: '18px' }}></i>
                            <span>{successMessage}</span>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {isRegister && (
                            <>
                                <div className="login-form-group">
                                    <label className="form-label">Ad Soyad / Bayi Adı</label>
                                    <div className="login-input-wrapper">
                                        <i className='bx bxs-user login-input-icon'></i>
                                        <input 
                                            type="text" 
                                            placeholder="Adınızı veya bayilik adını girin" 
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required
                                            className="login-input"
                                        />
                                    </div>
                                </div>

                                <div className="login-row">
                                    <div className="login-form-group">
                                        <label className="form-label">Telefon</label>
                                        <div className="login-input-wrapper">
                                            <i className='bx bxs-phone login-input-icon'></i>
                                            <input 
                                                type="text" 
                                                placeholder="05XXXXXXXXX" 
                                                value={phoneNumber}
                                                onChange={(e) => setPhoneNumber(e.target.value)}
                                                required
                                                className="login-input"
                                            />
                                        </div>
                                    </div>

                                    <div className="login-form-group">
                                        <label className="form-label">Hesap Türü</label>
                                        <div className="login-input-wrapper">
                                            <i className='bx bxs-shield login-input-icon' style={{ zIndex: 5 }}></i>
                                            <select 
                                                value={role} 
                                                onChange={(e) => setRole(e.target.value)}
                                                className="login-input"
                                                style={{ paddingLeft: '42px', appearance: 'none', cursor: 'pointer' }}
                                            >
                                                <option value="ROLE_CUSTOMER">Normal Müşteri</option>
                                                <option value="ROLE_ADMIN">Yönetici / Bayi Admin</option>
                                            </select>
                                            <i className='bx bx-chevron-down' style={{ position: 'absolute', right: '14px', pointerEvents: 'none', color: 'var(--text-muted)' }}></i>
                                        </div>
                                    </div>
                                </div>

                                <div className="login-form-group">
                                    <label className="form-label">Teslimat / Bayi Adresi</label>
                                    <div className="login-input-wrapper">
                                        <i className='bx bxs-map login-input-icon' style={{ top: '16px' }}></i>
                                        <textarea 
                                            placeholder="Mahalle, Cadde, Sokak, İlçe/İl açık adresini girin" 
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            required
                                            rows="2"
                                            className="login-input"
                                            style={{ paddingLeft: '42px', resize: 'none', height: '60px', paddingTop: '10px' }}
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="login-form-group">
                            <label className="form-label">E-posta Adresi</label>
                            <div className="login-input-wrapper">
                                <i className='bx bxs-envelope login-input-icon'></i>
                                <input 
                                    type="email" 
                                    placeholder="ornek@mail.com" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="login-input"
                                />
                            </div>
                        </div>

                        <div className="login-form-group">
                            <label className="form-label">Şifre</label>
                            <div className="login-input-wrapper">
                                <i className='bx bxs-lock-alt login-input-icon'></i>
                                <input 
                                    type="password" 
                                    placeholder="••••••••" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="login-input"
                                />
                            </div>
                        </div>

                        <button type="submit" className="login-button">
                            <i className={isRegister ? 'bx bx-user-plus' : 'bx bx-log-in-circle'} style={{ fontSize: '18px' }}></i>
                            {isRegister ? 'Hesap Oluştur ve Katıl' : 'Giriş Yap'}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="login-footer-text">
                        {isRegister ? (
                            <span>Zaten hesabınız var mı? 
                                <button type="button" onClick={() => toggleMode(false)} className="login-footer-link">
                                    Giriş Yap
                                </button>
                            </span>
                        ) : (
                            <span>Mondi Home sistemine yeni misiniz? 
                                <button type="button" onClick={() => toggleMode(true)} className="login-footer-link">
                                    Hesap Oluştur
                                </button>
                            </span>
                        )}
                    </div>
                </div>
            </div>
            <SiteModal 
                open={modalOpen} 
                title={modalTitle} 
                message={modalMessage} 
                variant={modalVariant} 
                onClose={() => { 
                    setModalOpen(false); 
                    navigate('/products'); 
                }} 
            />
        </div>
    );
}