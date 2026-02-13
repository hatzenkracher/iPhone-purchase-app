import { deviceRepository } from '../repositories/device.repository';
import { calculateDeviceFinancials } from '../calculations';
import { Device } from '@prisma/client';
import { startOfMonth, endOfMonth, parseISO } from 'date-fns';

export interface MonthlyReportKPIs {
    soldCount: number;
    stockCount: number;
    repairCount: number;
    totalRevenue: number;
    totalPurchaseCost: number;
    totalRepairCost: number;
    totalShippingCost: number;
    totalSalesFees: number;
    totalTaxableMargin: number;
    totalActualProfit: number;
    totalGrossProfit: number;
    totalVat: number;
    totalNetProfit: number;
}

export interface MonthlyReport {
    devices: Device[];
    kpis: MonthlyReportKPIs;
}

/**
 * Report Service - Business Logic for Monthly Reports
 * Handles monthly financial reporting and aggregations
 */
export class ReportService {
    /**
     * Generate monthly report for a user
     * @param userId - User ID
     * @param monthStr - Month string in format "YYYY-MM"
     */
    async getMonthlyReport(userId: string, monthStr: string): Promise<MonthlyReport> {
        // Parse month string and get date range
        const date = parseISO(monthStr + '-01');
        const start = startOfMonth(date);
        const end = endOfMonth(date);

        // Fetch devices sold in this month
        const soldDevices = await deviceRepository.findAll(userId, {
            dateFrom: start.toISOString(),
            dateTo: end.toISOString(),
            dateType: 'saleDate',
            status: 'SOLD',
        });

        // Get current stock counts (snapshot now, not historical)
        const [stockCount, repairCount] = await Promise.all([
            deviceRepository.countByStatus(userId, 'STOCK'),
            deviceRepository.countByStatus(userId, 'REPAIR'),
        ]);

        // Calculate aggregations
        let totalRevenue = 0;
        let totalPurchaseCost = 0;
        let totalRepairCost = 0;
        let totalShippingCost = 0;
        let totalSalesFees = 0;
        let totalTaxableMargin = 0;
        let totalActualProfit = 0;
        let totalGrossProfit = 0;
        let totalVat = 0;
        let totalNetProfit = 0;

        soldDevices.forEach((device) => {
            const financials = calculateDeviceFinancials(device);

            totalRevenue += device.salePrice || 0;
            totalPurchaseCost += device.purchasePrice || 0;
            totalRepairCost += device.repairCost || 0;
            totalShippingCost += (device.shippingBuy || 0) + (device.shippingSell || 0);
            totalSalesFees += device.salesFees || 0;

            totalTaxableMargin += financials.taxableMargin;
            totalActualProfit += financials.actualProfit;
            totalGrossProfit += financials.grossProfit;
            totalVat += financials.vat;
            totalNetProfit += financials.netProfit;
        });

        return {
            devices: soldDevices,
            kpis: {
                soldCount: soldDevices.length,
                stockCount,
                repairCount,
                totalRevenue,
                totalPurchaseCost,
                totalRepairCost,
                totalShippingCost,
                totalSalesFees,
                totalTaxableMargin,
                totalActualProfit,
                totalGrossProfit,
                totalVat,
                totalNetProfit,
            },
        };
    }
}

// Export a singleton instance
export const reportService = new ReportService();
