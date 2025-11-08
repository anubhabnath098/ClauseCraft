import { NextResponse } from "next/server";

const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || "http://127.0.0.1:8000";
const NEXT_APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function POST(request: Request) {
  try {
    const { pdfUrl, playbookName } = await request.json();

    if (!pdfUrl || !playbookName) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    // 1. Call the FastAPI backend to process the PDF, generate clauses, and store them in the vector DB
    const processResponse = await fetch(`${FASTAPI_URL}/upload-template`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pdf_url: pdfUrl, playbook_name: playbookName }),
    });

    if (!processResponse.ok) {
      const errorData = await processResponse.json();
      console.error("FastAPI error:", errorData);
      throw new Error(errorData.detail || "Failed to process PDF in backend");
    }

    const { clauses } = await processResponse.json();

    // 2. Save the new playbook and its clauses to the Postgres database
    const saveResponse = await fetch(`${NEXT_APP_URL}/api/playbooks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: playbookName, clauses: clauses }),
    });

    console.log("Received response from /api/playbooks. Status:", saveResponse.status);
    console.log("Response headers:", Object.fromEntries(saveResponse.headers.entries()));

    if (!saveResponse.ok) {
      const errorData = await saveResponse.json();
      throw new Error(`Failed to save playbook to Postgres: ${errorData.details || JSON.stringify(errorData)}`);
    }

    const newPlaybook = await saveResponse.json();

    // 3. Return the new playbook (from Postgres) to the frontend
    return NextResponse.json(newPlaybook);
  } catch (error: any) {
    console.error("Failed to create playbook:", error);
    return NextResponse.json({ error: error.message || "Failed to create playbook" }, { status: 500 });
  }
}