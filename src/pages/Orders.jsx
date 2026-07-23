import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { getCurrentUser } from '../services/auth';
import SiteModal from '../components/SiteModal';

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    const [modalOpen, setModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalMessage, setModalMessage] = useState('');
    const [modalVariant, setModalVariant] = useState('info');

    const user = getCurrentUser();
    const customerRole = localStorage.getItem('customerRole') || user?.role || 'ROLE_CUSTOMER';
    const isAdmin = customerRole === 'ROLE_ADMIN' || customerRole === 'admin';

    const getCustomerId = () => {
        const raw = user?.id || user?.userId || user?.customerId || user?.sub || null;
        if (raw != null && !isNaN(Number(raw))) return Number(raw);
        const localId = localStorage.getItem('customerId');
        if (localId) return Number(localId);
        return null;
    };

    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError('');
            let res;
            if (isAdmin) {
                // Admin fetches all orders in system
                res = await api.get('/api/orders');
            } else {
                // Customer fetches only their own orders
                const customerId = getCustomerId();
                if (customerId) {
                    res = await api.get(`/api/orders/customer/${customerId}`);
                } else {
                    res = { data: [] };
                }
            }
            setOrders(res.data || res || []);
        } catch (err) {
            console.error(err);
            setError('Siparişler yüklenirken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await api.put(`/api/orders/${orderId}/status?status=${newStatus}`);
            setModalTitle('Başarılı');
            setModalMessage('Sipariş durumu başarıyla güncellendi.');
            setModalVariant('success');
            setModalOpen(true);
            fetchOrders();
        } catch (err) {
            console.error(err);
            setModalTitle('Hata');
            setModalMessage('Durum güncellenirken hata oluştu.');
            setModalVariant('error');
            setModalOpen(true);
        }
    };

    const getStatusLabelAndColor = (status) => {
        switch (status) {
            case 'PENDING':
                return { label: 'Beklemede', color: '#d97706', bg: '#fef3c7' };
            case 'PREPARING':
                return { label: 'Hazırlanıyor', color: '#0284c7', bg: '#e0f2fe' };
            case 'SHIPPED':
                return { label: 'Yolda', color: '#4f46e5', bg: '#e0e7ff' };
            case 'DELIVERED':
                return { label: 'Teslim Edildi', color: '#16a34a', bg: '#dcfce7' };
            default:
                return { label: status, color: '#64748b', bg: '#f1f5f9' };
        }
    };

    const formatOrderDate = (dateString) => {
        if (!dateString) return '-';
        try {
            const date = new Date(dateString);
            return date.toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        } catch (e) {
            return dateString;
        }
    };

    const filteredOrders = orders.filter(o => {
        const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
        const matchesSearch = 
            String(o.id).includes(searchQuery) || 
            (o.customerName && o.customerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (o.productName && o.productName.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesStatus && matchesSearch;
    });

    const timelineSteps = ['PENDING', 'PREPARING', 'SHIPPED', 'DELIVERED'];
    const timelineLabels = {
        PENDING: 'Sipariş Alındı',
        PREPARING: 'Hazırlanıyor',
        SHIPPED: 'Yolda',
        DELIVERED: 'Teslim Edildi'
    };

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                <div>
                    <h2 className="serif-title" style={{ fontSize: '28px', color: 'var(--primary)', marginBottom: '6px' }}>Sipariş Durum Takibi</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                        {isAdmin 
                            ? 'Tüm mağazalardan ve müşterilerden gelen sipariş durumlarını takip edin ve güncelleyin.' 
                            : 'Mondi Home siparişlerinizin hazırlık ve kargo aşamalarını canlı izleyin.'}
                    </p>
                </div>
                <button className="btn btn-secondary" onClick={fetchOrders} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className='bx bx-refresh' style={{ fontSize: '20px' }}></i>
                    Yenile
                </button>
            </div>

            {error && (
                <div className="login-alert login-alert-error" style={{ marginBottom: '20px' }}>
                    <i className='bx bx-error-circle' style={{ fontSize: '18px' }}></i>
                    <span>{error}</span>
                </div>
            )}

            {/* Filters */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', flexWrap: 'wrap', marginBottom: '24px' }}>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {['ALL', 'PENDING', 'PREPARING', 'SHIPPED', 'DELIVERED'].map(status => {
                        const info = getStatusLabelAndColor(status);
                        const isSel = statusFilter === status;
                        return (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '20px',
                                    border: '1px solid var(--border-color)',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    backgroundColor: isSel ? 'var(--primary)' : 'white',
                                    color: isSel ? 'white' : 'var(--text-dark)',
                                    transition: 'var(--transition)'
                                }}
                            >
                                {status === 'ALL' ? 'Tüm Siparişler' : info.label}
                            </button>
                        );
                    })}
                </div>

                <div style={{ position: 'relative', width: '300px' }}>
                    <input 
                        type="text" 
                        placeholder="Sipariş No veya Müşteri Ara..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="form-control"
                        style={{ paddingLeft: '40px', paddingRight: '16px', height: '40px' }}
                    />
                    <i className='bx bx-search' style={{ position: 'absolute', left: '14px', top: '12px', fontSize: '18px', color: 'var(--text-muted)' }}></i>
                </div>
            </div>

            {/* List */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    <i className='bx bx-loader-alt bx-spin' style={{ fontSize: '32px', marginBottom: '10px' }}></i>
                    <div>Yükleniyor...</div>
                </div>
            ) : filteredOrders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: 'var(--radius-lg)', color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>
                    <i className='bx bx-purchase-tag' style={{ fontSize: '48px', color: '#cbd5e1', marginBottom: '16px' }}></i>
                    <div>Eşleşen sipariş kaydı bulunamadı.</div>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {filteredOrders.map((order) => {
                        const statusInfo = getStatusLabelAndColor(order.status);
                        const currentStepIndex = timelineSteps.indexOf(order.status);

                        return (
                            <div key={order.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px' }}>
                                {/* Order Summary Row */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <span style={{ fontSize: '18px', fontWeight: '800', color: 'var(--primary)' }}>
                                            Sipariş #{order.id}
                                        </span>
                                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                            <i className='bx bx-time-five' style={{ marginRight: '4px' }}></i>
                                            {formatOrderDate(order.orderDate)}
                                        </span>
                                    </div>

                                    <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '600' }}>Alıcı Müşteri</span>
                                            <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--primary)' }}>{order.customerName}</span>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '600' }}>Adres</span>
                                            <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-dark)', maxWidth: '200px', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }} title={order.deliveryAddress}>
                                                {order.deliveryAddress}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '600' }}>Toplam Tutar</span>
                                            <span style={{ fontSize: '16px', fontWeight: '800', color: 'var(--accent)' }}>{order.totalAmount} ₺</span>
                                        </div>
                                    </div>

                                    {isAdmin ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '600' }}>Durum Değiştir</span>
                                            <div style={{ position: 'relative', width: '160px' }}>
                                                <select 
                                                    value={order.status}
                                                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                    className="form-control"
                                                    style={{ padding: '8px 12px', height: '36px', fontSize: '13px', border: '1.5px solid var(--primary)', borderRadius: '8px', cursor: 'pointer', appearance: 'none' }}
                                                >
                                                    <option value="PENDING">Beklemede</option>
                                                    <option value="PREPARING">Hazırlanıyor</option>
                                                    <option value="SHIPPED">Yolda / Kargo</option>
                                                    <option value="DELIVERED">Teslim Edildi</option>
                                                </select>
                                                <i className='bx bx-chevron-down' style={{ position: 'absolute', right: '10px', top: '11px', pointerEvents: 'none' }}></i>
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                            <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '600' }}>Güncel Durum</span>
                                            <span style={{
                                                marginTop: '4px',
                                                backgroundColor: statusInfo.bg,
                                                color: statusInfo.color,
                                                fontSize: '13px',
                                                fontWeight: '700',
                                                padding: '6px 14px',
                                                borderRadius: '20px',
                                                textTransform: 'uppercase'
                                            }}>
                                                {statusInfo.label}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Order Visual Timeline Tracker */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', padding: '10px 0', marginTop: '10px', flexWrap: 'wrap', gap: '20px' }}>
                                    
                                    {/* Background connecting line */}
                                    <div style={{
                                        position: 'absolute',
                                        height: '4px',
                                        backgroundColor: '#e2e8f0',
                                        left: '50px',
                                        right: '50px',
                                        top: '28px',
                                        zIndex: 1,
                                        display: 'block'
                                    }}></div>

                                    {/* Active filled line progress */}
                                    <div style={{
                                        position: 'absolute',
                                        height: '4px',
                                        backgroundColor: 'var(--accent)',
                                        left: '50px',
                                        width: `${(currentStepIndex / (timelineSteps.length - 1)) * 100 * 0.85}%`,
                                        top: '28px',
                                        zIndex: 1,
                                        transition: 'width 0.4s ease',
                                        display: 'block'
                                    }}></div>

                                    {timelineSteps.map((step, idx) => {
                                        const isDone = idx <= currentStepIndex;
                                        const isCurrent = idx === currentStepIndex;
                                        
                                        let iconClass = 'bx bx-time';
                                        if (step === 'PENDING') iconClass = 'bx bx-receipt';
                                        if (step === 'PREPARING') iconClass = 'bx bx-package';
                                        if (step === 'SHIPPED') iconClass = 'bx bx-truck';
                                        if (step === 'DELIVERED') iconClass = 'bx bx-home-heart';

                                        return (
                                            <div key={step} style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                zIndex: 2,
                                                flex: 1,
                                                position: 'relative',
                                                minWidth: '90px'
                                            }}>
                                                {/* Icon Bubble */}
                                                <div style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    borderRadius: '50%',
                                                    backgroundColor: isDone ? (isCurrent ? 'var(--primary)' : 'var(--accent)') : '#ffffff',
                                                    border: isDone ? 'none' : '2.5px solid #cbd5e1',
                                                    color: isDone ? '#ffffff' : '#94a3b8',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '20px',
                                                    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                                                    transition: 'all 0.3s ease'
                                                }}>
                                                    {isDone && !isCurrent ? (
                                                        <i className='bx bx-check' style={{ fontSize: '24px', fontWeight: 'bold' }}></i>
                                                    ) : (
                                                        <i className={iconClass}></i>
                                                    )}
                                                </div>

                                                {/* Label */}
                                                <span style={{
                                                    fontSize: '13px',
                                                    fontWeight: isCurrent ? '700' : '600',
                                                    color: isCurrent ? 'var(--primary)' : (isDone ? 'var(--text-dark)' : 'var(--text-muted)'),
                                                    marginTop: '10px',
                                                    textAlign: 'center',
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    {timelineLabels[step]}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <SiteModal open={modalOpen} title={modalTitle} message={modalMessage} variant={modalVariant} onClose={() => setModalOpen(false)} />
        </div>
    );
}
