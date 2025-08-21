/*
  Warnings:

  - You are about to drop the column `province` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `region` on the `Client` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Client" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "rut" TEXT,
    "name" TEXT NOT NULL,
    "alias" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "contacts" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Client" ("contacts", "createdAt", "email", "id", "name", "notes", "phone", "updatedAt") SELECT "contacts", "createdAt", "email", "id", "name", "notes", "phone", "updatedAt" FROM "Client";
DROP TABLE "Client";
ALTER TABLE "new_Client" RENAME TO "Client";
CREATE UNIQUE INDEX "Client_rut_key" ON "Client"("rut");
CREATE INDEX "Client_name_idx" ON "Client"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Milestone_proposalId_idx" ON "Milestone"("proposalId");

-- CreateIndex
CREATE INDEX "Milestone_isTriggered_idx" ON "Milestone"("isTriggered");

-- CreateIndex
CREATE INDEX "Milestone_dueDate_idx" ON "Milestone"("dueDate");

-- CreateIndex
CREATE INDEX "Milestone_triggeredAt_idx" ON "Milestone"("triggeredAt");

-- CreateIndex
CREATE INDEX "Procedure_clientId_idx" ON "Procedure"("clientId");

-- CreateIndex
CREATE INDEX "Procedure_status_idx" ON "Procedure"("status");

-- CreateIndex
CREATE INDEX "Procedure_createdAt_idx" ON "Procedure"("createdAt");

-- CreateIndex
CREATE INDEX "Procedure_lastActionAt_idx" ON "Procedure"("lastActionAt");

-- CreateIndex
CREATE INDEX "Proposal_clientId_idx" ON "Proposal"("clientId");
