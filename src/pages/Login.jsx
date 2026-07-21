import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/images.jpg';
import './Login.css';
import SiteModal from '../components/SiteModal';

export default function Login() {
    const [isRegister, setIsRegister] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [address, setAddress] = useState('');
    
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

        // Backend Role enum yapısına ('ROLE_CUSTOMER') tam uyumlu payload
        const payload = isRegister 
            ? { 
                name, 
                email, 
                password, 
                role: 'ROLE_CUSTOMER', 
                phoneNumber, 
                address 
              }
            : { 
                email, 
                password 
              };

        try {
            const response = await api.post(endpoint, payload);

            if (isRegister) {
                setSuccessMessage('Kayıt başarılı! Şimdi giriş yapabilirsiniz.');
                setIsRegister(false);
                setPassword('');
                } else {
                localStorage.setItem('token', response.data.token || response.data);
                setModalTitle('Giriş Başarılı');
                setModalMessage('Hoşgeldiniz! Oturum açıldı.');
                setModalVariant('success');
                setModalOpen(true);
            }
        } catch (err) {
            console.error(err);
            setError(isRegister ? 'Kayıt olurken bir hata oluştu.' : 'E-posta veya şifre hatalı.');
        }
    };

    return (
        <div className="login-page" style={{
            minHeight: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#f1f5f9',
            padding: '20px 0'
        }}>
            <div className="login-card" style={{
                background: 'white',
                padding: '30px 40px',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
                width: '100%',
                maxWidth: '450px',
                textAlign: 'center'
            }}>
                <div style={{ marginBottom: '20px' }}>
                    <img className="login-logo" src={logo} alt="Mondi logo" style={{ width: '100px', objectFit: 'contain', marginBottom: '8px' }} />
                    <h2 className="login-title" style={{ color: '#0f172a', margin: '0 0 5px 0', fontSize: '20px' }}>
                        {isRegister ? 'Mondi Tracking - Kayıt Ol' : 'Mondi Tracking - Giriş'}
                    </h2>
                    <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>
                        {isRegister ? 'Sipariş takibi için bilgilerinizi girin' : 'Lütfen giriş yapın'}
                    </p>
                </div>

                {error && (
                    <div style={{
                        backgroundColor: '#fef2f2',
                        color: '#dc2626',
                        padding: '10px',
                        borderRadius: '6px',
                        fontSize: '13px',
                        marginBottom: '15px',
                        border: '1px solid #fecaca'
                    }}>
                        {error}
                    </div>
                )}

                {successMessage && (
                    <div style={{
                        backgroundColor: '#f0fdf4',
                        color: '#16a34a',
                        padding: '10px',
                        borderRadius: '6px',
                        fontSize: '13px',
                        marginBottom: '15px',
                        border: '1px solid #bbf7d0'
                    }}>
                        {successMessage}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
                    {isRegister && (
                        <>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>Ad Soyad</label>
                                <input 
                                    type="text" 
                                    placeholder="Adınızı ve soyadınızı girin" 
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>Telefon</label>
                                    <input 
                                        type="text" 
                                        placeholder="05XXXXXXXXX" 
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        required
                                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>Teslimat Adresi</label>
                                <textarea 
                                    placeholder="Mahalle, Cadde, Sokak, No, İlçe/İl" 
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    required
                                    rows="2"
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box', resize: 'none' }}
                                />
                            </div>
                        </>
                    )}

                    <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>E-posta Adresi</label>
                        <input 
                            type="email" 
                            placeholder="ornek@mail.com" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>Şifre</label>
                        <input 
                            type="password" 
                            placeholder="••••••••" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                        />
                    </div>

                    <button 
                        type="submit" 
                        style={{
                            marginTop: '8px',
                            padding: '11px',
                            background: '#0284c7',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        {isRegister ? 'Kayıt Ol ve Adres Kaydet' : 'Giriş Yap'}
                    </button>
                </form>

                <div style={{ marginTop: '15px', fontSize: '13px', color: '#64748b' }}>
                    {isRegister ? (
                        <span>Zaten hesabınız var mı? <button onClick={() => setIsRegister(file => !file)} style={{ background: 'none', border: 'none', color: '#0284c7', cursor: 'pointer', fontWeight: '600', padding: 0 }}>Giriş Yap</button></span>
                    ) : (
                        <span>Hesabınız yok mu? <button onClick={() => setIsRegister(true)} style={{ background: 'none', border: 'none', color: '#0284c7', cursor: 'pointer', fontWeight: '600', padding: 0 }}>Kayıt Ol</button></span>
                    )}
                </div>
            </div>
            <SiteModal open={modalOpen} title={modalTitle} message={modalMessage} variant={modalVariant} onClose={() => { setModalOpen(false); navigate('/products'); }} />
        </div>
    );
}