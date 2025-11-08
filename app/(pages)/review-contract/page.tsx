"use client"

import { useState } from "react"
import { DetailedResponseTab } from "@/components/detailed-response-tab"
import { QuickResponseTab } from "@/components/quick-response-tab"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

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

export default function Home() {
  const [activeTab, setActiveTab] = useState<"detailed" | "quick">("detailed")
  const [detailedResponse, setDetailedResponse] = useState<ResponseData>({
    clauses: [],
    suggestions: [],
    sessionId: null,
  })
  const [quickResponse, setQuickResponse] = useState<ResponseData>({
    clauses: [],
    suggestions: [],
    sessionId: null,
  })

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold gradient-gemini-text">Contract Review AI</h1>
          <p className="text-muted-foreground">
            Analyze contracts with detailed clause extraction and quick image scanning
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("detailed")}
            className={cn(
              "px-6 py-3 rounded-lg font-medium transition-all",
              activeTab === "detailed"
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border text-foreground hover:bg-muted",
            )}
          >
            Detailed Response
          </button>
          <button
            onClick={() => setActiveTab("quick")}
            className={cn(
              "px-6 py-3 rounded-lg font-medium transition-all",
              activeTab === "quick"
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border text-foreground hover:bg-muted",
            )}
          >
            Quick Response
          </button>
        </div>

        {/* Tab Content */}
        <Card className="border-border bg-card p-6">
          {activeTab === "detailed" && (
            <DetailedResponseTab response={detailedResponse} setResponse={setDetailedResponse} />
          )}
          {activeTab === "quick" && <QuickResponseTab response={quickResponse} setResponse={setQuickResponse} />}
        </Card>
      </div>
    </main>
  )
}
