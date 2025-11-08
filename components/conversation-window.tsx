"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ThinkingAnimation } from "./thinking-animation"
import { Mic, Phone, Zap, Download, ToggleLeft, ToggleRight } from "lucide-react"
import { getNegotiationResponse, generateHighlights } from "@/lib/negotiation-service"
import { speakText, stopSpeech } from "@/lib/text-to-speech-service"

interface Message {
  id: string
  speaker: "user" | "bot"
  text: string
  timestamp: Date
}

interface ConversationWindowProps {
  style: "aggressive" | "mildly_aggressive" | "friendly"
  context: string
  gender: "male" | "female"
  onNewCall: () => void
}

export function ConversationWindow({ style, context, gender, onNewCall }: ConversationWindowProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isListening, setIsListening] = useState(false)
  const [isBotSpeaking, setIsBotSpeaking] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showHighlights, setShowHighlights] = useState(false)
  const [highlights, setHighlights] = useState<string>("")
  const scrollRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null)
  const isRecognitionRunningRef = useRef(false)

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) return

    recognitionRef.current = new SpeechRecognition()
    recognitionRef.current.continuous = true
    recognitionRef.current.interimResults = true
    recognitionRef.current.lang = "en-US"

    recognitionRef.current.onstart = () => {
      isRecognitionRunningRef.current = true
      setIsListening(true)
    }

    recognitionRef.current.onend = () => {
      isRecognitionRunningRef.current = false
      setIsListening(false)
    }

    recognitionRef.current.onerror = (event: any) => {
      console.log("[v0] Speech recognition error:", event.error)
      isRecognitionRunningRef.current = false
      setIsListening(false)
    }

    recognitionRef.current.onresult = async (event: any) => {
      let interimTranscript = ""
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          // Add user message
          const userMessage: Message = {
            id: `user-${Date.now()}`,
            speaker: "user",
            text: transcript,
            timestamp: new Date(),
          }
          setMessages((prev) => [...prev, userMessage])

          setIsListening(false)
          setIsBotSpeaking(true)
          if (recognitionRef.current && isRecognitionRunningRef.current) {
            recognitionRef.current.stop()
            isRecognitionRunningRef.current = false
          }

          // Get bot response using lib function
          await getBotResponse(transcript)
        } else {
          interimTranscript += transcript
        }
      }
    }

    // Start listening on mount
    if (!isRecognitionRunningRef.current) {
      recognitionRef.current.start()
      isRecognitionRunningRef.current = true
    }

    return () => {
      if (recognitionRef.current && isRecognitionRunningRef.current) {
        recognitionRef.current.abort()
        isRecognitionRunningRef.current = false
      }
      stopSpeech()
    }
  }, [])

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    if (!isBotSpeaking && !isRecognitionRunningRef.current && recognitionRef.current) {
      try {
        recognitionRef.current.start()
        isRecognitionRunningRef.current = true
      } catch (error) {
        console.log("[v0] Could not restart recognition:", error)
      }
    }
  }, [isBotSpeaking])

  const getBotResponse = async (userText: string) => {
    try {
      const result = await getNegotiationResponse(userText, style, context, gender)

      // Add bot message
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        speaker: "bot",
        text: result.response,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botMessage])

      if ("speechSynthesis" in window) {
        synthRef.current = speakText(result.response, gender, () => {
          setIsBotSpeaking(false)
        })
      } else {
        setIsBotSpeaking(false)
      }
    } catch (error) {
      console.error("Error getting bot response:", error)
      setIsBotSpeaking(false)
    }
  }

  const handleEndCall = () => {
    if (recognitionRef.current && isRecognitionRunningRef.current) {
      recognitionRef.current.stop()
      isRecognitionRunningRef.current = false
    }
    stopSpeech()
  }

  const handleCreateHighlights = async () => {
    setIsProcessing(true)

    try {
      const result = await generateHighlights(messages.map((m) => `${m.speaker}: ${m.text}`).join("\n"), context)
      setHighlights(result.highlights)
      setShowHighlights(true)
    } catch (error) {
      console.error("Error generating highlights:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = () => {
    const content = `NEGOTIATION HIGHLIGHTS\n\n${highlights}\n\nGenerated on: ${new Date().toLocaleString()}`
    const element = document.createElement("a")
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(content))
    element.setAttribute("download", `negotiation-highlights-${Date.now()}.txt`)
    element.style.display = "none"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-3xl h-[90vh] bg-card flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isListening ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
            <span className="font-semibold">{showHighlights ? "Important Points" : "Negotiation Conversation"}</span>
          </div>
          <div className="flex gap-2">
            {showHighlights && (
              <Button size="sm" variant="outline" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            )}
            {messages.length > 0 && (
              <Button size="sm" variant="outline" onClick={() => setShowHighlights(!showHighlights)}>
                {showHighlights ? <ToggleLeft className="h-4 w-4" /> : <ToggleRight className="h-4 w-4" />}
                {showHighlights ? "Chat" : "Highlights"}
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {showHighlights ? (
            // Highlights View
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {isProcessing ? (
                <ThinkingAnimation isVisible={true} />
              ) : highlights ? (
                <div className="space-y-3">
                  {highlights.split("\n").map((point, idx) => (
                    <div key={idx} className="p-3 bg-muted/50 rounded-lg border border-border">
                      <p className="text-sm">{point}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <p>No highlights yet. Click "Create Important Points" to generate them.</p>
                </div>
              )}
            </div>
          ) : (
            // Conversation View
            <>
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <p>Listening... Start speaking to begin negotiation</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.speaker === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-2 rounded-lg ${
                          msg.speaker === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                        }`}
                      >
                        <p className="text-sm">{msg.text}</p>
                        <p className="text-xs opacity-60 mt-1">
                          {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Controls */}
              <div className="p-4 border-t border-border space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mic
                      className={`h-4 w-4 ${isListening && !isBotSpeaking ? "text-green-500" : "text-muted-foreground"}`}
                    />
                    <span className="text-sm text-muted-foreground">
                      {isBotSpeaking ? "Bot speaking..." : isListening ? "Listening..." : "Waiting..."}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={handleCreateHighlights}
                    disabled={messages.length === 0 || isProcessing}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Create Important Points
                  </Button>
                  <Button onClick={handleEndCall} variant="destructive" className="px-6">
                    <Phone className="h-4 w-4 mr-2" />
                    End Call
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="p-4 border-t border-border">
          <Button onClick={onNewCall} className="w-full">
            Create New Call
          </Button>
        </div>
      </Card>
    </div>
  )
}
