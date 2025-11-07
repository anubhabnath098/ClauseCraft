"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Chat } from "@/app/(pages)/chat/page"

interface ChatWindowProps {
  chat: Chat | undefined
  onSendMessage: (message: string) => void
}

export default function ChatWindow({ chat, onSendMessage }: ChatWindowProps) {
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    setIsLoading(true)
    const userInput = input
    setInput("")

    await onSendMessage(userInput)
    setIsLoading(false)
  }

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {!chat || chat.messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-3xl font-bold text-foreground mb-2">Welcome to ClauseCraft AI</h1>
              <p className="text-muted-foreground">Ask questions about any clause in your organization</p>
            </div>
            {/* Input Form - Placed above middle when no chat */}
            <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-2xl px-4">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                disabled={isLoading}
                className="flex-1 px-4 py-2 rounded-lg bg-input text-foreground placeholder-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
              />
              <Button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
              >
                {isLoading ? "Sending..." : "Send"}
              </Button>
            </form>
          </div>
        ) : (
          chat.messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-2xl px-4 py-2 rounded-lg ${
                  message.role === "user" ? "bg-primary text-primary-foreground" : "bg-card text-card-foreground"
                }`}
              >
                <p className="text-sm">{message.content}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input Form - Only shown at bottom when chat has messages */}
      {chat && chat.messages.length > 0 && (
        <div className="border-t border-border p-4 bg-background">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1 px-4 py-2 rounded-lg bg-input text-foreground placeholder-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
            >
              {isLoading ? "Sending..." : "Send"}
            </Button>
          </form>
        </div>
      )}
    </div>
  )
}
