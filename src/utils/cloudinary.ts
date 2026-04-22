/**
 * Extracts public_id from a Cloudinary URL.
 * Standard format: https://res.cloudinary.com/[cloud_name]/image/upload/v[version]/[folder]/[public_id].[ext]
 * Note: Folder and version are optional.
 */
export function extractPublicIdFromUrl(url: string | null | undefined): string | null {
    if (!url || typeof url !== 'string' || !url.includes('cloudinary.com')) {
        return null;
    }

    try {
        // Find the index of "upload/"
        const uploadIndex = url.indexOf('upload/');
        if (uploadIndex === -1) return null;

        // Path after "upload/"
        let path = url.substring(uploadIndex + 7);

        // Remove version component (e.g., "v1570977806/") if present
        if (path.startsWith('v')) {
            const firstSlash = path.indexOf('/');
            if (firstSlash !== -1) {
                path = path.substring(firstSlash + 1);
            }
        }

        // Remove file extension
        const lastDot = path.lastIndexOf('.');
        if (lastDot !== -1) {
            path = path.substring(0, lastDot);
        }

        return path;
    } catch {
        return null;
    }
}
