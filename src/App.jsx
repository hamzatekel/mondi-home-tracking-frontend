import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Layout from './components/Layout';
import Products from './pages/Product';
import RequireAuth from './components/RequireAuth';
import Cart from './pages/Cart';
import Categories from './pages/Categories';
import PriceLists from './pages/PriceLists';
import Orders from './pages/Orders';
import Stores from './pages/Stores';
import Profile from './pages/Profile';

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Giriş Sayfası */}
                <Route path="/" element={<Login />} />

                {/* Layout İçindeki Korumalı Rotalar */}
                <Route element={<RequireAuth><Layout /></RequireAuth>}>
                    <Route path="/products" element={<Products />} />
                    <Route path="/categories" element={<Categories />} />
                    <Route path="/price-lists" element={<PriceLists />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/stores" element={<Stores />} />
                    <Route path="/profile" element={<Profile />} />
                </Route>

                {/* Tanımsız yollarda login'e yönlendir */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}