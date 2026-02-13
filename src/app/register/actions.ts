'use server';

import { authService } from '@/lib/services/auth.service';
import { setAuthCookie } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function register(formData: FormData) {
    const username = formData.get('username') as string;
    const email = formData.get('email') as string;
    const name = formData.get('name') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    // Validation
    if (!username || !email || !name || !password || !confirmPassword) {
        return { success: false, error: 'Bitte füllen Sie alle Felder aus' };
    }

    if (password !== confirmPassword) {
        return { success: false, error: 'Passwörter stimmen nicht überein' };
    }

    if (password.length < 6) {
        return { success: false, error: 'Passwort muss mindestens 6 Zeichen lang sein' };
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { success: false, error: 'Ungültige E-Mail-Adresse' };
    }

    // Create user
    const result = await authService.createUser(username, password, name, email);

    if (!result.success) {
        return { success: false, error: result.error || 'Registrierung fehlgeschlagen' };
    }

    // Auto-login after successful registration
    if (result.user) {
        await setAuthCookie(result.user);
    }

    redirect('/');
}
