import i18next from 'i18next';

interface ApiErrorPayload {
    code?: number;
    message?: string;
    user_message?: string;
    error_key?: string;
    errors?: Record<string, string[] | string | undefined>;
}

const ERROR_KEY_MAP: Record<string, string> = {
    'validation.failed': 'validation_failed',
    'auth.invalid_credentials': 'auth_invalid_credentials',
    'auth.session_expired': 'auth_session_expired',
    'auth.unauthenticated': 'auth_unauthenticated',
    'auth.forbidden': 'auth_forbidden',
    'resource.not_found': 'resource_not_found',
    'request.method_not_allowed': 'request_method_not_allowed',
    'request.throttled': 'request_throttled',
    'request.already_processed': 'request_already_processed',
    'request.conflict': 'request_conflict',
    'request.invalid_state': 'request_invalid_state',
    'request.bad_request': 'request_bad_request',
    'request.unknown': 'request_unknown',
    'server.error': 'server_error',
};

const MESSAGE_KEY_MAP: Record<string, string> = {
    'Category not found': 'category_not_found',
    'Cannot delete category because it has subcategories': 'category_has_subcategories',
    'Cannot delete category because it has locations': 'category_has_locations',
    'Cannot delete category with associated tours': 'category_has_tours',
    'Tour not found': 'tour_not_found',
    'Tour schedule not found': 'schedule_not_found',
    'Schedule not found': 'schedule_not_found',
    'Cannot delete schedule with existing bookings': 'schedule_has_bookings',
    'Location not found': 'location_not_found',
    'User not found': 'user_not_found',
    'You cannot change your own status.': 'user_cannot_change_own_status',
    'You cannot change your own role.': 'user_cannot_change_own_role',
    'You cannot change your own role or status.': 'user_cannot_change_own_role_or_status',
    'You cannot delete your own account.': 'user_cannot_delete_own_account',
    'Booking not found.': 'booking_not_found',
    'Booking not found': 'booking_not_found',
    'This booking has already been paid': 'booking_already_paid',
    'Booking is already cancelled or completed.': 'booking_already_cancelled_or_completed',
    'Payment not found': 'payment_not_found',
    'Payment record not found': 'payment_not_found',
    'Payment already processed': 'payment_already_processed',
    'Email is already verified.': 'email_already_verified',
    'This item is already in your favorites.': 'favorite_already_exists',
    'Favorite record not found.': 'favorite_not_found',
    'Rating not found': 'rating_not_found',
    'Contact not found.': 'contact_not_found',
    'This contact has already been replied to.': 'contact_already_replied',
    'Blog post not found.': 'blog_not_found',
    'Blog category not found.': 'blog_category_not_found',
    'Tag not found.': 'tag_not_found',
    'Amenity not found.': 'amenity_not_found',
    'Subcategory not found': 'subcategory_not_found',
    'Notification not found or you do not have permission to access it.': 'notification_not_found',
    'Notification not found or you do not have permission to delete it.': 'notification_not_found',
    'Tour category not found': 'category_not_found',
    'One or more categories were not found': 'categories_not_found',
    'User not found.': 'user_not_found',
};

function translateByErrorKey(errorKey?: string): string | undefined {
    if (!errorKey) return undefined;

    const translationKey = ERROR_KEY_MAP[errorKey];
    if (!translationKey) return undefined;

    const fullKey = `translation:api_errors.${translationKey}`;
    const translated = i18next.t(fullKey);
    return translated !== fullKey ? translated : undefined;
}

function translateByMessage(message?: string): string | undefined {
    if (!message) return undefined;

    const trimmed = message.trim();
    const translationKey = MESSAGE_KEY_MAP[trimmed];
    if (!translationKey) return undefined;

    const fullKey = `translation:api_errors.${translationKey}`;
    const translated = i18next.t(fullKey);
    return translated !== fullKey ? translated : undefined;
}

function normalizeBilingualMessage(message: string): string {
    const trimmedMessage = message.trim();
    const bilingualMatch = trimmedMessage.match(/^(.*?)\s*\((.*?)\)\s*$/);

    if (!bilingualMatch) {
        return trimmedMessage;
    }

    const [, englishMessage, vietnameseMessage] = bilingualMatch;
    const currentLanguage = i18next.language?.toLowerCase().startsWith('vi') ? 'vi' : 'en';

    return currentLanguage === 'vi'
        ? vietnameseMessage.trim()
        : englishMessage.trim();
}

function getFirstValidationError(payload?: ApiErrorPayload): string | undefined {
    if (!payload?.errors) {
        return undefined;
    }

    for (const value of Object.values(payload.errors)) {
        if (Array.isArray(value) && value.length > 0 && value[0]) {
            return normalizeBilingualMessage(value[0]);
        }

        if (typeof value === 'string' && value.trim()) {
            return normalizeBilingualMessage(value);
        }
    }

    return undefined;
}

export function getLocalizedApiErrorMessage(fallback: string, error?: unknown): string {
    const payload = (error as { response?: { data?: ApiErrorPayload } })?.response?.data;
    const validationError = getFirstValidationError(payload);

    if (validationError) {
        return validationError;
    }

    const byErrorKey = translateByErrorKey(payload?.error_key);
    if (byErrorKey) return byErrorKey;

    const byMessage = translateByMessage(payload?.message) || translateByMessage(payload?.user_message);
    if (byMessage) return byMessage;

    const userMessage = payload?.user_message?.trim();
    if (userMessage) {
        return normalizeBilingualMessage(userMessage);
    }

    const apiMessage = payload?.message?.trim();
    if (apiMessage) {
        return normalizeBilingualMessage(apiMessage);
    }

    return fallback;
}
