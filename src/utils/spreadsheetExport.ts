import type { AxiosResponse } from 'axios';
import {
    getContentDispositionHeader,
    parseContentDispositionFilename,
    sanitizeDownloadFilename,
} from './contentDisposition';

const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

async function blobLooksLikeJsonError(blob: Blob): Promise<string | null> {
    if (blob.size === 0) return 'Empty response';
    const head = await blob.slice(0, 1).text();
    if (head !== '{') return null;
    try {
        const j = JSON.parse(await blob.text()) as { message?: string };
        return j.message ?? 'Export failed';
    } catch {
        return 'Invalid response';
    }
}

function normalizeSpreadsheetBlob(blob: Blob): Blob {
    if (
        blob.type === XLSX_MIME ||
        blob.type === 'application/octet-stream' ||
        blob.type === ''
    ) {
        return blob;
    }
    return new Blob([blob], { type: XLSX_MIME });
}

function resolveExportFilename(suggestedFromHeader: string | null | undefined, fallback: string): string {
    let rawName = suggestedFromHeader?.trim() || fallback;
    if (!/\.xlsx$/i.test(rawName)) {
        rawName = `${rawName.replace(/\.+$/, '')}.xlsx`;
    }
    return sanitizeDownloadFilename(rawName);
}

export type SpreadsheetDownloadPrepared =
    | { ok: true; blob: Blob; filename: string }
    | { ok: false; error: string };

/** Validate export blob, normalize .xlsx MIME, filename from Content-Disposition or fallback. */
export async function prepareSpreadsheetDownload(
    response: AxiosResponse<Blob>,
    fallbackFilename: string
): Promise<SpreadsheetDownloadPrepared> {
    const blob = response.data;
    if (!(blob instanceof Blob)) {
        return { ok: false, error: 'Invalid response' };
    }

    const jsonErr = await blobLooksLikeJsonError(blob);
    if (jsonErr) {
        return { ok: false, error: jsonErr };
    }

    const file = normalizeSpreadsheetBlob(blob);
    const cd = getContentDispositionHeader(response.headers as Record<string, unknown>);
    const fromHeader = parseContentDispositionFilename(cd);
    const filename = resolveExportFilename(fromHeader, fallbackFilename);

    return { ok: true, blob: file, filename };
}

export function downloadBlobFile(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}
