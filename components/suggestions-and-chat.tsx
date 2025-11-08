"use client"

import { useState, useRef, useEffect } from "react"
import {
  Download,
  Send,
  Mic,
  Volume2,
  MessageSquare,
  FileText,
  Loader,
  ChevronDown,
  TrendingUp,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { NegotiationStyleModal } from "./negotiation-style-modal"
import { ConversationWindow } from "./conversation-window"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Packer, Paragraph, TextRun, Document } from "docx"
import { saveAs } from "file-saver"

interface Suggestion {
  clause: string
  suggestion: string
  priority: "low" | "medium" | "high"
}

interface Clause {
  title: string
  content: string
  riskLevel: "low" | "medium" | "high"
}

interface ChatMessage {
  type: "user" | "ai"
  content: string
}

interface SuggestionsAndChatProps {
  suggestions: Suggestion[]
  clauses: Clause[]
  sessionId: string | null
}

type ViewType = "suggestions" | "questions" | "clauses"

export function SuggestionsAndChat({ suggestions, clauses, sessionId }: SuggestionsAndChatProps) {
  // Existing states
  const [activeView, setActiveView] = useState<ViewType>("suggestions")
  const [isRecording, setIsRecording] = useState(false)
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)

  const chatEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)

  // Negotiation integration states
  const [showNegotiationModal, setShowNegotiationModal] = useState(false)
  const [negotiationState, setNegotiationState] = useState<{
    style: "aggressive" | "mildly_aggressive" | "friendly"
    context: string
    gender: "male" | "female"
  } | null>(null)

  const handleDownloadTxt = () => {
    const text = suggestions.map((s) => `${s.clause}\n${s.suggestion}`).join("\n\n")
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" })
    saveAs(blob, `suggestions-${Date.now()}.txt`)
  }

  const handleDownloadDocx = () => {
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: suggestions.map(
            (s) =>
              new Paragraph({
                children: [
                  new TextRun({
                    text: s.clause,
                    bold: true,
                  }),
                  new TextRun({
                    text: `\n${s.suggestion}`,
                  }),
                ],
              })
          ),
        },
      ],
    })

    Packer.toBlob(doc).then((blob) => {
      saveAs(blob, `suggestions-${Date.now()}.docx`)
    })
  }

  // Speech recognition setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = true

      recognitionRef.current.onstart = () => {
        setIsListening(true)
        setIsRecording(true)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
        setIsRecording(false)
      }

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = ""
        let finalTranscript = ""

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript

          if (event.results[i].isFinal) {
            finalTranscript += transcript + " "
          } else {
            interimTranscript += transcript
          }
        }

        if (finalTranscript) {
          setChatInput((prev) => prev + finalTranscript)
        }
      }

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error)
      }
    }
  }, [])

  useEffect(() => {
    if (!isListening && chatInput.trim() && isRecording) {
      const timer = setTimeout(() => {
        handleSendMessage()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [isListening, isRecording, chatInput])

  const priorityColors = {
    low: "bg-green-500/20 text-green-300 border-green-500/50",
    medium: "bg-yellow-500/20 text-yellow-300 border-yellow-500/50",
    high: "bg-red-500/20 text-red-300 border-red-500/50",
  }

  const riskColors = {
    low: "border-green-500/50 bg-green-500/10",
    medium: "border-yellow-500/50 bg-yellow-500/10",
    high: "border-red-500/50 bg-red-500/10",
  }

  const startRecording = async () => {
    if (!recognitionRef.current) {
      console.error("Speech Recognition not supported")
      return
    }

    setChatInput("")
    recognitionRef.current.start()
  }

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
  }

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !sessionId || isLoading) return

    const userMessage = chatInput
    setChatInput("")
    setChatMessages((prev) => [...prev, { type: "user", content: userMessage }])
    setIsLoading(true)

    try {
      const response = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage, sessionId }),
      });
      const data = await response.json();
      setChatMessages((prev) => [...prev, { type: "ai", content: data.response }])

      if (isSpeechEnabled) {
        speakText(response.response)
      }
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const speakText = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1
    window.speechSynthesis.speak(utterance)
  }

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatMessages])

  // Negotiation handling
  const handleStartNegotiation = (
    style: "aggressive" | "mildly_aggressive" | "friendly",
    context: string,
    gender: "male" | "female",
  ) => {
    setNegotiationState({ style, context, gender })
    setShowNegotiationModal(false)
  }

  const handleNewCall = () => {
    setNegotiationState(null)
    setShowNegotiationModal(true)
  }

  // If negotiation active, show conversation window
  if (negotiationState) {
    return (
      <ConversationWindow
        style={negotiationState.style}
        context={negotiationState.context}
        gender={negotiationState.gender}
        onNewCall={handleNewCall}
      />
    )
  }

  return (
    <div className="space-y-4">
      {showNegotiationModal && (
        <NegotiationStyleModal onStart={handleStartNegotiation} onCancel={() => setShowNegotiationModal(false)} />
      )}

      <div className="flex gap-2 flex-wrap">
        <Button
          onClick={() => setActiveView("suggestions")}
          variant={activeView === "suggestions" ? "default" : "outline"}
          className={cn(
            "flex items-center justify-center gap-2",
            activeView === "suggestions"
              ? "bg-primary hover:bg-primary/90 text-primary-foreground"
              : "border-border text-foreground hover:bg-muted",
          )}
        >
          <FileText className="h-4 w-4" />
          Suggestions
        </Button>
        <Button
          onClick={() => setActiveView("questions")}
          variant={activeView === "questions" ? "default" : "outline"}
          className={cn(
            "flex items-center justify-center gap-2",
            activeView === "questions"
              ? "bg-primary hover:bg-primary/90 text-primary-foreground"
              : "border-border text-foreground hover:bg-muted",
          )}
        >
          <MessageSquare className="h-4 w-4" />
          Questions
        </Button>
        <Button
          onClick={() => setActiveView("clauses")}
          variant={activeView === "clauses" ? "default" : "outline"}
          className={cn(
            "flex items-center justify-center gap-2",
            activeView === "clauses"
              ? "bg-primary hover:bg-primary/90 text-primary-foreground"
              : "border-border text-foreground hover:bg-muted",
          )}
        >
          <ChevronDown className="h-4 w-4" />
          Extracted Clauses
        </Button>
      </div>

      {/* SUGGESTIONS VIEW */}
      {activeView === "suggestions" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <span>Suggestions & Flags</span>
              <span className="text-sm text-muted-foreground">({suggestions.length})</span>
            </h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className="bg-accent hover:bg-accent/90 text-accent-foreground flex items-center gap-2"
                  size="sm"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleDownloadTxt}>Download as TXT</DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownloadDocx}>Download as DOCX</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="max-h-96 overflow-y-scroll pr-2 space-y-3">
            {suggestions.length === 0 ? (
              <Card className="p-4 text-center border-border bg-card/50">
                <p className="text-sm text-muted-foreground">No suggestions available</p>
              </Card>
            ) : (
              suggestions.map((suggestion, index) => (
                <Card key={index} className="p-3 bg-muted border border-border">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h4 className="font-semibold text-foreground">{suggestion.clause}</h4>
                    <span
                      className={cn("px-2 py-1 rounded text-xs font-medium border", priorityColors[suggestion.priority])}
                    >
                      {suggestion.priority.charAt(0).toUpperCase() + suggestion.priority.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{suggestion.suggestion}</p>
                </Card>
              ))
            )}
          </div>

          {/* Add Negotiation button here */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-center">
            <Button
              onClick={() => setShowNegotiationModal(true)}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Start Negotiation
            </Button>
          </div>
        </div>
      )}

      {/* QUESTIONS VIEW */}
      {activeView === "questions" && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Follow-up Questions
          </h3>

          <div className="max-h-96 overflow-y-auto pr-2 space-y-3">
            {chatMessages.length === 0 ? (
              <Card className="p-4 text-center border-border bg-card/50">
                <p className="text-sm text-muted-foreground">Ask your follow-up questions below...</p>
              </Card>
            ) : (
              chatMessages.map((msg, index) => (
                <div
                  key={index}
                  className={cn(
                    "p-3 rounded-lg",
                    msg.type === "user"
                      ? "bg-primary/20 text-primary ml-8 rounded-bl-none"
                      : "bg-accent/20 text-accent mr-8 rounded-br-none",
                  )}
                >
                  <p className="text-sm">{msg.content}</p>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex items-center gap-2 px-4 py-2 text-muted-foreground">
                <Loader className="h-4 w-4 animate-spin" />
                <span className="text-sm">Thinking...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input */}
          <div className="flex gap-2">
            <Input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Ask a follow-up question..."
              className="bg-card border-border text-foreground placeholder:text-muted-foreground"
              disabled={isLoading}
            />
            <Button
              onClick={() => (isRecording ? stopRecording() : startRecording())}
              variant="outline"
              className={cn(
                "border-border",
                isRecording ? "bg-red-500/20 text-red-400 border-red-500/50" : "text-foreground hover:bg-muted",
              )}
              size="icon"
              title="Record voice message"
            >
              <Mic className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={!chatInput.trim() || isLoading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              size="icon"
              title="Send message"
            >
              <Send className="h-4 w-4" />
            </Button>
            
          </div>
        </div>
      )}

      {/* CLAUSES VIEW */}
      {activeView === "clauses" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <span>Extracted Clauses</span>
              <span className="text-sm text-muted-foreground">({clauses.length})</span>
            </h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className="bg-accent hover:bg-accent/90 text-accent-foreground flex items-center gap-2"
                  size="sm"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleDownloadTxt}>Download as TXT</DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownloadDocx}>Download as DOCX</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="max-h-96 overflow-y-scroll pr-2 space-y-3">
            {clauses.length === 0 ? (
              <Card className="p-4 text-center border-border bg-card/50">
                <p className="text-sm text-muted-foreground">No clauses extracted</p>
              </Card>
            ) : (
              clauses.map((clause, index) => (
                <Card
                  key={index}
                  className={cn("p-4 border-l-4 transition-all hover:shadow-lg", riskColors[clause.riskLevel])}
                >
                  <h4 className="font-semibold text-foreground mb-2">{clause.title}</h4>
                  <p className="text-sm text-muted-foreground">{clause.content}</p>
                  <div className="mt-3 inline-block px-2 py-1 text-xs font-medium rounded bg-muted text-muted-foreground">
                    Risk Level: {clause.riskLevel.toUpperCase()}
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
