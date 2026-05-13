const LEGACY_ICON_ALIASES: Record<string, string> = {
    'international-dining': 'UtensilsCrossed',
    'local-dining': 'UtensilsCrossed',
    'restaurant': 'UtensilsCrossed',
    'restaurant-menu': 'UtensilsCrossed',
    'local-cafe': 'Coffee',
    'cafe': 'Coffee',
    'coffee-shop': 'Coffee',
    'local-bar': 'Wine',
    'bar': 'Wine',
    'nightlife': 'Wine',
    'hotel': 'Hotel',
    'hotel-class': 'Hotel',
    'villa': 'House',
    'home': 'House',
    'museum': 'Landmark',
    'account_balance': 'Landmark',
    'temple-buddhist': 'Landmark',
    'park': 'Trees',
    'forest': 'Trees',
    'beach-access': 'Waves',
    'waves': 'Waves',
    'mountain': 'Mountain',
    'terrain': 'Mountain',
    'map': 'Map',
    'map-pinned': 'MapPinned',
    'place': 'MapPinned',
    'location-on': 'MapPinned',
    'camera-alt': 'Camera',
    'photo-camera': 'Camera',
    'attractions': 'Camera',
    'directions-bus': 'Bus',
    'bus': 'Bus',
    'directions-boat': 'Ship',
    'sailing': 'Ship',
    'shopping-bag': 'ShoppingBag',
    'shopping-cart': 'ShoppingBag',
    'music-note': 'Music',
    'festival': 'Music',
};

const toTokenKey = (value: string) =>
    value
        .trim()
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
        .replace(/[_\s]+/g, '-')
        .replace(/[^a-zA-Z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .toLowerCase();

const toPascalCase = (value: string) =>
    toTokenKey(value)
        .split('-')
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');

export const resolveCategoryIconName = (rawValue: string | null | undefined, fallback = 'Map') => {
    const value = String(rawValue || '').trim();

    if (!value) {
        return fallback;
    }

    const aliasMatch = LEGACY_ICON_ALIASES[toTokenKey(value)];
    if (aliasMatch) {
        return aliasMatch;
    }

    const pascalCaseName = toPascalCase(value);
    return pascalCaseName || fallback;
};
