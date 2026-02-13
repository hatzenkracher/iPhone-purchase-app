import { cookies } from 'next/headers';
import { authService } from './services/auth.service';
import { User } from '@prisma/client';

/**
 * Get the current authenticated user from the session cookie
 * Returns null if not authenticated
 */
export async function getCurrentUser(): Promise<Omit<User, 'password'> | null> {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;

    if (!userId) {
        return null;
    }

    return authService.validateUser(userId);
}

/**
 * Set authentication cookie after successful login
 */
export async function setAuthCookie(userId: string): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.set('user_id', userId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
    });
}

/**
 * Clear authentication cookie on logout
 */
export async function clearAuthCookie(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete('user_id');
}

/**
 * Require authentication - throws error if not authenticated
 * Use in server actions/components that require auth
 */
export async function requireAuth(): Promise<Omit<User, 'password'>> {
    const user = await getCurrentUser();

    if (!user) {
        throw new Error('Unauthorized - Please log in');
    }

    return user;
}
