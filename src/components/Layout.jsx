import React from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { getCurrentUser } from '../services/auth';

export default function Layout() {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    const user = getCurrentUser();
    const isAdmin = user && (user.role === 'admin' || (Array.isArray(user.roles) && user.roles.includes('admin')) || user.isAdmin);

    const adminMenu = [
        { path: '/products', label: 'Ürünler & Varyantlar', icon: '📦' },
        { path: '/categories', label: 'Kategoriler', icon: '🏷️' },
        { path: '/price-lists', label: 'Fiyat Listeleri', icon: '💰' },
        { path: '/stores', label: 'Mağazalar', icon: '🏬' },
        { path: '/orders', label: 'Sipariş Takibi', icon: '🚚' },
    ];

    const customerMenu = [
        { path: '/products', label: 'Ürünler & Varyantlar', icon: '📦' },
        { path: '/cart', label: 'Sepetim', icon: '🛒' },
        { path: '/orders', label: 'Sipariş Takibi', icon: '🚚' }
    ];

    const menuItems = isAdmin ? adminMenu : customerMenu;

    return (
        <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f8fafc', fontFamily: 'sans-serif' }}>
            {/* Sol Sidebar */}
            <div style={{ width: '260px', backgroundColor: '#0f172a', color: 'white', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '20px', fontSize: '18px', fontWeight: 'bold', borderBottom: '1px solid #1e293b', textAlign: 'center' }}>
                    Mondi Tracking
                </div>
                <div style={{ flex: 1, padding: '20px 10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '12px 15px',
                                    borderRadius: '8px',
                                    color: isActive ? 'white' : '#94a3b8',
                                    backgroundColor: isActive ? '#0284c7' : 'transparent',
                                    textDecoration: 'none',
                                    fontSize: '14px',
                                    fontWeight: isActive ? '600' : '400',
                                    transition: '0.2s'
                                }}
                            >
                                <span>{item.icon}</span>
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
                <div style={{ padding: '15px 20px', borderTop: '1px solid #1e293b' }}>
                    <button
                        onClick={handleLogout}
                        style={{
                            width: '100%',
                            padding: '10px',
                            backgroundColor: '#dc2626',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '13px'
                        }}
                    >
                        Çıkış Yap
                    </button>
                </div>
            </div>

            {/* Sağ İçerik Alanı */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <header style={{ height: '60px', backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 30px' }}>
                    <h3 style={{ margin: 0, color: '#1e293b', fontSize: '16px' }}>Yönetim ve Takip Paneli</h3>
                    <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>Aktif Oturum</div>
                </header>
                <main style={{ flex: 1, overflowY: 'auto', padding: '30px' }}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
}