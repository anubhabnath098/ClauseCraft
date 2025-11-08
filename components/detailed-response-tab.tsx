"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, AlertCircle } from "lucide-react"
import { ThinkingAnimation } from "./thinking-animation"
import { SuggestionsAndChat } from "./suggestions-and-chat"
import { processPdfContract } from "@/lib/dummy-apis"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

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
  const [isThinking, setIsThinking] = useState(false)
  const [showNewChatWarning, setShowNewChatWarning] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (response.sessionId) {
      setShowNewChatWarning(true)
      return
    }

    await processFile(file)
  }

  const processFile = async (file: File) => {
    setIsThinking(true)

    try {
      const apiResponse = await processPdfContract(file)
      setResponse({
        clauses: apiResponse.clauses,
        suggestions: apiResponse.suggestions,
        sessionId: apiResponse.sessionId,
      })
      localStorage.setItem("contractSessionId", apiResponse.sessionId)
    } catch (error) {
      console.error("Error processing PDF:", error)
    } finally {
      setIsThinking(false)
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
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
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
            <div className="p-4 rounded-full bg-accent/20">
              <Upload className="h-8 w-8 text-accent" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Upload Contract PDF</h2>
            <p className="text-sm text-muted-foreground max-w-sm">
              Upload a contract document to get detailed analysis with clause extraction and suggestions
            </p>
            <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" />
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="bg-primary hover:bg-primary/90 text-primary-foreground mt-4"
            >
              Choose PDF File
            </Button>
          </div>
        </Card>
      )}

      {isThinking && <ThinkingAnimation isVisible={true} />}

      {response.sessionId && !isThinking && (
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
