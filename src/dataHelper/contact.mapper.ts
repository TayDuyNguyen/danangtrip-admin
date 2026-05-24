import { toNumberSafe, toArraySafe } from "./dashboard.mapper";
import type { 
    RawContactItem, 
    RawContactListResponse, 
    ContactItem, 
    ContactListResponse, 
    ContactStatus 
} from "./contact.dataHelper";

/**
 * Mappers: Raw Backend Contact Data -> UI View Models
 */

export const mapContactItem = (raw: RawContactItem): ContactItem => {
    return {
        id: raw.id,
        name: raw.name || "N/A",
        email: raw.email || "N/A",
        phone: raw.phone || undefined,
        subject: raw.subject || "N/A",
        message: raw.message || "N/A",
        status: (['new', 'read', 'replied'].includes(raw.status) ? raw.status : 'new') as ContactStatus,
        repliedBy: raw.replied_by || undefined,
        repliedAt: raw.replied_at || undefined,
        reply: raw.reply || undefined,
        replierName: raw.replier?.full_name || undefined,
        replierUsername: raw.replier?.username || undefined,
        createdAt: raw.created_at,
        updatedAt: raw.updated_at,
    };
};

export const mapContactList = (raw: RawContactListResponse | unknown): ContactListResponse => {
    const rawCast = raw as RawContactListResponse;
    const items = toArraySafe<RawContactItem>(rawCast?.data || raw);

    return {
        data: items.map(mapContactItem),
        meta: {
            current_page: toNumberSafe(rawCast?.current_page, 1),
            last_page: toNumberSafe(rawCast?.last_page, 1),
            per_page: toNumberSafe(rawCast?.per_page, 10),
            total: toNumberSafe(rawCast?.total, items.length),
        },
        stats: {
            total: toNumberSafe(rawCast?.stats?.total, toNumberSafe(rawCast?.total, items.length)),
            new: toNumberSafe(rawCast?.stats?.new, items.filter((item) => item.status === "new").length),
            read: toNumberSafe(rawCast?.stats?.read, items.filter((item) => item.status === "read").length),
            replied: toNumberSafe(rawCast?.stats?.replied, items.filter((item) => item.status === "replied").length),
        },
    };
};
