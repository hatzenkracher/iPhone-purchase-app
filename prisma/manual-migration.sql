-- Manual Migration Script: Add User Authentication
-- This preserves existing data while adding user authentication

-- Step 1: Create User table
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL UNIQUE,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Step 2: Insert default admin user
-- Password hash for "admin123"
INSERT OR IGNORE INTO "User" ("id", "username", "password", "name", "email", "createdAt", "updatedAt")
VALUES (
    'default-admin-user',
    'admin',
    '$2a$10$rMw7K6f.yM7kNQY5zQZ5Qe1V7.6fKxM7kNQY5zQZ5Qe1V7.6fKxM7.',
    'Administrator',
    NULL,
    datetime('now'),
    datetime('now')
);

-- Step 3: Add userId column to Device table
ALTER TABLE "Device" ADD COLUMN "userId" TEXT;

-- Step 4: Set all existing devices to belong to admin user
UPDATE "Device" SET "userId" = 'default-admin-user' WHERE "userId" IS NULL;

-- Step 5: Recreate CompanySettings table with userId
-- First, backup existing data
CREATE TABLE IF NOT EXISTS "CompanySettings_backup" AS SELECT * FROM "CompanySettings";

-- Drop old table
DROP TABLE "CompanySettings";

-- Recreate with new schema
CREATE TABLE "CompanySettings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT NOT NULL UNIQUE,
    "companyName" TEXT NOT NULL,
    "ownerName" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "houseNumber" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'Deutschland',
    "vatId" TEXT,
    "taxId" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "logoPath" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- Restore data with userId
INSERT INTO "CompanySettings" (
    "id", "userId", "companyName", "ownerName", "street", "houseNumber",
    "postalCode", "city", "country", "vatId", "taxId", "email", "phone",
    "logoPath", "createdAt", "updatedAt"
)
SELECT 
    "id", 'default-admin-user', "companyName", "ownerName", "street", "houseNumber",
    "postalCode", "city", "country", "vatId", "taxId", "email", "phone",
    "logoPath", "createdAt", "updatedAt"
FROM "CompanySettings_backup";

-- Clean up
DROP TABLE "CompanySettings_backup";

-- Create indexes
CREATE UNIQUE INDEX IF NOT EXISTS "User_username_key" ON "User"("username");
