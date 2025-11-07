"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Camera, Upload, Loader } from "lucide-react"
import { processContractImage } from "@/lib/dummy-apis"
import { SuggestionsAndChat } from "./suggestions-and-chat"
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

interface QuickResponseTabProps {
  response: ResponseData
  setResponse: React.Dispatch<React.SetStateAction<ResponseData>>
}

export function QuickResponseTab({ response, setResponse }: QuickResponseTabProps) {
  const [isCapturing, setIsCapturing] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [cameraActive, setCameraActive] = useState(false)
  const [captureCountdown, setCaptureCountdown] = useState(5)
  const [thinkingMessages, setThinkingMessages] = useState<string[]>([])

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const messageIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const thinkingMessagesPool = [
    "Scanning document boundaries...",
    "Analyzing contract clauses...",
    "Extracting key terms...",
    "Identifying risk factors...",
    "Compiling suggestions...",
    "Processing fine print...",
    "Evaluating liability clauses...",
    "Checking payment terms...",
    "Reviewing termination conditions...",
    "Flagging potential issues...",
  ]

  const startThinkingAnimation = () => {
    setThinkingMessages([])
    const messages: string[] = []

    messageIntervalRef.current = setInterval(() => {
      const randomMsg = thinkingMessagesPool[Math.floor(Math.random() * thinkingMessagesPool.length)]
      messages.unshift(randomMsg)
      if (messages.length > 4) {
        messages.pop()
      }
      setThinkingMessages([...messages])
    }, 1200)
  }

  const stopThinkingAnimation = () => {
    if (messageIntervalRef.current) {
      clearInterval(messageIntervalRef.current)
      messageIntervalRef.current = null
    }
    setThinkingMessages([])
  }

  const startCamera = async () => {
    setCameraActive(true)
    setIsCapturing(true)
    setCaptureCountdown(5)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }

      startThinkingAnimation()

      countdownIntervalRef.current = setInterval(() => {
        setCaptureCountdown((prev) => {
          if (prev <= 1) {
            if (countdownIntervalRef.current) {
              clearInterval(countdownIntervalRef.current)
            }
            captureImage()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (error) {
      console.error("Error accessing camera:", error)
      setCameraActive(false)
      setIsCapturing(false)
      stopThinkingAnimation()
    }
  }

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d")
      if (context && videoRef.current.videoWidth > 0) {
        canvasRef.current.width = videoRef.current.videoWidth
        canvasRef.current.height = videoRef.current.videoHeight
        context.drawImage(videoRef.current, 0, 0)

        canvasRef.current.toBlob(async (blob) => {
          if (blob) {
            const file = new File([blob], "capture.jpg", { type: "image/jpeg" })

            if (streamRef.current) {
              streamRef.current.getTracks().forEach((track) => track.stop())
              streamRef.current = null
            }

            setCameraActive(false)
            setIsCapturing(false)
            await processImage(file)
          }
        })
      }
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setIsProcessing(true)
      startThinkingAnimation()
      await processImage(file)
    }
  }

  const processImage = async (file: File) => {
    try {
      const apiResponse = await processContractImage(file)
      setResponse({
        clauses: apiResponse.clauses,
        suggestions: apiResponse.suggestions,
        sessionId: apiResponse.sessionId,
      })
      localStorage.setItem("quickSessionId", apiResponse.sessionId)
    } catch (error) {
      console.error("Error processing image:", error)
    } finally {
      setIsProcessing(false)
      stopThinkingAnimation()
    }
  }

  const handleDownloadSuggestions = () => {
    const content =
      `CONTRACT QUICK REVIEW - SUGGESTIONS AND FLAGS\n\nSession ID: ${response.sessionId}\nGenerated: ${new Date().toLocaleDateString()}\n\n${"=".repeat(50)}\n\n` +
      response.suggestions
        .map((s) => `CLAUSE: ${s.clause}\nPRIORITY: ${s.priority.toUpperCase()}\n${s.suggestion}\n\n`)
        .join("")

    const element = document.createElement("a")
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(content))
    element.setAttribute("download", `quick-suggestions-${response.sessionId}.txt`)
    element.style.display = "none"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleNewChat = () => {
    setResponse({
      clauses: [],
      suggestions: [],
      sessionId: null,
    })
    localStorage.removeItem("quickSessionId")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current)
      }
      if (messageIntervalRef.current) {
        clearInterval(messageIntervalRef.current)
      }
    }
  }, [])

  return (
    <div className="space-y-6">
      {!response.sessionId ? (
        <div className="space-y-4">
          {/* Upload Interface */}
          {!cameraActive && (
            <Card className="border-border p-8 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 rounded-full bg-accent/20">
                  <Camera className="h-8 w-8 text-accent" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">Scan or Upload Contract Image</h2>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Use your camera to scan a contract page or upload an image for quick analysis
                </p>

                <div className="flex gap-3 mt-4">
                  <Button
                    onClick={startCamera}
                    disabled={isCapturing || isProcessing}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2"
                  >
                    <Camera className="h-4 w-4" />
                    {isCapturing ? "Capturing..." : "Start Camera"}
                  </Button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="border-border text-foreground hover:bg-muted flex items-center gap-2"
                    disabled={isProcessing}
                  >
                    <Upload className="h-4 w-4" />
                    Upload Image
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Camera Preview */}
          {cameraActive && (
            <Card className="border-border p-4">
              <div className="relative rounded-lg overflow-hidden bg-black">
                <video ref={videoRef} autoPlay playsInline className="w-full aspect-video object-cover" />
                <div className="absolute inset-0 border-2 border-accent opacity-50 pointer-events-none" />
                <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                  <div className="bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-medium">
                    Capturing in {captureCountdown}s
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Thinking Animation for Image Processing */}
          {isProcessing && (
            <Card className="border-border p-4">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    <div className="w-2 h-2 bg-accent rounded-full animate-pulse" style={{ animationDelay: "0.2s" }} />
                    <div className="w-2 h-2 bg-chart-3 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }} />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">Processing image...</span>
                </div>

                <div className="rounded-lg bg-muted border border-border p-4 min-h-32 space-y-2 overflow-hidden">
                  {thinkingMessages.length === 0 ? (
                    <div className="flex items-center justify-center h-20 text-muted-foreground">
                      <Loader className="h-5 w-5 mr-2 text-accent animate-spin" />
                      <span className="text-sm">Initializing analysis...</span>
                    </div>
                  ) : (
                    thinkingMessages.map((message, index) => (
                      <div
                        key={index}
                        className={`text-sm transition-all duration-500 ${
                          index === 0 ? "text-foreground opacity-100 animate-pulse" : "text-muted-foreground opacity-60"
                        }`}
                      >
                        <span className="text-accent mr-2">›</span>
                        {message}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </Card>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-lg bg-card border border-border">
            <div>
              <p className="text-sm text-muted-foreground">Session ID</p>
              <p className="font-mono text-xs text-accent">{response.sessionId}</p>
            </div>
            <Button
              onClick={handleNewChat}
              variant="outline"
              className="border-border text-accent hover:bg-muted bg-transparent"
            >
              New Scan
            </Button>
          </div>

          <SuggestionsAndChat
            suggestions={response.suggestions}
            clauses={response.clauses}
            sessionId={response.sessionId}
            onDownload={handleDownloadSuggestions}
          />
        </div>
      )}
    </div>
  )
}
