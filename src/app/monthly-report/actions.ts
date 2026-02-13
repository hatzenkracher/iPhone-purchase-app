'use server';

import { requireAuth } from '@/lib/auth';
import { reportService } from '@/lib/services/report.service';

/**
 * Get monthly report for the authenticated user
 * @param monthStr - Month string in format "YYYY-MM"
 */
export async function getMonthlyReport(monthStr: string) {
    const user = await requireAuth();
    return reportService.getMonthlyReport(user.id, monthStr);
}
