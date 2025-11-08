
import { NextResponse } from "next/server";

const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || "http://127.0.0.1:8000";

export async function POST(request: Request) {
  try {
    const { pdfUrl } = await request.json();

    if (!pdfUrl) {
      return NextResponse.json({ error: "Invalid request body: pdfUrl is required" }, { status: 400 });
    }

    // Call the FastAPI backend to review the contract and get suggestions
    const reviewResponse = await fetch(`${FASTAPI_URL}/upload-contract`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pdf_url: pdfUrl }),
    });

    if (!reviewResponse.ok) {
      const errorData = await reviewResponse.json();
      console.error("FastAPI error:", errorData);
      throw new Error(errorData.detail || "Failed to get suggestions from backend");
    }

    const suggestions = await reviewResponse.json();

    return NextResponse.json(suggestions);
  } catch (error: any) {
    console.error("Failed to review contract:", error);
    return NextResponse.json({ error: error.message || "Failed to review contract" }, { status: 500 });
  }
}