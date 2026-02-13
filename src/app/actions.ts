'use server';

import { requireAuth } from '@/lib/auth';
import { deviceService } from '@/lib/services/device.service';
import { revalidatePath } from 'next/cache';

export interface DeviceFilters {
    dateFrom?: string;
    dateTo?: string;
    dateType?: 'createdAt' | 'saleDate';
}

/**
 * Get all devices for the authenticated user
 */
export async function getDevices(filters?: DeviceFilters) {
    const user = await requireAuth();
    return deviceService.getDevices(user.id, filters);
}

/**
 * Get a single device by ID
 */
export async function getDevice(id: string) {
    const user = await requireAuth();
    return deviceService.getDevice(user.id, id);
}

/**
 * Create a new device
 */
export async function createDevice(data: any) {
    const user = await requireAuth();

    const result = await deviceService.createDevice(user.id, {
        id: data.id,
        model: data.model,
        storage: data.storage,
        color: data.color,
        condition: data.condition,
        status: data.status,
        imei: data.imei || null,
        purchaseDate: new Date(data.purchaseDate),
        purchasePrice: parseFloat(data.purchasePrice || 0),
        shippingBuy: parseFloat(data.shippingBuy || 0),
        repairCost: parseFloat(data.repairCost || 0),
        shippingSell: parseFloat(data.shippingSell || 0),
        salePrice: data.salePrice ? parseFloat(data.salePrice) : null,
        salesFees: parseFloat(data.salesFees || 0),
        saleDate: data.saleDate ? new Date(data.saleDate) : null,
        buyerName: data.buyerName || null,
        platformOrderNumber: data.platformOrderNumber || null,
        saleInvoiceNumber: data.saleInvoiceNumber || null,
        isDiffTax: data.isDiffTax === 'on' || data.isDiffTax === true,
        defects: data.defects || null,
        repairDate: data.repairDate ? new Date(data.repairDate) : null,
        shippingBuyDate: data.shippingBuyDate ? new Date(data.shippingBuyDate) : null,
        shippingSellDate: data.shippingSellDate ? new Date(data.shippingSellDate) : null,
    });

    if (result.success) {
        revalidatePath('/devices');
    }

    return result;
}

/**
 * Update a device
 */
export async function updateDevice(id: string, data: any) {
    const user = await requireAuth();

    // Build update data - only include fields that are provided
    const updateData: any = {};

    if (data.model !== undefined) updateData.model = data.model;
    if (data.storage !== undefined) updateData.storage = data.storage;
    if (data.color !== undefined) updateData.color = data.color;
    if (data.condition !== undefined) updateData.condition = data.condition;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.imei !== undefined) updateData.imei = data.imei || null;
    if (data.purchaseDate !== undefined) updateData.purchaseDate = new Date(data.purchaseDate);
    if (data.purchasePrice !== undefined) updateData.purchasePrice = parseFloat(data.purchasePrice || 0);
    if (data.shippingBuy !== undefined) updateData.shippingBuy = parseFloat(data.shippingBuy || 0);
    if (data.repairCost !== undefined) updateData.repairCost = parseFloat(data.repairCost || 0);
    if (data.shippingSell !== undefined) updateData.shippingSell = parseFloat(data.shippingSell || 0);
    if (data.salePrice !== undefined) updateData.salePrice = data.salePrice ? parseFloat(data.salePrice) : null;
    if (data.salesFees !== undefined) updateData.salesFees = parseFloat(data.salesFees || 0);
    if (data.saleDate !== undefined) updateData.saleDate = data.saleDate ? new Date(data.saleDate) : null;
    if (data.buyerName !== undefined) updateData.buyerName = data.buyerName || null;
    if (data.platformOrderNumber !== undefined) updateData.platformOrderNumber = data.platformOrderNumber || null;
    if (data.saleInvoiceNumber !== undefined) updateData.saleInvoiceNumber = data.saleInvoiceNumber || null;
    if (data.isDiffTax !== undefined) updateData.isDiffTax = data.isDiffTax === 'on' || data.isDiffTax === true;
    if (data.defects !== undefined) updateData.defects = data.defects || null;
    if (data.repairDate !== undefined) updateData.repairDate = data.repairDate ? new Date(data.repairDate) : null;
    if (data.shippingBuyDate !== undefined) updateData.shippingBuyDate = data.shippingBuyDate ? new Date(data.shippingBuyDate) : null;
    if (data.shippingSellDate !== undefined) updateData.shippingSellDate = data.shippingSellDate ? new Date(data.shippingSellDate) : null;

    const result = await deviceService.updateDevice(user.id, id, updateData);

    if (result.success) {
        revalidatePath('/devices');
        revalidatePath(`/devices/${id}`);
    }

    return result;
}

/**
 * Update only the status of a device
 * Dedicated method for status updates - preserves all other fields
 */
export async function updateDeviceStatus(id: string, status: string) {
    const user = await requireAuth();

    const result = await deviceService.updateStatus(user.id, id, status as any);

    if (result.success) {
        revalidatePath('/devices');
        revalidatePath(`/devices/${id}`);
    }

    return result;
}


/**
 * Delete a device
 */
export async function deleteDevice(id: string) {
    const user = await requireAuth();

    const result = await deviceService.deleteDevice(user.id, id);

    if (result.success) {
        revalidatePath('/devices');
    }

    return result;
}
