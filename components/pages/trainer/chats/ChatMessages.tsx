import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

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

interface ChatMessagesProps {
  messages: Message[]
  currentUserId: string
}

export default function ChatMessages({ messages, currentUserId }: ChatMessagesProps) {
  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.sender.id === currentUserId ? "justify-end" : "justify-start"}`}
        >
          <div className={`flex ${message.sender.id === currentUserId ? "flex-row-reverse" : "flex-row"} items-end`}>
            <Avatar className="h-8 w-8 mx-2">
              <AvatarImage src={message.sender.image || undefined} alt={message.sender.name || "User"} />
              <AvatarFallback>{message.sender.name?.[0] || "U"}</AvatarFallback>
            </Avatar>
            <div
              className={`max-w-xs px-4 py-2 rounded-lg ${
                message.sender.id === currentUserId ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
              }`}
            >
              <p>{message.content}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}