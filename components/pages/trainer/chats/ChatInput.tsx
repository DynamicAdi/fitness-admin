"use client"

import { useRef, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface ChatInputProps {
  chatId: string
}

export default function ChatInput({ chatId }: ChatInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputRef.current || !inputRef.current.value.trim()) return

    try {
      const response = await fetch(`/api/chat/${chatId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: inputRef.current.value }),
      })

      if (response.ok) {
        inputRef.current.value = ""
        // You might want to add some state management or use websockets to update the chat in real-time
      } else {
        console.error("Failed to send message")
      }
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  if (!isClient) {
    return null // Return null on the server-side
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center">
      <Input type="text" ref={inputRef} placeholder="Type your message..." className="flex-grow mr-2" />
      <Button type="submit">Send</Button>
    </form>
  )
}