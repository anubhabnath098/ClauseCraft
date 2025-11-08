// Mock negotiation responses based on style
export async function getNegotiationResponse(
  userText: string,
  style: "aggressive" | "mildly_aggressive" | "friendly",
  context: string,
  gender: "male" | "female"
) {
  try {
    const res = await fetch("http://localhost:8000/negotiate/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: userText,
        style,
        context,
        gender,
      }),
    });

    if (!res.ok) throw new Error(`Backend error: ${res.status}`);
    const data = await res.json();
    return data; // { sessionId, response, retrieved_clauses, conversation_length }
  } catch (err) {
    console.error("Error in getNegotiationResponse:", err);
    return { response: "⚠️ Could not connect to negotiation API." };
  }
}


// Generate important points from conversation
export async function generateHighlights(conversation: string, context: string) {
  try {
    const res = await fetch("http://localhost:8000/create_highlights/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversation, context }),
    })

    if (!res.ok) throw new Error(`Backend error: ${res.status}`)
    const data = await res.json()
    return data // { sessionId, highlights }
  } catch (err) {
    console.error("Error in generateHighlights:", err)
    return { highlights: "⚠️ Failed to generate important points. Please try again." }
  }
}

