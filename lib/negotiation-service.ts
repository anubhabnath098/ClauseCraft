// Mock negotiation responses based on style
export async function getNegotiationResponse(
  userMessage: string,
  style: "aggressive" | "mildly_aggressive" | "friendly",
  context: string,
  gender: "male" | "female",
): Promise<{ response: string }> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const styleResponses: Record<string, (msg: string) => string> = {
    aggressive: (msg) =>
      `I strongly disagree with that point. We need better terms here. Based on what you mentioned - "${context}" - we can't accept those conditions. What specific improvements can you offer?`,
    mildly_aggressive: (msg) =>
      `That's a reasonable point, but I think we need to address some concerns. Given what you've shared about your situation, let's look for middle ground. How about we adjust this section?`,
    friendly: (msg) =>
      `I appreciate that perspective. I understand the context you mentioned. Let's work together to find a solution that works for both of us. What would be most important to you?`,
  }

  const response = styleResponses[style]?.(userMessage) || "Let's continue our negotiation with that in mind."

  return { response }
}

// Generate important points from conversation
export async function generateHighlights(conversation: string, context: string): Promise<{ highlights: string }> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 2000))

  const highlights = `KEY NEGOTIATION POINTS:

• Critical Terms: Payment conditions, liability caps, and termination clauses require careful review
• Leverage Points: Recognized context - ${context.substring(0, 100)}... should be leveraged strategically
• Risk Factors: Ensure all counter-proposals address the main concerns raised during negotiation
• Next Steps: Document all agreed terms and prepare formal amendments before signing
• Follow-up Actions: Schedule confirmation call to review final terms and clarify any ambiguities`

  return { highlights }
}
