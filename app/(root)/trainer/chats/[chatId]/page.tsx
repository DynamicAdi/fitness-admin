"use client"

import React, { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { redirect, useRouter } from "next/navigation"
import ChatMessages from "@/components/pages/trainer/chats/ChatMessages"
import ChatInput from "@/components/pages/trainer/chats/ChatInput"

interface Message {
  id: string
  content: string
  createdAt: Date
  sender: {
    id: string
    name: string | null
    image: string | null
  }
}

interface Chat {
  id: string
  user: {
    name: string | null
    image: string | null
  }
  messages: Message[]
}

async function fetchInitialChat(chatId: string): Promise<Chat | null> {
  const response = await fetch(`/api/chat/${chatId}`)
  if (!response.ok) {
    throw new Error("Failed to fetch chat")
  }
  const data = await response.json()
  return data.chat
}

export default function ChatPage({ params }: { params: Promise<{ chatId: string }> }) {
  const { data: session, status } = useSession()
  const [chat, setChat] = useState<Chat | null>(null)
  const unwrappedParams = React.use(params)

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/signin")
    }
  }, [status])

  useEffect(() => {
    if (session?.user?.id) {
      fetchInitialChat(unwrappedParams.chatId).then(setChat)
    }
  }, [unwrappedParams.chatId, session?.user?.id])

  useEffect(() => {
    if (!session?.user?.id) return

    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/chat/${unwrappedParams.chatId}/messages`)
        if (response.ok) {
          const data = await response.json()
          setChat((prevChat) => {
            if (!prevChat) return null
            return { ...prevChat, messages: data.messages }
          })
        }
      } catch (error) {
        console.error("Error fetching messages:", error)
      }
    }

    const intervalId = setInterval(fetchMessages, 500)

    return () => clearInterval(intervalId)
  }, [unwrappedParams.chatId, session?.user?.id])

  if (!chat) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6 p-2 lg:ml-64">
      <h1 className="text-2xl font-bold mb-4">Chat with {chat.user.name}</h1>
      <div className="flex-grow overflow-y-auto mb-4">
        <ChatMessages messages={chat.messages} currentUserId={session?.user?.id || ""} />
      </div>
      <ChatInput chatId={chat.id} />
    </div>
  )
}