import { message } from 'antd';

export const getInitials = (name: string): string => {
    return name
        ? name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
        : 'TC';
};

export const toDisplay = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    try {
        return JSON.stringify(value);
    } catch {
        return String(value);
    }
};

export const copyToClipboard = async (value: unknown) => {
    const text = toDisplay(value);
    try {
        await navigator.clipboard.writeText(text);
        message.success('Copied');
    } catch {
        message.error('Copy failed');
    }
};

export const formatDateTime = (value: unknown): string => {
    const raw = toDisplay(value);
    if (!raw) return '';
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return raw;
    return d.toLocaleString();
};

export const formatNumber = (value: unknown): string => {
    if (value === null || value === undefined || value === '') return '';
    const n = typeof value === 'number' ? value : Number(value);
    if (Number.isNaN(n)) return toDisplay(value);
    return new Intl.NumberFormat().format(n);
};
