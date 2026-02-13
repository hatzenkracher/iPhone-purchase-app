import * as bcrypt from 'bcryptjs';
import { userRepository } from '../repositories/user.repository';
import { User } from '@prisma/client';

export interface LoginResult {
    success: boolean;
    user?: Omit<User, 'password'>;
    error?: string;
}

/**
 * Authentication Service - Business Logic for User Authentication
 * Handles login, password verification, session management
 */
export class AuthService {
    /**
     * Authenticate user with username and password
     */
    async login(username: string, password: string): Promise<LoginResult> {
        try {
            // Find user by username
            const user = await userRepository.findByUsername(username);

            if (!user) {
                return {
                    success: false,
                    error: 'Ungültiger Benutzername oder Passwort',
                };
            }

            // Verify password
            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (!isPasswordValid) {
                return {
                    success: false,
                    error: 'Ungültiger Benutzername oder Passwort',
                };
            }

            // Return user data without password
            const { password: _, ...userWithoutPassword } = user;

            return {
                success: true,
                user: userWithoutPassword,
            };
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                error: 'Ein Fehler ist aufgetreten',
            };
        }
    }

    /**
     * Validate user by ID (for session checks)
     */
    async validateUser(userId: string): Promise<Omit<User, 'password'> | null> {
        try {
            const user = await userRepository.findById(userId);

            if (!user) {
                return null;
            }

            const { password: _, ...userWithoutPassword } = user;
            return userWithoutPassword;
        } catch (error) {
            console.error('Validate user error:', error);
            return null;
        }
    }

    /**
     * Change user password
     */
    async changePassword(
        userId: string,
        currentPassword: string,
        newPassword: string
    ): Promise<{ success: boolean; error?: string }> {
        try {
            const user = await userRepository.findById(userId);

            if (!user) {
                return {
                    success: false,
                    error: 'Benutzer nicht gefunden',
                };
            }

            // Verify current password
            const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

            if (!isPasswordValid) {
                return {
                    success: false,
                    error: 'Aktuelles Passwort ist falsch',
                };
            }

            // Hash new password
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // Update password
            await userRepository.updatePassword(userId, hashedPassword);

            return { success: true };
        } catch (error) {
            console.error('Change password error:', error);
            return {
                success: false,
                error: 'Ein Fehler ist aufgetreten',
            };
        }
    }

    /**
     * Create a new user (for admin/registration)
     */
    async createUser(
        username: string,
        password: string,
        name: string,
        email?: string
    ): Promise<{ success: boolean; user?: Omit<User, 'password'>; error?: string }> {
        try {
            // Check if username already exists
            const exists = await userRepository.usernameExists(username);

            if (exists) {
                return {
                    success: false,
                    error: 'Benutzername existiert bereits',
                };
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create user
            const user = await userRepository.create({
                username,
                password: hashedPassword,
                name,
                email: email || null,
            });

            const { password: _, ...userWithoutPassword } = user;

            return {
                success: true,
                user: userWithoutPassword,
            };
        } catch (error) {
            console.error('Create user error:', error);
            return {
                success: false,
                error: 'Ein Fehler ist aufgetreten',
            };
        }
    }
}

// Export a singleton instance
export const authService = new AuthService();
