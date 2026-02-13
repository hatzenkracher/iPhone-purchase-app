import { deviceRepository, DeviceFilters } from '../repositories/device.repository';
import { Device, Prisma } from '@prisma/client';

export type DeviceStatus = 'STOCK' | 'REPAIR' | 'SOLD';

export interface CreateDeviceData {
    id: string;
    model: string;
    storage: string;
    color: string;
    condition: string;
    status: string;
    imei?: string | null;
    purchaseDate: Date;
    purchasePrice: number;
    shippingBuy?: number;
    repairCost?: number;
    shippingSell?: number;
    salePrice?: number | null;
    salesFees?: number;
    saleDate?: Date | null;
    buyerName?: string | null;
    platformOrderNumber?: string | null;
    saleInvoiceNumber?: string | null;
    isDiffTax?: boolean;
    defects?: string | null;
    repairDate?: Date | null;
    shippingBuyDate?: Date | null;
    shippingSellDate?: Date | null;
}

/**
 * Device Service - Business Logic for Device Management
 * Handles all device operations with validation and business rules
 */
export class DeviceService {
    /**
     * Get all devices for a user with optional filters
     */
    async getDevices(userId: string, filters?: DeviceFilters): Promise<Device[]> {
        return deviceRepository.findAll(userId, filters);
    }

    /**
     * Get a single device by ID
     */
    async getDevice(userId: string, deviceId: string): Promise<Device | null> {
        return deviceRepository.findById(deviceId, userId);
    }

    /**
     * Create a new device
     */
    async createDevice(
        userId: string,
        data: CreateDeviceData
    ): Promise<{ success: boolean; device?: Device; error?: string }> {
        try {
            // Check if device ID already exists (globally)
            const exists = await deviceRepository.deviceIdExists(data.id);
            if (exists) {
                return {
                    success: false,
                    error: 'Geräte-ID existiert bereits',
                };
            }

            // Create device data
            const deviceData: Omit<Prisma.DeviceCreateInput, 'user'> = {
                id: data.id,
                model: data.model,
                storage: data.storage,
                color: data.color,
                condition: data.condition,
                status: data.status,
                imei: data.imei || null,
                purchaseDate: data.purchaseDate,
                purchasePrice: data.purchasePrice,
                shippingBuy: data.shippingBuy || 0,
                repairCost: data.repairCost || 0,
                shippingSell: data.shippingSell || 0,
                salePrice: data.salePrice || null,
                salesFees: data.salesFees || 0,
                saleDate: data.saleDate || null,
                buyerName: data.buyerName || null,
                platformOrderNumber: data.platformOrderNumber || null,
                saleInvoiceNumber: data.saleInvoiceNumber || null,
                isDiffTax: data.isDiffTax ?? true,
                defects: data.defects || null,
                repairDate: data.repairDate || null,
                shippingBuyDate: data.shippingBuyDate || null,
                shippingSellDate: data.shippingSellDate || null,
            };

            const device = await deviceRepository.create(userId, deviceData);

            return {
                success: true,
                device,
            };
        } catch (error: any) {
            console.error('Create device error:', error);

            // Check for unique constraint violation on IMEI
            if (error.code === 'P2002' && error.meta?.target?.includes('imei')) {
                return {
                    success: false,
                    error: 'IMEI existiert bereits in der Datenbank',
                };
            }

            return {
                success: false,
                error: 'Fehler beim Erstellen des Geräts',
            };
        }
    }

    async updateDevice(
        userId: string,
        deviceId: string,
        data: Partial<CreateDeviceData>
    ): Promise<{ success: boolean; device?: Device; error?: string }> {
        try {
            // Get current device to check status change
            const currentDevice = await deviceRepository.findById(deviceId, userId);

            if (!currentDevice) {
                return {
                    success: false,
                    error: 'Gerät nicht gefunden',
                };
            }

            // Build update data - only include fields that are provided
            const updateData: Prisma.DeviceUpdateInput = {};

            if (data.model !== undefined) updateData.model = data.model;
            if (data.storage !== undefined) updateData.storage = data.storage;
            if (data.color !== undefined) updateData.color = data.color;
            if (data.condition !== undefined) updateData.condition = data.condition;
            if (data.status !== undefined) updateData.status = data.status;
            if (data.imei !== undefined) updateData.imei = data.imei;
            if (data.purchaseDate !== undefined) updateData.purchaseDate = data.purchaseDate;
            if (data.purchasePrice !== undefined) updateData.purchasePrice = data.purchasePrice;
            if (data.shippingBuy !== undefined) updateData.shippingBuy = data.shippingBuy;
            if (data.repairCost !== undefined) updateData.repairCost = data.repairCost;
            if (data.shippingSell !== undefined) updateData.shippingSell = data.shippingSell;
            if (data.salePrice !== undefined) updateData.salePrice = data.salePrice;
            if (data.salesFees !== undefined) updateData.salesFees = data.salesFees;
            if (data.saleDate !== undefined) updateData.saleDate = data.saleDate;
            if (data.buyerName !== undefined) updateData.buyerName = data.buyerName;
            if (data.platformOrderNumber !== undefined) updateData.platformOrderNumber = data.platformOrderNumber;
            if (data.saleInvoiceNumber !== undefined) updateData.saleInvoiceNumber = data.saleInvoiceNumber;
            if (data.isDiffTax !== undefined) updateData.isDiffTax = data.isDiffTax;
            if (data.defects !== undefined) updateData.defects = data.defects;
            if (data.repairDate !== undefined) updateData.repairDate = data.repairDate;
            if (data.shippingBuyDate !== undefined) updateData.shippingBuyDate = data.shippingBuyDate;
            if (data.shippingSellDate !== undefined) updateData.shippingSellDate = data.shippingSellDate;

            // BUSINESS RULE: Auto-set saleDate when status changes to SOLD
            // Only if saleDate is not explicitly provided AND not already set
            if (data.status === 'SOLD' && currentDevice.status !== 'SOLD' && !currentDevice.saleDate && data.saleDate === undefined) {
                updateData.saleDate = new Date();
            }

            const device = await deviceRepository.updateFields(deviceId, userId, updateData);

            return {
                success: true,
                device,
            };
        } catch (error: any) {
            console.error('Update device error:', error);

            if (error.message?.includes('not found')) {
                return {
                    success: false,
                    error: 'Gerät nicht gefunden',
                };
            }

            return {
                success: false,
                error: 'Fehler beim Aktualisieren des Geräts',
            };
        }
    }

    /**
     * Update only the status of a device
     * CRITICAL: This is a dedicated method for status changes
     * Only updates the status field and auto-sets saleDate if changing to SOLD
     */
    async updateStatus(
        userId: string,
        deviceId: string,
        newStatus: DeviceStatus
    ): Promise<{ success: boolean; device?: Device; error?: string }> {
        try {
            // Get current device to check state
            const device = await deviceRepository.findById(deviceId, userId);

            if (!device) {
                return {
                    success: false,
                    error: 'Gerät nicht gefunden',
                };
            }

            // Build update data
            const updates: Prisma.DeviceUpdateInput = {
                status: newStatus,
            };

            // Business rule: If changing to SOLD and saleDate not set, auto-set to now
            if (newStatus === 'SOLD' && !device.saleDate) {
                updates.saleDate = new Date();
            }

            // Update only the status (and possibly saleDate)
            const updatedDevice = await deviceRepository.updateFields(deviceId, userId, updates);

            return {
                success: true,
                device: updatedDevice,
            };
        } catch (error) {
            console.error('Update status error:', error);
            return {
                success: false,
                error: 'Fehler beim Aktualisieren des Status',
            };
        }
    }

    /**
     * Delete a device
     */
    async deleteDevice(
        userId: string,
        deviceId: string
    ): Promise<{ success: boolean; error?: string }> {
        try {
            await deviceRepository.delete(deviceId, userId);
            return { success: true };
        } catch (error: any) {
            console.error('Delete device error:', error);

            if (error.message?.includes('not found')) {
                return {
                    success: false,
                    error: 'Gerät nicht gefunden',
                };
            }

            return {
                success: false,
                error: 'Fehler beim Löschen des Geräts',
            };
        }
    }

    /**
     * Get device statistics for a user
     */
    async getStats(userId: string): Promise<{
        total: number;
        stock: number;
        repair: number;
        sold: number;
    }> {
        const [stock, repair, sold] = await Promise.all([
            deviceRepository.countByStatus(userId, 'STOCK'),
            deviceRepository.countByStatus(userId, 'REPAIR'),
            deviceRepository.countByStatus(userId, 'SOLD'),
        ]);

        return {
            total: stock + repair + sold,
            stock,
            repair,
            sold,
        };
    }
}

// Export a singleton instance
export const deviceService = new DeviceService();
