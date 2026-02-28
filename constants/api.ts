const BASE_URL = "http://localhost:8000";

export async function fetchAPI(path: string, options?: RequestInit) {
    const res = await fetch(BASE_URL + path, {
        headers: { "Content-Type": "application/json" },
        ...options,
    });
    if (!res.ok) throw new Error(await res.text());
    const text = await res.text();
    if (!text) return null;
    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
}

export default BASE_URL;

// ─── Shared types ────────────────────────────────────────────────────────────

export interface InboxItem {
    id: string;
    type: string;         // text | url | code | image
    rawContent: string;
    source: string;
    status: string;       // pending | processed | discarded
    createdAt: string;
}

export interface Note {
    id: string;
    inboxItemId: string | null;
    title: string;
    summary: string;
    content: string;      // markdown
    category: string;     // study | tech | idea | task | reference
    tags: string;         // JSON array string
    createdAt: string;
}

export type ListMode = "pending" | "knowledge";

export function parseTags(tagsStr: string): string[] {
    try {
        const parsed = JSON.parse(tagsStr);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

export function formatDate(iso: string): string {
    try {
        const d = new Date(iso);
        return d
            .toLocaleDateString("en-GB", { day: "2-digit", month: "short" })
            .toUpperCase();
    } catch {
        return "—";
    }
}
