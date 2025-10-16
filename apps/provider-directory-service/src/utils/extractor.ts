export const DOMAIN = 'res.cloudinary.com';

/**
 * Extract public ID from Cloudinary URL
 */
export function extractPublicIdFromUrl(url: string): string | null {
  try {
    if (!url.includes(DOMAIN)) return null;

    const patterns = [
      /\/v\d+\/(.+)\.(jpg|jpeg|png|gif|webp)$/i,
      /\/([^/]+)\.(jpg|jpeg|png|gif|webp)$/i,
      /\/v\d+\/[^/]*\/(.+)\.(jpg|jpeg|png|gif|webp)$/i,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1].split('/').pop() || null;
      }
    }

    return null;
  } catch (_) {
    return null;
  }
}
