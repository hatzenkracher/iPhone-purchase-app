"use server"

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";

export async function getCompanySettings() {
    try {
        const settings = await prisma.companySettings.findUnique({
            where: { userId: "default" }
        });
        return { success: true, settings };
    } catch (error) {
        console.error("Failed to fetch company settings:", error);
        return { success: false, error: "Failed to fetch company settings" };
    }
}

export async function saveCompanySettings(data: any) {
    try {
        const settings = await prisma.companySettings.upsert({
            where: { userId: "default" },
            update: {
                companyName: data.companyName,
                ownerName: data.ownerName,
                street: data.street,
                houseNumber: data.houseNumber,
                postalCode: data.postalCode,
                city: data.city,
                country: data.country || "Deutschland",
                vatId: data.vatId || null,
                taxId: data.taxId || null,
                email: data.email,
                phone: data.phone || null,
            },
            create: {
                userId: "default",
                companyName: data.companyName,
                ownerName: data.ownerName,
                street: data.street,
                houseNumber: data.houseNumber,
                postalCode: data.postalCode,
                city: data.city,
                country: data.country || "Deutschland",
                vatId: data.vatId || null,
                taxId: data.taxId || null,
                email: data.email,
                phone: data.phone || null,
            }
        });
        revalidatePath("/company-settings");
        return { success: true, settings };
    } catch (error) {
        console.error("Failed to save company settings:", error);
        return { success: false, error: "Failed to save company settings" };
    }
}

export async function uploadLogo(formData: FormData) {
    try {
        const file = formData.get("logo") as File;
        if (!file) {
            return { success: false, error: "No file provided" };
        }

        // Validate file type
        const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml"];
        if (!validTypes.includes(file.type)) {
            return { success: false, error: "Invalid file type. Please upload PNG, JPG, or SVG." };
        }

        // Validate file size (2MB max)
        if (file.size > 2 * 1024 * 1024) {
            return { success: false, error: "File too large. Maximum size is 2MB." };
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create upload directory if it doesn't exist
        const uploadDir = join(process.cwd(), "public", "uploads", "company");

        // Get file extension
        const ext = file.name.split('.').pop();
        const filename = `logo.${ext}`;
        const filepath = join(uploadDir, filename);
        const publicPath = `/uploads/company/${filename}`;

        // Delete old logo if exists
        const currentSettings = await prisma.companySettings.findUnique({
            where: { userId: "default" }
        });
        if (currentSettings?.logoPath) {
            try {
                const oldPath = join(process.cwd(), "public", currentSettings.logoPath);
                await unlink(oldPath);
            } catch (e) {
                // Ignore if file doesn't exist
            }
        }

        // Write new file
        await writeFile(filepath, buffer);

        // Update database
        await prisma.companySettings.upsert({
            where: { userId: "default" },
            update: { logoPath: publicPath },
            create: {
                userId: "default",
                companyName: "",
                ownerName: "",
                street: "",
                houseNumber: "",
                postalCode: "",
                city: "",
                email: "",
                logoPath: publicPath,
            }
        });

        revalidatePath("/company-settings");
        return { success: true, logoPath: publicPath };
    } catch (error) {
        console.error("Failed to upload logo:", error);
        return { success: false, error: "Failed to upload logo" };
    }
}

export async function deleteLogo() {
    try {
        const settings = await prisma.companySettings.findUnique({
            where: { userId: "default" }
        });

        if (settings?.logoPath) {
            // Delete file
            try {
                const filepath = join(process.cwd(), "public", settings.logoPath);
                await unlink(filepath);
            } catch (e) {
                // Ignore if file doesn't exist
            }

            // Update database
            await prisma.companySettings.update({
                where: { userId: "default" },
                data: { logoPath: null }
            });
        }

        revalidatePath("/company-settings");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete logo:", error);
        return { success: false, error: "Failed to delete logo" };
    }
}
