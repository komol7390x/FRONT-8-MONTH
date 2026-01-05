import React from 'react';
import { AlertTriangle, Ban, CheckCircle2, Trash2, Unlock } from 'lucide-react';

type ConfirmVariant = 'delete' | 'restore' | 'block' | 'unblock' | 'hard_delete';

interface VariantStyle {
    icon: React.ReactNode;
    panel: string;
    title: string;
    button: string;
}

const getVariantStyle = (variant: ConfirmVariant): VariantStyle => {
    switch (variant) {
        case 'restore':
            return {
                icon: <CheckCircle2 size={18} className="text-green-700" />,
                panel: 'border-green-200 bg-green-50',
                title: 'text-green-800',
                button: 'bg-green-700 hover:bg-green-800 disabled:bg-green-300',
            };
        case 'unblock':
            return {
                icon: <Unlock size={18} className="text-green-700" />,
                panel: 'border-green-200 bg-green-50',
                title: 'text-green-800',
                button: 'bg-green-700 hover:bg-green-800 disabled:bg-green-300',
            };
        case 'block':
            return {
                icon: <Ban size={18} className="text-red-700" />,
                panel: 'border-red-200 bg-red-50',
                title: 'text-red-800',
                button: 'bg-red-700 hover:bg-red-800 disabled:bg-red-300',
            };
        case 'hard_delete':
            return {
                icon: <AlertTriangle size={18} className="text-red-800" />,
                panel: 'border-red-300 bg-red-50',
                title: 'text-red-900',
                button: 'bg-red-900 hover:bg-black disabled:bg-red-300',
            };
        case 'delete':
        default:
            return {
                icon: <Trash2 size={18} className="text-red-700" />,
                panel: 'border-red-200 bg-red-50',
                title: 'text-red-800',
                button: 'bg-red-700 hover:bg-red-800 disabled:bg-red-300',
            };
    }
};

interface ConfirmModalProps {
    open: boolean;
    title: string;
    message: string;
    subject?: React.ReactNode;
    note?: string;
    variant: ConfirmVariant;
    confirmText?: string;
    cancelText?: string;
    loading?: boolean;
    onCancel: () => void;
    onConfirm: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    open,
    title,
    message,
    subject,
    note,
    variant,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    loading = false,
    onCancel,
    onConfirm,
}) => {
    const s = getVariantStyle(variant);

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-gray-300/70 bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onCancel}>
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                    <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition-colors" type="button">
                        ✕
                    </button>
                </div>

                <div className="space-y-4">
                    {subject}

                    <div className={`p-4 border rounded-lg ${s.panel}`}>
                        <div className="flex items-start gap-2">
                            <div className="mt-0.5">{s.icon}</div>
                            <div className="min-w-0">
                                <p className={`text-sm font-semibold ${s.title}`}>{message}</p>
                                {note && <p className="text-xs text-gray-700 mt-1">{note}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={loading}
                            className="flex-1 px-4 py-2.5 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                        >
                            {cancelText}
                        </button>
                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={loading}
                            className={`flex-1 px-4 py-2.5 text-white rounded text-sm font-medium transition-colors ${s.button}`}
                        >
                            {loading ? 'Processing...' : confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
