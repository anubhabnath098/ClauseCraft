"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"

const QUESTIONS = [
  "What type of contract do you want this playbook to focus on?\n(e.g., 'Freelance Software Development Agreement', 'Non-Disclosure Agreement', 'Vendor Supply Contract')",
  "What is the primary goal or objective of this contract?\n(e.g., 'To outline terms for ongoing IT maintenance services', 'To protect confidential information during partnership discussions')",
  "Who are the parties involved and what roles do they play?\n(e.g., 'A freelance developer and a startup client', 'A manufacturer and a wholesale distributor')",
  "What are the payment or compensation terms you prefer?\n(e.g., '50% upfront and 50% on delivery', 'Monthly fixed retainer with milestone-based bonuses')",
  "How do you want liability or risk to be handled?\n(e.g., 'Each party is responsible for its own losses', 'Limit liability to the total amount paid under the contract')",
  "How should confidentiality and data protection be addressed?\n(e.g., 'All client data must remain confidential for 2 years after termination', 'Sensitive information should not be shared without written consent')",
  "What should be the grounds and procedure for termination?\n(e.g., 'Either party may terminate with 30 days written notice', 'Immediate termination if confidentiality is breached')",
  "How do you want disputes or conflicts to be resolved?\n(e.g., 'Mediation followed by arbitration in New York', 'All disputes handled under Indian Arbitration Act 1996')",
  "Are there any specific compliance, warranty, or service level expectations?\n(e.g., 'Uptime should be 99.9% per month', 'The service must comply with GDPR regulations')",
  "Do you want to include any additional clauses or special conditions?\n(e.g., 'A non-compete clause for 6 months', 'A clause allowing for performance reviews every quarter')",
]

interface PlaybookQuestionnaireProps {
  onSubmit: (answers: Record<string, string>) => void
  isLoading: boolean
}

export function PlaybookQuestionnaire({ onSubmit, isLoading }: PlaybookQuestionnaireProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [currentAnswer, setCurrentAnswer] = useState("")

  const handleNext = () => {
    if (currentAnswer.trim()) {
      const newAnswers = {
        ...answers,
        [currentQuestionIndex]: currentAnswer,
      }
      setAnswers(newAnswers)
      setCurrentAnswer("")

      if (currentQuestionIndex < QUESTIONS.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1)
      }
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentAnswer(answers[currentQuestionIndex - 1] || "")
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleSubmit = () => {
    if (currentAnswer.trim()) {
      const finalAnswers = {
        ...answers,
        [currentQuestionIndex]: currentAnswer,
      }
      setAnswers(finalAnswers)
      onSubmit(finalAnswers)
    }
  }

  const isLastQuestion = currentQuestionIndex === QUESTIONS.length - 1
  const isAnswered = answers[currentQuestionIndex] !== undefined
  const progressPercent = ((currentQuestionIndex + 1) / QUESTIONS.length) * 100

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">
            Question {currentQuestionIndex + 1} of {QUESTIONS.length}
          </span>
          <span className="text-muted-foreground">{Math.round(progressPercent)}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground whitespace-pre-wrap">
              {QUESTIONS[currentQuestionIndex]}
            </h3>
            <Textarea
              placeholder="Type your answer here..."
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              disabled={isLoading}
              className="min-h-24"
            />
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-3 justify-between pt-4">
            <Button variant="outline" onClick={handlePrevious} disabled={currentQuestionIndex === 0 || isLoading}>
              Previous
            </Button>

            <div className="flex gap-2">
              {isLastQuestion ? (
                <Button onClick={handleSubmit} disabled={!currentAnswer.trim() || isLoading}>
                  {isLoading ? "Generating..." : "Generate Playbook"}
                </Button>
              ) : (
                <Button onClick={handleNext} disabled={!currentAnswer.trim() || isLoading}>
                  Next
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Answered Questions Summary */}
      <div className="text-sm text-muted-foreground">
        <p>
          {Object.keys(answers).length} of {QUESTIONS.length} questions answered
        </p>
      </div>
    </div>
  )
}
