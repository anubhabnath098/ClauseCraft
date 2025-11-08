
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { clauseIds } = await request.json();

    if (!clauseIds || !Array.isArray(clauseIds) || clauseIds.length === 0) {
      return NextResponse.json({ error: "Invalid request body: clauseIds array is required" }, { status: 400 });
    }

    // clauseIds are now strings (vector_ids)
    const stringClauseIds = clauseIds.filter(id => typeof id === 'string' && id.length > 0);

    if (stringClauseIds.length === 0) {
      return NextResponse.json({ error: "No valid string clause IDs provided" }, { status: 400 });
    }

    const clauses = await prisma.clause.findMany({
      where: {
        vector_id: { // Query by vector_id
          in: stringClauseIds,
        },
      },
    });

    return NextResponse.json(clauses);
  } catch (error) {
    console.error("Failed to retrieve clauses by IDs:", error);
    return NextResponse.json({ error: "Failed to retrieve clauses" }, { status: 500 });
  }
}
