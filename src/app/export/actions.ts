'use server';

import { requireAuth } from '@/lib/auth';
import { deviceService } from '@/lib/services/device.service';
import { calculateDeviceFinancials } from '@/lib/calculations';
import { format } from 'date-fns';

export interface ExportFilters {
    dateFrom?: string;
    dateTo?: string;
    dateType?: 'purchaseDate' | 'saleDate';
    status?: string;
}

export interface ExportResult {
    success: boolean;
    data?: any[];
    filename?: string;
    count?: number;
    error?: string;
}

/**
 * Export devices to Excel format with strict multi-user security
 * CRITICAL: Only exports devices belonging to the authenticated user
 */
export async function exportDevicesToExcel(filters?: ExportFilters): Promise<ExportResult> {
    try {
        // SECURITY: Get authenticated user - this ensures only logged-in users can export
        const user = await requireAuth();

        // SECURITY: Server-side filtering by userId - cannot be bypassed from frontend
        const devices = await deviceService.getDevices(user.id, filters);

        if (devices.length === 0) {
            return {
                success: false,
                error: 'Keine Geräte zum Exportieren gefunden'
            };
        }

        // Prepare comprehensive device data for export
        const exportData: any[] = devices.map((device) => {
            const financials = calculateDeviceFinancials(device);

            // Calculate total shipping costs (buy + sell)
            const totalShipping = (device.shippingBuy || 0) + (device.shippingSell || 0);

            return {
                // Basic device information
                'Geräte-ID': device.id,
                'Modell': device.model || '',
                'Speicher': device.storage || '',
                'Farbe': device.color || '',
                'Zustand': device.condition || '',
                'Status': device.status || '',

                // Optional fields
                'IMEI': device.imei || '',

                // Dates
                'Einkaufsdatum': device.purchaseDate
                    ? format(new Date(device.purchaseDate), 'dd.MM.yyyy')
                    : '',
                'Verkaufsdatum': device.saleDate
                    ? format(new Date(device.saleDate), 'dd.MM.yyyy')
                    : '',

                // Financial data
                'Einkaufspreis': device.purchasePrice || 0,
                'Reparaturkosten': device.repairCost || 0,
                'Verkaufspreis': device.salePrice || 0,
                'Versandkosten': totalShipping,
                'Verkaufsgebühren': device.salesFees || 0,

                // Tax information
                'Steuern': financials.vat || 0,
                'Differenzbesteuert': device.isDiffTax ? 'Ja' : 'Nein',

                // Sales information
                'Bestellnummer': device.platformOrderNumber || '',
                'Rechnungsnummer Verkauf': device.saleInvoiceNumber || '',
            };
        });

        // Calculate summary totals
        let sumEinkaufspreis = 0;
        let sumReparaturkosten = 0;
        let sumVerkaufspreis = 0;
        let sumVersandkosten = 0;
        let sumVerkaufsgebuehren = 0;
        let sumSteuern = 0;

        devices.forEach((device) => {
            const financials = calculateDeviceFinancials(device);
            sumEinkaufspreis += device.purchasePrice || 0;
            sumReparaturkosten += device.repairCost || 0;
            sumVerkaufspreis += device.salePrice || 0;
            sumVersandkosten += (device.shippingBuy || 0) + (device.shippingSell || 0);
            sumVerkaufsgebuehren += device.salesFees || 0;
            sumSteuern += financials.vat || 0;
        });

        // Calculate profit
        const gesamtKosten = sumEinkaufspreis + sumReparaturkosten + sumVersandkosten;
        const gesamtEinnahmen = sumVerkaufspreis;
        const gewinnVorSteuer = gesamtEinnahmen - gesamtKosten - sumVerkaufsgebuehren;
        const gewinnNachSteuer = gewinnVorSteuer - sumSteuern;

        // Add empty row separator
        exportData.push({});

        // Add summary section
        exportData.push({ 'Geräte-ID': '=== ZUSAMMENFASSUNG ===' });
        exportData.push({ 'Geräte-ID': 'Anzahl Geräte', 'Modell': devices.length });
        exportData.push({});
        exportData.push({ 'Geräte-ID': 'Summe Einkaufspreis', 'Modell': `${sumEinkaufspreis.toFixed(2)} €` });
        exportData.push({ 'Geräte-ID': 'Summe Reparaturkosten', 'Modell': `${sumReparaturkosten.toFixed(2)} €` });
        exportData.push({ 'Geräte-ID': 'Summe Versandkosten', 'Modell': `${sumVersandkosten.toFixed(2)} €` });
        exportData.push({ 'Geräte-ID': 'Summe Verkaufsgebühren', 'Modell': `${sumVerkaufsgebuehren.toFixed(2)} €` });
        exportData.push({ 'Geräte-ID': 'Summe Steuern', 'Modell': `${sumSteuern.toFixed(2)} €` });
        exportData.push({});
        exportData.push({ 'Geräte-ID': 'Summe Verkaufspreis', 'Modell': `${sumVerkaufspreis.toFixed(2)} €` });
        exportData.push({});
        exportData.push({ 'Geräte-ID': 'Gewinn vor Steuer', 'Modell': `${gewinnVorSteuer.toFixed(2)} €` });
        exportData.push({ 'Geräte-ID': 'Gewinn nach Steuer', 'Modell': `${gewinnNachSteuer.toFixed(2)} €` });

        // Generate filename with date range
        let filename = 'Geraete_Export';
        if (filters?.dateFrom) {
            filename += `_${format(new Date(filters.dateFrom), 'yyyy-MM-dd')}`;
        }
        if (filters?.dateTo) {
            filename += `_bis_${format(new Date(filters.dateTo), 'yyyy-MM-dd')}`;
        }
        filename += '.xlsx';

        return {
            success: true,
            data: exportData,
            filename,
            count: devices.length,
        };
    } catch (error) {
        console.error('Excel export error:', error);
        return {
            success: false,
            error: 'Excel-Export fehlgeschlagen'
        };
    }
}
