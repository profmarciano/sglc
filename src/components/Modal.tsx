'use client';

import { ReactNode } from 'react';

interface ModalProps {
    isOpen: boolean;
    title: string;
    description?: string;
    onClose: () => void;
    children: ReactNode;
    actions?: ReactNode;
}

export function Modal({ isOpen, title, description, onClose, children, actions }: ModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">{title}</h3>
                        {description && <p className="text-sm text-slate-600">{description}</p>}
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-slate-400 transition hover:text-slate-600"
                        aria-label="Fechar modal"
                    >
                        ✕
                    </button>
                </div>

                <div className="mb-4">{children}</div>

                <div className="flex justify-end gap-2">{actions}</div>
            </div>
        </div>
    );
}
