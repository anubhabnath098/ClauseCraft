"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface Suggestion {
  clause: string
  suggestion: string
  priority: "low" | "medium" | "high"
}

interface CollapsibleSuggestionsProps {
  suggestions: Suggestion[]
}

export function CollapsibleSuggestions({ suggestions }: CollapsibleSuggestionsProps) {
  const [isOpen, setIsOpen] = useState(true)

  const priorityColors = {
    low: "bg-green-500/20 text-green-300 border-green-500/50",
    medium: "bg-yellow-500/20 text-yellow-300 border-yellow-500/50",
    high: "bg-red-500/20 text-red-300 border-red-500/50",
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted transition-colors"
      >
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <span>Suggestions & Flags</span>
          <span className="text-sm text-muted-foreground">({suggestions.length})</span>
        </h3>
        {isOpen ? <ChevronUp className="h-5 w-5 text-accent" /> : <ChevronDown className="h-5 w-5 text-accent" />}
      </button>

      {isOpen && (
        <div className="max-h-96 overflow-y-scroll">
          <div className="space-y-3 p-4">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="p-3 rounded-lg bg-muted border-l-4 border-accent">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h4 className="font-semibold text-foreground">{suggestion.clause}</h4>
                  <span
                    className={cn("px-2 py-1 rounded text-xs font-medium border", priorityColors[suggestion.priority])}
                  >
                    {suggestion.priority.charAt(0).toUpperCase() + suggestion.priority.slice(1)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{suggestion.suggestion}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
