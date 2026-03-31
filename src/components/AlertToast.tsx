'use client';

import { useEffect, useState } from 'react';

type AlertVariant = 'success' | 'error' | 'info';

interface AlertToastProps {
    message: string;
    variant?: AlertVariant;
    onClose: () => void;
}

const variantStyles: Record<AlertVariant, string> = {
    success: 'border-emerald-300 bg-emerald-50 text-emerald-800',
    error: 'border-red-300 bg-red-50 text-red-800',
    info: 'border-blue-300 bg-blue-50 text-blue-800',
};

export function AlertToast({ message, variant = 'info', onClose }: AlertToastProps) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (!message) return;
        setVisible(true);

        return () => setVisible(false);
    }, [message]);

    if (!message) return null;

    return (
        <div
            className={`fixed top-5 right-5 z-50 rounded-lg border px-4 py-3 text-sm shadow-lg ${variantStyles[variant]} transition-all duration-300 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
                }`}
            style={{ pointerEvents: 'auto' }}
        >
            <div className="flex items-center justify-between gap-4">
                <span>{message}</span>
                <button onClick={onClose} className="font-semibold hover:opacity-80" aria-label="Fechar alerta">
                    ✕
                </button>
            </div>
        </div>
    );
}

