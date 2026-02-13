import prisma from '../db';
import { Device, Prisma } from '@prisma/client';

export interface DeviceFilters {
    dateFrom?: string;
    dateTo?: string;
    dateType?: 'purchaseDate' | 'saleDate';
    status?: string;
}

/**
 * Device Repository - Data Access Layer for Device operations
 * All database queries for devices go through here
 * CRITICAL: All queries are scoped by userId for data isolation
 */
export class DeviceRepository {
    /**
     * Find all devices for a user with optional filters
     */
    async findAll(userId: string, filters?: DeviceFilters): Promise<Device[]> {
        const where: Prisma.DeviceWhereInput = {
            userId, // CRITICAL: Always filter by user
        };

        // Apply date filters
        if (filters?.dateFrom || filters?.dateTo) {
            const dateField = filters?.dateType === 'saleDate' ? 'saleDate' : 'purchaseDate';
            where[dateField] = {};

            if (filters.dateFrom) {
                where[dateField as 'saleDate' | 'purchaseDate']!.gte = new Date(filters.dateFrom);
            }

            if (filters.dateTo) {
                const endDate = new Date(filters.dateTo);
                endDate.setHours(23, 59, 59, 999);
                where[dateField as 'saleDate' | 'purchaseDate']!.lte = endDate;
            }

            // If filtering by saleDate, exclude devices without a saleDate
            if (dateField === 'saleDate') {
                where[dateField]!.not = null;
            }
        }

        // Apply status filter
        if (filters?.status) {
            where.status = filters.status;
        }

        return prisma.device.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
    }

    /**
     * Find a single device by ID (user-scoped)
     */
    async findById(deviceId: string, userId: string): Promise<Device | null> {
        return prisma.device.findFirst({
            where: {
                id: deviceId,
                userId, // CRITICAL: User can only access their own devices
            },
            include: { documents: true },
        });
    }

    /**
     * Create a new device for a user
     */
    async create(userId: string, data: Omit<Prisma.DeviceCreateInput, 'user'>): Promise<Device> {
        return prisma.device.create({
            data: {
                ...data,
                user: {
                    connect: { id: userId },
                },
            },
        });
    }

    /**
     * Update specific fields of a device (user-scoped)
     * IMPORTANT: Only updates provided fields, preserves others
     */
    async updateFields(
        deviceId: string,
        userId: string,
        fields: Prisma.DeviceUpdateInput
    ): Promise<Device> {
        // First verify the device belongs to the user
        const device = await this.findById(deviceId, userId);
        if (!device) {
            throw new Error('Device not found or access denied');
        }

        return prisma.device.update({
            where: { id: deviceId },
            data: fields,
        });
    }

    /**
     * Delete a device (user-scoped)
     */
    async delete(deviceId: string, userId: string): Promise<void> {
        // First verify the device belongs to the user
        const device = await this.findById(deviceId, userId);
        if (!device) {
            throw new Error('Device not found or access denied');
        }

        await prisma.device.delete({
            where: { id: deviceId },
        });
    }

    /**
     * Check if a device ID exists (globally, for uniqueness check)
     */
    async deviceIdExists(id: string): Promise<boolean> {
        const count = await prisma.device.count({
            where: { id },
        });
        return count > 0;
    }

    /**
     * Get device count by status for a user
     */
    async countByStatus(userId: string, status: string): Promise<number> {
        return prisma.device.count({
            where: {
                userId,
                status,
            },
        });
    }
}

// Export a singleton instance
export const deviceRepository = new DeviceRepository();
