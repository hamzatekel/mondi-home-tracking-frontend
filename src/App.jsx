import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Layout from './components/Layout';
import Products from './pages/Product';
import RequireAuth from './components/RequireAuth';
import Cart from './pages/Cart';

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Giriş Sayfası */}
                <Route path="/" element={<Login />} />

                {/* Layout İçindeki Korumalı Rotalar */}
                <Route element={<RequireAuth><Layout /></RequireAuth>}>
                    <Route path="/products" element={<Products />} />
                    <Route path="/categories" element={<div>🏷️ Kategoriler Ekranı (Hazırlanıyor)</div>} />
                    <Route path="/price-lists" element={<div>💰 Fiyat Listeleri Ekranı (Hazırlanıyor)</div>} />
                    <Route path="/orders" element={<div>🚚 Sipariş Takip Ekranı (Hazırlanıyor)</div>} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/stores" element={<div>🏬 Mağazalar Ekranı (Hazırlanıyor)</div>} />
                </Route>

                {/* Tanımsız yollarda login'e yönlendir */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}