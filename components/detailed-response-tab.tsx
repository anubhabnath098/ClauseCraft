"use client"

import type React from "react"

import { useState } from "react" // Removed useRef
import { Upload, AlertCircle } from "lucide-react"
import { ThinkingAnimation } from "./thinking-animation"
import { SuggestionsAndChat } from "./suggestions-and-chat"
// import { processPdfContract } from "@/lib/dummy-apis" // Removed
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadZone } from "@/components/upload-zone"; // New import
import type { Clause } from "@/lib/api"; // New import

const FASTAPI_URL = process.env.NEXT_PUBLIC_GENAI_FASTAPI_URL || "http://localhost:8001"; // New constant

interface Suggestion {
  clause_type: string;
  incoming_text: string;
  suggestion: string;
  severity: "Minor" | "Moderate" | "Major";
  rationale: string;
}

interface ResponseData {
  clauses: Clause[]
  suggestions: Suggestion[]
  sessionId: string | null
}

interface DetailedResponseTabProps {
  response: ResponseData
  setResponse: React.Dispatch<React.SetStateAction<ResponseData>>
}

export function DetailedResponseTab({ response, setResponse }: DetailedResponseTabProps) {
  const [isLoading, setIsLoading] = useState(false) // Changed from isThinking
  const [showNewChatWarning, setShowNewChatWarning] = useState(false)
  // const fileInputRef = useRef<HTMLInputElement>(null) // Removed

  const handleFilesSelected = async (files: File[]) => { // Renamed from handleFileUpload
    const file = files?.[0]
    if (!file) return;

    if (response.sessionId) {
      setShowNewChatWarning(true)
      return
    }

    await processFile(file)
  }

  const processFile = async (file: File) => {
    setIsLoading(true) // Changed from setIsThinking

    try {
      // 1. Upload files to get public URLs
      const formData = new FormData();
      formData.append("files", file);
      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("File upload failed");
      }

      const { publicUrls } = await uploadResponse.json();
      const pdfUrl = publicUrls[0]; // Assuming one file upload for now

      // 2. Call the new API route to review the contract with LLM
      const reviewResponse = await fetch("/api/review-contract-with-llm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdfUrl }),
      });

      if (!reviewResponse.ok) {
        throw new Error("Failed to get suggestions");
      }

      const suggestions: Suggestion[] = await reviewResponse.json();

      // For now, we don't have incoming clauses from this flow, so we'll use a placeholder
      const incomingClauses: Clause[] = suggestions.map(s => ({
        clause_type: s.clause_type,
        clause_text: s.incoming_text,
      }));


      setResponse({
        clauses: incomingClauses, // Update with actual extracted clauses
        suggestions: suggestions,
        sessionId: "mock-session-" + Date.now(), // Generate a new session ID
      })
      localStorage.setItem("contractSessionId", "mock-session-" + Date.now()) // Update session ID
    } catch (error: any) {
      console.error("Error processing PDF:", error)
      // Handle error display
    } finally {
      setIsLoading(false) // Changed from setIsThinking
    }
  }

  const handleNewChat = () => {
    setResponse({
      clauses: [],
      suggestions: [],
      sessionId: null,
    })
    localStorage.removeItem("contractSessionId")
    setShowNewChatWarning(false)
    // if (fileInputRef.current) { // Removed
    //   fileInputRef.current.value = ""
    // }
  }

  return (
    <div className="space-y-6">
      {showNewChatWarning && (
        <Card className="border-amber-500/50 bg-amber-500/10 p-4">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-amber-300 mb-2">New Upload Will Clear Current Analysis</h3>
              <p className="text-sm text-amber-200 mb-4">
                Uploading a new contract will delete your current suggestions and analysis. Start a new chat?
              </p>
              <div className="flex gap-3">
                <Button onClick={handleNewChat} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  New Chat
                </Button>
                <Button onClick={() => setShowNewChatWarning(false)} variant="outline" className="border-amber-500/50">
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {!response.sessionId && (
        <Card className="border-border p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            {/* Replace existing file upload UI with UploadZone */}
            <UploadZone onFilesSelected={handleFilesSelected} isLoading={isLoading} />
          </div>
        </Card>
      )}

      {isLoading && <ThinkingAnimation isVisible={true} />}

      {response.sessionId && !isLoading && ( // Changed from isThinking
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-lg bg-card border border-border">
            <div>
              <p className="text-sm text-muted-foreground">Session ID</p>
              <p className="font-mono text-sm text-accent">{response.sessionId}</p>
            </div>
            <Button
              onClick={handleNewChat}
              variant="outline"
              className="border-border text-accent hover:bg-muted bg-transparent hover:text-accent"
            >
              New Chat
            </Button>
          </div>

          <SuggestionsAndChat
            suggestions={response.suggestions}
            clauses={response.clauses}
            sessionId={response.sessionId}
          />
        </div>
      )}
    </div>
  )
}
