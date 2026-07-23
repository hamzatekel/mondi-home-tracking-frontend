import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { getCurrentUser } from '../services/auth';
import api from '../services/api';

export default function Layout() {
    const navigate = useNavigate();
    const location = useLocation();
    const [cartCount, setCartCount] = useState(0);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('customerId');
        localStorage.removeItem('customerName');
        localStorage.removeItem('customerRole');
        navigate('/');
    };

    const user = getCurrentUser();
    const customerName = localStorage.getItem('customerName') || user?.sub?.split('@')[0] || 'Kullanıcı';
    const customerRole = localStorage.getItem('customerRole') || user?.role || 'ROLE_CUSTOMER';
    const isAdmin = customerRole === 'ROLE_ADMIN' || customerRole === 'admin';

    const getCustomerId = () => {
        const raw = user?.id || user?.userId || user?.customerId || user?.sub || null;
        if (raw != null && !isNaN(Number(raw))) return Number(raw);
        const localId = localStorage.getItem('customerId');
        if (localId) return Number(localId);
        return null;
    };

    // Update cart count badge periodically or on load
    useEffect(() => {
        const fetchCartCount = async () => {
            const customerId = getCustomerId();
            if (!customerId) return;
            try {
                const res = await api.get(`/api/carts/customer/${customerId}`);
                if (res.data && res.data.items) {
                    const totalQty = res.data.items.reduce((acc, it) => acc + (it.quantity || 0), 0);
                    setCartCount(totalQty);
                }
            } catch (e) {
                // fall back to local storage count
                const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
                const totalQty = localCart.reduce((acc, it) => acc + (it.qty || 0), 0);
                setCartCount(totalQty);
            }
        };

        fetchCartCount();
        
        // Listen to storage changes
        const handleStorage = () => {
            const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
            const totalQty = localCart.reduce((acc, it) => acc + (it.qty || 0), 0);
            setCartCount(totalQty);
        };
        window.addEventListener('storage', handleStorage);
        const interval = setInterval(fetchCartCount, 5000); // Poll every 5s

        return () => {
            window.removeEventListener('storage', handleStorage);
            clearInterval(interval);
        };
    }, [user, location.pathname]);

    const adminMenu = [
        { path: '/products', label: 'Ürünler & Varyantlar', iconClass: 'bx bx-package' },
        { path: '/categories', label: 'Kategoriler', iconClass: 'bx bx-purchase-tag' },
        { path: '/price-lists', label: 'Fiyat Listeleri', iconClass: 'bx bx-dollar-circle' },
        { path: '/stores', label: 'Mağazalar', iconClass: 'bx bx-store' },
        { path: '/orders', label: 'Sipariş Takibi', iconClass: 'bx bx-truck' },
        { path: '/profile', label: 'Profilim', iconClass: 'bx bx-user' },
    ];

    const customerMenu = [
        { path: '/products', label: 'Ürünler & Varyantlar', iconClass: 'bx bx-package' },
        { path: '/cart', label: 'Sepetim', iconClass: 'bx bx-cart', showBadge: true },
        { path: '/orders', label: 'Sipariş Takibi', iconClass: 'bx bx-truck' },
        { path: '/profile', label: 'Profilim', iconClass: 'bx bx-user' },
    ];

    const menuItems = isAdmin ? adminMenu : customerMenu;

    return (
        <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f1f5f9', fontFamily: "'Outfit', sans-serif", overflow: 'hidden' }}>
            {/* Sol Sidebar */}
            <div style={{ width: '280px', backgroundColor: '#0a1b2d', color: '#f8fafc', display: 'flex', flexDirection: 'column', boxShadow: '4px 0 20px rgba(0,0,0,0.1)', zIndex: 10 }}>
                {/* Logo & Header */}
                <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <i className='bx bx-home-alt' style={{ fontSize: '24px', color: 'var(--accent)' }}></i>
                        <span style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '0.5px', color: '#ffffff' }}>MONDI <span style={{ color: 'var(--accent)' }}>HOME</span></span>
                    </div>
                    <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#dfb26b', fontWeight: '600', letterSpacing: '2px' }}>Smart Store Portal</span>
                </div>

                {/* Navigation Menu */}
                <div style={{ flex: 1, padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '12px 16px',
                                    borderRadius: '10px',
                                    color: isActive ? '#ffffff' : '#94a3b8',
                                    backgroundColor: isActive ? 'var(--accent)' : 'transparent',
                                    textDecoration: 'none',
                                    fontSize: '14px',
                                    fontWeight: isActive ? '600' : '500',
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <i className={item.iconClass} style={{ fontSize: '18px', color: isActive ? '#ffffff' : '#64748b' }}></i>
                                    <span>{item.label}</span>
                                </div>
                                {item.showBadge && cartCount > 0 && (
                                    <span style={{
                                        backgroundColor: isActive ? 'white' : 'var(--accent)',
                                        color: isActive ? 'var(--accent)' : 'white',
                                        fontSize: '11px',
                                        fontWeight: '700',
                                        padding: '2px 8px',
                                        borderRadius: '12px',
                                        minWidth: '20px',
                                        textAlign: 'center'
                                    }}>
                                        {cartCount}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </div>

                {/* User Info & Logout */}
                <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.06)', backgroundColor: 'rgba(0,0,0,0.15)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(255,255,255,0.05)',
                            border: '1.5px solid var(--gold)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--gold)',
                            fontWeight: '700',
                            fontSize: '16px'
                        }}>
                            {customerName.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                            <span style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{customerName}</span>
                            <span style={{ fontSize: '11px', color: isAdmin ? 'var(--gold)' : 'var(--accent)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px' }}>
                                {isAdmin ? 'Yönetici' : 'Müşteri'}
                            </span>
                        </div>
                    </div>
                    
                    <button
                        onClick={handleLogout}
                        style={{
                            width: '100%',
                            padding: '11px',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            color: '#f87171',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '13px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#ef4444';
                            e.currentTarget.style.color = '#ffffff';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                            e.currentTarget.style.color = '#f87171';
                        }}
                    >
                        <i className='bx bx-log-out-circle' style={{ fontSize: '16px' }}></i>
                        Oturumu Kapat
                    </button>
                </div>
            </div>

            {/* Sağ İçerik Alanı */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <header style={{
                    height: '70px',
                    backgroundColor: 'white',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 30px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                    zIndex: 9
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: '500' }}>Panel</span>
                        <i className='bx bx-chevron-right' style={{ color: 'var(--text-muted)' }}></i>
                        <span style={{ fontSize: '14px', color: 'var(--primary)', fontWeight: '600', textTransform: 'capitalize' }}>
                            {location.pathname.substring(1).replace('-', ' ')}
                        </span>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        {/* Live Status Badge */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#10b981', fontWeight: '600', backgroundColor: '#ecfdf5', padding: '6px 12px', borderRadius: '20px' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block', animation: 'pulse-soft 2s infinite' }}></span>
                            Sistem Çevrimiçi
                        </div>
                    </div>
                </header>

                <main style={{ flex: 1, overflowY: 'auto', padding: '30px', animation: 'fadeIn 0.3s ease-out' }}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
}