
import { NextResponse } from "next/server";

const FASTAPI_URL = process.env.NEXT_PUBLIC_GENAI_FASTAPI_URL || "http://localhost:8001";
const NEXT_APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function POST(request: Request) {
  try {
    const { pdfUrl, playbookName } = await request.json();

    if (!pdfUrl || !playbookName) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    // 1. Call the FastAPI backend to process the PDF, generate clauses with IDs, and store them in the vector DB
    const processResponse = await fetch(`${FASTAPI_URL}/process-pdf-and-generate-clauses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pdf_url: pdfUrl }),
    });

    if (!processResponse.ok) {
      throw new Error("Failed to process PDF and generate clauses");
    }

    const clausesWithIds = await processResponse.json();

    // 2. Save the new playbook and its clauses (with pre-generated IDs) to the Postgres database
    const saveResponse = await fetch(`${NEXT_APP_URL}/api/playbooks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: playbookName, clauses: clausesWithIds }),
    });

    if (!saveResponse.ok) {
      throw new Error("Failed to save playbook");
    }

    const newPlaybook = await saveResponse.json();

    // 3. Return the extracted clauses to the frontend
    return NextResponse.json(newPlaybook);
  } catch (error) {
    console.error("Failed to create playbook:", error);
    return NextResponse.json({ error: "Failed to create playbook" }, { status: 500 });
  }
}
