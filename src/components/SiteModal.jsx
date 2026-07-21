import React from 'react';
import './SiteModal.css';

export default function SiteModal({ open, title, message, onClose, variant = 'info' }) {
    if (!open) return null;

    return (
        <div className="site-modal-backdrop" onClick={onClose}>
            <div className={`site-modal-card ${variant}`} onClick={(e) => e.stopPropagation()}>
                <div className="site-modal-header">
                    <h3>{title}</h3>
                </div>
                <div className="site-modal-body">{message}</div>
                <div className="site-modal-footer">
                    <button className="site-modal-button" onClick={onClose}>Tamam</button>
                </div>
            </div>
        </div>
    );
}
