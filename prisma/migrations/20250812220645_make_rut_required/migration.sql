/*
  Warnings:

  - Made the column `rut` on table `Client` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Client" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "rut" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "alias" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "contacts" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Client" ("alias", "contacts", "createdAt", "email", "id", "name", "notes", "phone", "rut", "updatedAt") SELECT "alias", "contacts", "createdAt", "email", "id", "name", "notes", "phone", "rut", "updatedAt" FROM "Client";
DROP TABLE "Client";
ALTER TABLE "new_Client" RENAME TO "Client";
CREATE UNIQUE INDEX "Client_rut_key" ON "Client"("rut");
CREATE INDEX "Client_name_idx" ON "Client"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
