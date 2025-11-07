"use client"

import { useState } from "react"
import ChatSidebar from "@/components/chat-sidebar"
import ChatWindow from "@/components/chat-window"
import { callDummyAPI } from "@/lib/dummy-apis"

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

export default function Home() {
  const [chats, setChats] = useState<Chat[]>([])
  const [activeChat, setActiveChat] = useState<string | null>(null)

  const handleSendMessage = async (content: string) => {
    let chatId = activeChat
    let currentChat = chats.find((c) => c.id === chatId)

    // If no chat exists, create one with the first message
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

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
    }

    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id === chatId) {
          return {
            ...chat,
            messages: [...chat.messages, userMessage],
          }
        }
        return chat
      }),
    )

    try {
      const sessionId = currentChat.sessionId
      const data = await callDummyAPI(content, sessionId)

      setChats((prev) =>
        prev.map((chat) => {
          if (chat.id === chatId) {
            const assistantMessage: Message = {
              id: (Date.now() + 1).toString(),
              role: "assistant",
              content: data.response,
            }
            return {
              ...chat,
              messages: [...chat.messages, assistantMessage],
              sessionId: data.sessionId,
            }
          }
          return chat
        }),
      )
    } catch (error) {
      console.error("[v0] Error generating response:", error)
    }
  }

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

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}
