import prisma from '../db';
import { User, Prisma } from '@prisma/client';

/**
 * User Repository - Data Access Layer for User operations
 * All database queries for users go through here
 */
export class UserRepository {
    /**
     * Find user by username
     */
    async findByUsername(username: string): Promise<User | null> {
        return prisma.user.findUnique({
            where: { username },
        });
    }

    /**
     * Find user by ID
     */
    async findById(userId: string): Promise<User | null> {
        return prisma.user.findUnique({
            where: { id: userId },
        });
    }

    /**
     * Create a new user
     */
    async create(data: Prisma.UserCreateInput): Promise<User> {
        return prisma.user.create({
            data,
        });
    }

    /**
     * Update user password
     */
    async updatePassword(userId: string, hashedPassword: string): Promise<User> {
        return prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });
    }

    /**
     * Check if username exists
     */
    async usernameExists(username: string): Promise<boolean> {
        const count = await prisma.user.count({
            where: { username },
        });
        return count > 0;
    }
}

// Export a singleton instance
export const userRepository = new UserRepository();
