/*
  Warnings:

  - A unique constraint covering the columns `[vector_id]` on the table `Clause` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `vector_id` to the `Clause` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Clause" ADD COLUMN     "vector_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Clause_vector_id_key" ON "Clause"("vector_id");
