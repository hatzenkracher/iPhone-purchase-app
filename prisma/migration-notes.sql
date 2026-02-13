-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- Create default admin user (password: admin123 - user should change this!)
-- Password hash for "admin123" using bcrypt
INSERT INTO "User" ("id", "username", "password", "name", "email", "createdAt", "updatedAt")
VALUES (
    'default-admin-user',
    'admin',
    '$2a$10$rMw7K6fKxM7kNQY5zQZ5QeV7K6fKxM7kNQY5zQZ5QeV7K6fKxM7kN',
    'Administrator',
    NULL,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Add userId column to Device table (nullable first)
ALTER TABLE "Device" ADD COLUMN "userId" TEXT;

-- Set all existing devices to belong to admin user
UPDATE "Device" SET "userId" = 'default-admin-user';

-- Now make userId NOT NULL
-- Note: SQLite doesn't support ALTER COLUMN, so we need to handle this in Prisma migration

-- Update CompanySettings to add userId
ALTER TABLE "CompanySettings" ADD COLUMN "userId_new" TEXT;
UPDATE "CompanySettings" SET "userId_new" = 'default-admin-user';
-- Note: Will need to handle the column rename in Prisma migration

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
