'use server';

import { authService } from '@/lib/services/auth.service';
import { setAuthCookie, clearAuthCookie } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

/**
 * Login action
 */
export async function login(formData: FormData) {
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    if (!username || !password) {
        return {
            success: false,
            error: 'Benutzername und Passwort sind erforderlich',
        };
    }

    const result = await authService.login(username, password);

    if (result.success && result.user) {
        await setAuthCookie(result.user.id);
        redirect('/');
    }

    return result;
}

/**
 * Logout action
 */
export async function logout() {
    await clearAuthCookie();
    revalidatePath('/');
    redirect('/login');
}
