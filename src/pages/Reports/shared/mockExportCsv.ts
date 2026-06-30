import { toast } from 'sonner';

type MockCsvExportOptions = {
    filename: string;
    headers: string;
    rows: string;
    loadingMessage: string;
    successMessage: string;
};

/** Triggers a client-side CSV download for mock export flows */
export function downloadMockCsv({
    filename,
    headers,
    rows,
    loadingMessage,
    successMessage,
}: MockCsvExportOptions) {
    toast.loading(loadingMessage);
    window.setTimeout(() => {
        toast.dismiss();
        toast.success(successMessage);
        const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', filename.replace(/\.xlsx$/i, '.csv'));
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, 600);
}
