// No external dependencies needed for crypto.randomUUID() in modern Node.js/Browsers
import { cookies } from 'next/headers';

export const GUEST_ID_COOKIE = 'guest-id';

/**
 * Gets the guest ID from cookies or returns null if not found.
 * This is meant to be used in Server Components or API Routes.
 */
export async function getGuestId(): Promise<string | null> {
    const cookieStore = await cookies();
    return cookieStore.get(GUEST_ID_COOKIE)?.value || null;
}

/**
 * Generates a new unique guest ID.
 */
export function generateGuestId(): string {
    return typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
