"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, Shield, Zap, X } from "lucide-react"

interface NegotiationStyleModalProps {
  onStart: (
    style: "aggressive" | "mildly_aggressive" | "friendly",
    context: string,
    gender: "male" | "female",
  ) => void
  onCancel: () => void
}

export function NegotiationStyleModal({ onStart, onCancel }: NegotiationStyleModalProps) {
  const [selectedStyle, setSelectedStyle] = useState<"aggressive" | "mildly_aggressive" | "friendly" | null>(null)
  const [context, setContext] = useState("")
  const [gender, setGender] = useState<"male" | "female">("female")

  const styles = [
    {
      id: "aggressive" as const,
      name: "Aggressive",
      description: "Push hard for favorable terms, challenge assumptions.",
      icon: Zap,
      color: "border-red-500 hover:bg-muted",
    },
    {
      id: "mildly_aggressive" as const,
      name: "Mildly Aggressive",
      description: "Balanced approach: firm but open to negotiation.",
      icon: AlertCircle,
      color: "border-amber-500 hover:bg-muted",
    },
    {
      id: "friendly" as const,
      name: "Friendly",
      description: "Collaborative and solution-oriented tone.",
      icon: Shield,
      color: "border-green-500 hover:bg-muted",
    },
  ]

  const handleStart = () => {
    if (selectedStyle && context.trim()) {
      onStart(selectedStyle, context, gender)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] bg-card flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-2xl font-bold">Start Negotiation</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Choose your negotiation style and share what the other party knows.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1 hover:bg-muted rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Negotiation Style */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Negotiation Style</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {styles.map((style) => {
                const Icon = style.icon
                return (
                  <button
                    type="button"
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`p-4 border-2 rounded-lg transition-all text-left ${
                      selectedStyle === style.id
                        ? "border-primary bg-primary/10"
                        : `border-border ${style.color}`
                    }`}
                  >
                    <Icon className="h-6 w-6 mb-2" />
                    <h4 className="font-semibold">{style.name}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{style.description}</p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Gender Selection */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Negotiator Voice</h3>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setGender("female")}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all font-medium ${
                  gender === "female"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:bg-muted"
                }`}
              >
                Female
              </button>
              <button
                type="button"
                onClick={() => setGender("male")}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all font-medium ${
                  gender === "male"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:bg-muted"
                }`}
              >
                Male
              </button>
            </div>
          </div>

          {/* Context Input */}
          <div>
            <h3 className="text-lg font-semibold mb-2">What does the other party already know?</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Provide background info that might affect the negotiation strategy.
            </p>
            <Textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="E.g., We have a tight budget, this is our first contract with this vendor..."
              className="min-h-24"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border flex gap-3 justify-end shrink-0 bg-card">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleStart}
            disabled={!selectedStyle || !context.trim()}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Start Conversation
          </Button>
        </div>
      </Card>
    </div>
  )
}
