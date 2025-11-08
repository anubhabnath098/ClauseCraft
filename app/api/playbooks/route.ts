
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { name, clauses } = await request.json();

    if (!name || !clauses || !Array.isArray(clauses)) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const playbook = await prisma.playbook.create({
      data: {
        name,
        clauses: {
          create: clauses.map((clause: any) => ({
            vector_id: clause.vector_id, // Include the vector_id
            clause_type: clause.clause_type,
            clause_text: clause.clause_text,
          })),
        },
      },
      include: {
        clauses: true,
      },
    });

    return NextResponse.json(playbook, { status: 201 });
  } catch (error) {
    console.error("Failed to save playbook:", error);
    return NextResponse.json({ error: "Failed to save playbook" }, { status: 500 });
  }
}
