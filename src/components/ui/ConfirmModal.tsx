'use client';

import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'primary' | 'warning';
    loading?: boolean;
}

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    variant = 'primary',
    loading = false,
}: ConfirmModalProps) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
            <div className="flex flex-col items-center text-center space-y-4">
                <div className={`p-3 rounded-full ${variant === 'danger' ? 'bg-red-50 text-red-500' :
                        variant === 'warning' ? 'bg-amber-50 text-amber-500' :
                            'bg-blue-50 text-blue-500'
                    }`}>
                    <AlertTriangle size={32} />
                </div>

                <p className="text-gray-600">
                    {message}
                </p>

                <div className="flex items-center gap-3 w-full pt-4">
                    <Button
                        variant="outline"
                        fullWidth
                        onClick={onClose}
                        disabled={loading}
                    >
                        {cancelLabel}
                    </Button>
                    <Button
                        variant={variant === 'danger' ? 'primary' : variant}
                        fullWidth
                        onClick={onConfirm}
                        loading={loading}
                        className={variant === 'danger' ? 'bg-red-600 hover:bg-red-700' : ''}
                    >
                        {confirmLabel}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
