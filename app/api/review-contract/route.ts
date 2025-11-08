import { NextResponse } from "next/server";

const FASTAPI_URL = process.env.FASTAPI_URL || "http://127.0.0.1:8000";

export async function POST(request: Request) {
  try {
    const { pdfUrl } = await request.json();
    console.log("📄 Received PDF URL for review:", pdfUrl);

    if (!pdfUrl) {
      return NextResponse.json(
        { error: "No PDF URL provided" },
        { status: 400 }
      );
    }

    // ✅ Construct proper JSON payload
    const payload = {
      url: pdfUrl,
      raw_text: "",
      top_k: 2,
      use_llm_contradiction_check: true,
    };

    // ✅ Send JSON directly (no FormData)
    const response = await fetch(`${FASTAPI_URL}/analyze_contract/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    // --- Error Handling ---
    if (!response.ok) {
      let errorBody: any = {};
      try {
        errorBody = await response.json();
      } catch {
        const text = await response.text();
        console.error("❌ Backend returned non-JSON error:", text);
        throw new Error(`Backend returned ${response.status}: ${text}`);
      }

      console.error("❌ Backend returned error JSON:", errorBody);

      const detail =
        typeof errorBody.detail === "string"
          ? errorBody.detail
          : JSON.stringify(errorBody.detail || errorBody);

      throw new Error(detail || "Failed to analyze contract");
    }

    // ✅ Parse backend response
    const data = await response.json();
    console.log("✅ Contract analyzed successfully:", data);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("🚨 Failed to review contract:", error.message || error);
    return NextResponse.json(
      { error: error.message || "Failed to review contract" },
      { status: 500 }
    );
  }
}
