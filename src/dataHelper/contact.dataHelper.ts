export type ContactStatus = 'new' | 'read' | 'replied';

export interface RawContactItem {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    subject: string;
    message: string;
    status: ContactStatus;
    replied_by: number | null;
    replied_at: string | null;
    reply: string | null;
    created_at: string;
    updated_at: string;
    replier?: {
        id: number;
        full_name: string;
        username: string;
    } | null;
}

export interface RawContactListResponse {
    data: RawContactItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    stats?: RawContactStats;
}

export interface RawContactStats {
    total?: number;
    new?: number;
    read?: number;
    replied?: number;
}

export interface ContactItem {
    id: number;
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
    status: ContactStatus;
    repliedBy?: number;
    repliedAt?: string;
    reply?: string;
    replierName?: string;
    replierUsername?: string;
    createdAt: string;
    updatedAt: string;
}

export interface ContactListResponse {
    data: ContactItem[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    stats: {
        total: number;
        new: number;
        read: number;
        replied: number;
    };
}

export interface ContactListFilters {
    q?: string;
    status?: string;
    page?: number;
    per_page?: number;
}
