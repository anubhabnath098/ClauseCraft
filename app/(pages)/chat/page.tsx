"use client"

import { useState } from "react"
import ChatSidebar from "@/components/chat-sidebar"
import ChatWindow from "@/components/chat-window"

export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

export interface Chat {
  id: string
  title: string
  sessionId: string
  messages: Message[]
  createdAt: Date
}

export default function ChatPage() {
  const [chats, setChats] = useState<Chat[]>([])
  const [activeChat, setActiveChat] = useState<string | null>(null)

  // ---------------- Handle Sending Message ----------------
  const handleSendMessage = async (content: string) => {
    let chatId = activeChat
    let currentChat = chats.find((c) => c.id === chatId)

    // If no chat open, create a new one
    if (!chatId) {
      const newChat: Chat = {
        id: Date.now().toString(),
        title: content.substring(0, 50),
        sessionId: generateSessionId(),
        messages: [],
        createdAt: new Date(),
      }
      chatId = newChat.id
      currentChat = newChat
      setChats((prev) => [newChat, ...prev])
      setActiveChat(newChat.id)
    }

    if (!currentChat) return

    // add user message
    const userMessage: Message = { id: Date.now().toString(), role: "user", content }
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId ? { ...chat, messages: [...chat.messages, userMessage] } : chat,
      ),
    )

    // ---------------- Call backend /chat endpoint ----------------
    try {
      const response = await fetch("http://localhost:8000/chat/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content, sessionId: currentChat.sessionId }),
      })

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || "(No response from AI)",
      }

      setChats((prev) =>
        prev.map((chat) =>
          chat.id === chatId
            ? { ...chat, messages: [...chat.messages, assistantMessage], sessionId: data.sessionId }
            : chat,
        ),
      )
    } catch (error) {
      console.error("❌ Error communicating with backend:", error)
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: "assistant",
        content: "⚠️ Unable to connect to AI backend. Please try again later.",
      }
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === chatId ? { ...chat, messages: [...chat.messages, errorMessage] } : chat,
        ),
      )
    }
  }

  // ---------------- Delete Chat ----------------
  const handleDeleteChat = (chatId: string) => {
    setChats((prev) => prev.filter((c) => c.id !== chatId))
    if (activeChat === chatId) {
      setActiveChat(chats.length > 1 ? chats[0].id : null)
    }
  }

  const currentChat = chats.find((c) => c.id === activeChat)

  return (
    <div className="flex h-screen bg-background">
      <ChatSidebar
        chats={chats}
        activeChat={activeChat}
        onSelectChat={setActiveChat}
        onNewChat={() => setActiveChat(null)}
        onDeleteChat={handleDeleteChat}
      />
      <ChatWindow chat={currentChat} onSendMessage={handleSendMessage} />
    </div>
  )
}

// helper
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}
