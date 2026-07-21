import React from 'react';
import { Navigate } from 'react-router-dom';
import { getCurrentUser } from '../services/auth';

export default function RequireAuth({ children, requiredRole }) {
    const user = getCurrentUser();
    if (!user) return <Navigate to="/" replace />;

    if (requiredRole) {
        const roles = user.role ? [user.role] : (user.roles || []);
        const hasRole = roles.includes(requiredRole) || user.isAdmin;
        if (!hasRole) return <Navigate to="/" replace />;
    }

    return children;
}
