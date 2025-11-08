// Dummy API responses for client-side processing
import {Clause as Clause_generate} from './api'
interface Clause {
  title: string
  content: string
  riskLevel: "low" | "medium" | "high"
}

interface Suggestion {
  clause: string
  suggestion: string
  priority: "low" | "medium" | "high"
}

interface ApiResponse {
  sessionId: string
  clauses: Clause[]
  suggestions: Suggestion[]
  timestamp: string
}

interface ChatResponse {
  sessionId: string
  response: string
  timestamp: string
}

// Simulate PDF to JSON conversion
export async function processPdfContract(file: File): Promise<ApiResponse> {
  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 3000))

  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  return {
    sessionId,
    clauses: [
      {
        title: "Confidentiality",
        content:
          "The Recipient agrees to maintain confidentiality of all proprietary information disclosed by the Discloser.",
        riskLevel: "low",
      },
      {
        title: "Limitation of Liability",
        content: "In no event shall either party be liable for indirect, incidental, or consequential damages.",
        riskLevel: "medium",
      },
      {
        title: "Termination for Convenience",
        content: "Either party may terminate this agreement with 30 days written notice for any reason.",
        riskLevel: "high",
      },
      {
        title: "Intellectual Property",
        content: "All work product created shall be owned by the Client.",
        riskLevel: "medium",
      },
      {
        title: "Payment Terms",
        content: "Payment is due within 30 days of invoice date. Late payments subject to 1.5% monthly interest.",
        riskLevel: "low",
      },
    ],
    suggestions: [
      {
        clause: "Confidentiality",
        suggestion:
          "Consider adding specific duration of confidentiality obligations and exceptions for publicly available information.",
        priority: "medium",
      },
      {
        clause: "Limitation of Liability",
        suggestion: "Cap may be too restrictive. Review against insurance coverage and potential exposure.",
        priority: "high",
      },
      {
        clause: "Termination for Convenience",
        suggestion: "Consider wind-down procedures and transition obligations upon termination.",
        priority: "high",
      },
      {
        clause: "Intellectual Property",
        suggestion: "Clarify ownership of pre-existing IP and derivative works.",
        priority: "medium",
      },
      {
        clause: "Payment Terms",
        suggestion: "Interest rate of 1.5% is reasonable. Ensure invoice dispute mechanism is documented.",
        priority: "low",
      },
    ],
    timestamp: new Date().toISOString(),
  }
}

// Simulate image to JSON conversion
export async function processContractImage(file: File): Promise<ApiResponse> {
  await new Promise((resolve) => setTimeout(resolve, 2000))

  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  return {
    sessionId,
    clauses: [
      {
        title: "Service Scope",
        content: "Provider shall deliver professional services as outlined in Statement of Work.",
        riskLevel: "low",
      },
      {
        title: "Warranty",
        content: "Services provided on an 'as-is' basis without warranties of any kind.",
        riskLevel: "high",
      },
      {
        title: "Indemnification",
        content: "Each party shall indemnify the other against third-party claims.",
        riskLevel: "medium",
      },
    ],
    suggestions: [
      {
        clause: "Service Scope",
        suggestion: "Add specific deliverables, timelines, and acceptance criteria.",
        priority: "high",
      },
      {
        clause: "Warranty",
        suggestion: "Consider adding limited warranty for defects and remedy period.",
        priority: "medium",
      },
      {
        clause: "Indemnification",
        suggestion: "Define what triggers indemnification and process for defense.",
        priority: "high",
      },
    ],
    timestamp: new Date().toISOString(),
  }
}

// Simulate chat follow-up questions
export async function sendChatMessage(message: string, sessionId: string): Promise<ChatResponse> {
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const responses: { [key: string]: string } = {
    confidentiality:
      "The confidentiality clause typically covers proprietary information and requires the recipient to protect it from unauthorized disclosure. You should ensure it includes specific duration and defines what qualifies as confidential information.",
    termination:
      "The termination clause allows either party to exit with 30 days notice. This is quite permissive and you may want to negotiate for specific termination fees or wind-down periods to protect your interests.",
    liability:
      "The liability limitation caps damages to prevent excessive exposure. However, ensure this aligns with your insurance and won't prevent recovery for gross negligence or willful misconduct.",
    payment:
      "Payment is due 30 days from invoice. Consider adding late payment penalties and establishing a dispute resolution process for contested invoices.",
    ip: "Intellectual property ownership is transferred to the Client. Clarify if this includes pre-existing IP and modifications, and consider retaining rights to general methodologies.",
    default:
      "This is a good question. Based on the contract analysis, I recommend reviewing all high-priority clauses and discussing these modifications with the other party before signing.",
  }

  let response = responses["default"]
  const lowerMessage = message.toLowerCase()

  for (const [key, value] of Object.entries(responses)) {
    if (lowerMessage.includes(key)) {
      response = value
      break
    }
  }

  return {
    sessionId,
    response,
    timestamp: new Date().toISOString(),
  }
}

// Simulate speech-to-text transcription (client-side)
export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  // In a real app, this would use a service like Google Cloud Speech-to-Text
  // For demo purposes, we'll return a placeholder
  return "What are the key risks in this contract?"
}

// Simulate text-to-speech
export async function synthesizeToSpeech(text: string): Promise<Blob> {
  // In a real app, this would use a TTS service
  // For now, return empty blob - actual implementation would use Web Audio API or service
  return new Blob()
}

export async function callDummyAPI(message: string, sessionId: string) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Dummy response based on user input
  const dummyResponses: Record<string, string | ((message: string) => string)> = {
    hello: "Hello! How can I help you today?",
    hi: "Hi there! What can I do for you?",
    how: "I'm doing great! Just here to chat with you.",
    help: "I can assist you with various tasks. What do you need?",
    bye: "Goodbye! Feel free to come back anytime.",
    default: (userMessage: string) =>
      `That's an interesting question: "${userMessage}". I'm a dummy API, so I'm just echoing back what you said. In a real application, I would provide a meaningful response based on your input.`,
  }

  const lowerMessage = message.toLowerCase()
  const matchedResponse = dummyResponses[lowerMessage]
  // Prefer the matched response, otherwise fall back to the default responder
  const responder = matchedResponse ?? dummyResponses.default
  const response = typeof responder === 'function' ? responder(message) : responder

  return {
    response,
    sessionId: sessionId || `session_${Date.now()}`,
  }
}


export async function generateClausesFromQuestionnaire(
  answers: Record<string, string>,
  playbookName: string,
): Promise<Clause_generate[]> {
  const questionsText = [
    "What type of contract do you want this playbook to focus on?",
    "What is the primary goal or objective of this contract?",
    "Who are the parties involved and what roles do they play?",
    "What are the payment or compensation terms you prefer?",
    "How do you want liability or risk to be handled?",
    "How should confidentiality and data protection be addressed?",
    "What should be the grounds and procedure for termination?",
    "How do you want disputes or conflicts to be resolved?",
    "Are there any specific compliance, warranty, or service level expectations?",
    "Do you want to include any additional clauses or special conditions?",
  ]

  const contextString = questionsText.map((q, idx) => `Q${idx + 1}: ${q}\nA: ${answers[idx] || ""}`).join("\n\n")

  // TODO: Call your AI/LLM service to generate clauses based on the questionnaire answers
  // For now, returning a mock response with generated clauses
  return generateMockClauses(contextString, playbookName)
}

// Mock function to generate clauses - replace with actual AI service call
function generateMockClauses(contextString: string, playbookName: string): Clause_generate[] {
  // This is a placeholder. Replace with actual LLM call
  return [
    {
      clause_type: "Parties",
      clause_text: "This agreement is entered into between the parties as described in the questionnaire responses.",
    },
    {
      clause_type: "Scope of Work",
      clause_text:
        "The primary objective and scope of work shall be as defined in the questionnaire answers regarding the contract goals.",
    },
    {
      clause_type: "Payment Terms",
      clause_text:
        "Payment shall be structured according to the compensation preferences specified in the questionnaire responses.",
    },
    {
      clause_type: "Liability and Risk",
      clause_text:
        "Each party's liability and risk allocation shall follow the framework specified in the questionnaire responses.",
    },
    {
      clause_type: "Confidentiality",
      clause_text:
        "Confidentiality and data protection measures shall be implemented as per the requirements specified in the questionnaire.",
    },
  ]
}

