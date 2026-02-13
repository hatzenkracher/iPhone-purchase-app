import { Device } from "@prisma/client";

export interface CalculationResult {
    totalCosts: number;           // All costs including salesFees
    taxableMargin: number;        // Only: salePrice - purchasePrice (for differential taxation §25a UStG)
    actualProfit: number;         // Actual profit after all costs (for internal accounting)
    grossProfit: number;          // Deprecated: Use actualProfit instead
    vat: number;                  // VAT (correctly calculated)
    netProfit: number;            // Net profit after tax
    isFinal: boolean;             // Is sold?
}

export function calculateDeviceFinancials(device: Device): CalculationResult {
    const isSold = device.status === 'SOLD';

    // Extract all cost components
    const purchasePrice = device.purchasePrice || 0;
    const repairCost = device.repairCost || 0;
    const shippingBuy = device.shippingBuy || 0;
    const shippingSell = device.shippingSell || 0;
    const salesFees = device.salesFees || 0;
    const salePrice = device.salePrice || 0;

    // Total costs include ALL expenses (purchase, repair, shipping, fees)
    const totalCosts = purchasePrice + repairCost + shippingBuy + shippingSell + salesFees;

    // Taxable margin: ONLY salePrice - purchasePrice (for differential taxation §25a UStG)
    // This is the amount subject to tax when differential taxation is enabled
    const taxableMargin = salePrice - purchasePrice;

    // Actual profit: Revenue minus ALL costs (for internal accounting)
    const actualProfit = salePrice - totalCosts;

    // Deprecated but kept for backward compatibility
    const grossProfit = actualProfit;

    // Calculate VAT
    let vat = 0;
    if (isSold) {
        if (device.isDiffTax) {
            // Differential Taxation (§25a UStG): Tax on margin ONLY
            // User formula: Marge_Diff × 19 / 119
            // If Marge_Diff < 0 → set to 0
            if (taxableMargin > 0) {
                vat = taxableMargin * (19 / 119);
            }
        } else {
            // Standard Tax: Tax on full sale price
            // Sale price is gross (includes VAT)
            vat = salePrice * (19 / 119);
        }
    }

    // Net profit after tax deduction
    const netProfit = actualProfit - vat;

    return {
        totalCosts,
        taxableMargin,
        actualProfit,
        grossProfit,  // Kept for backward compatibility
        vat,
        netProfit,
        isFinal: isSold
    };
}
