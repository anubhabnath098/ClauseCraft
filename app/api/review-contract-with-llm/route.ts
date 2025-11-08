
import { NextResponse } from "next/server";

const FASTAPI_URL = process.env.NEXT_PUBLIC_GENAI_FASTAPI_URL || "http://localhost:8001";

interface Clause {
  clause_type: string;
  clause_text: string;
}

interface Suggestion {
  clause_type: string;
  incoming_text: string;
  suggestion: string;
  severity: "Minor" | "Moderate" | "Major";
  rationale: string;
}

export async function POST(request: Request) {
  try {
    const { pdfUrl } = await request.json();

    if (!pdfUrl) {
      return NextResponse.json({ error: "Invalid request body: pdfUrl is required" }, { status: 400 });
    }

    // 1. Call the FastAPI backend to review the contract and get suggestions
    const reviewResponse = await fetch(`${FASTAPI_URL}/review-contract-llm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pdf_url: pdfUrl }),
    });

    if (!reviewResponse.ok) {
      throw new Error("Failed to review contract with LLM");
    }

    const suggestions: Suggestion[] = await reviewResponse.json();

    return NextResponse.json(suggestions);
  } catch (error) {
    console.error("Failed to review contract:", error);
    return NextResponse.json({ error: "Failed to review contract" }, { status: 500 });
  }
}