import { environment } from '../../../environments/environment';

/**
 * Converts a relative image URL to an absolute URL by prepending the API base URL
 * @param imageUrl - The relative image URL (e.g., '/uploads/2024/05/DSC09969.jpg') or absolute URL
 * @returns The absolute image URL or the original URL if already absolute
 */
export function getImageUrl(imageUrl: string | null | undefined): string {
  if (!imageUrl) {
    return '/favicon.ico';
  }

  // If the URL is already absolute (starts with http/https), return it as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // If the URL starts with /, prepend the API base URL
  if (imageUrl.startsWith('/')) {
    return `${environment.apiBaseUrl}${imageUrl}`;
  }

  // Otherwise, prepend with a slash and then the API base URL
  return `${environment.apiBaseUrl}/${imageUrl}`;
}
