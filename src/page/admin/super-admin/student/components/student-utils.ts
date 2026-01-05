export const getInitials = (name: string): string => {
    if (!name?.trim()) return 'ST';
    const parts = name.trim().split(/\s+/);
    return parts
        .slice(0, 2)
        .map((p) => p[0] || '')
        .join('')
        .toUpperCase();
};
