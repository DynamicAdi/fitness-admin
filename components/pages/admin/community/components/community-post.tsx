"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { PortableText } from "@portabletext/react"
import { likePost, unlikePost, hasUserLikedPost } from "@/lib/likes"
import { useSession } from "next-auth/react"

interface CommunityPostProps {
  _id: string
  title: string
  author: {
    name: string
    image?: string
  }
  publishedAt: string
  body: any[] // Sanity block content type
  likes: number
}

export function CommunityPost({ _id, title, author, publishedAt, body, likes: initialLikes }: CommunityPostProps) {
  const [likes, setLikes] = useState(initialLikes)
  const [isLiked, setIsLiked] = useState(false)
  const timeAgo = formatDistanceToNow(new Date(publishedAt), { addSuffix: true })
  const { data: session } = useSession()

  useEffect(() => {
    const checkLikeStatus = async () => {
      if (session?.user?.id) {
        const liked = await hasUserLikedPost(_id, session.user.id)
        setIsLiked(liked)
      }
    }
    checkLikeStatus()
  }, [_id, session?.user?.id])

  const handleLike = async () => {
    if (!session?.user?.id) return

    try {
      if (isLiked) {
        await unlikePost(_id, session.user.id)
        setLikes((prevLikes) => prevLikes - 1)
        setIsLiked(false)
      } else {
        await likePost(_id, session.user.id)
        setLikes((prevLikes) => prevLikes + 1)
        setIsLiked(true)
      }
    } catch (error) {
      console.error("Error handling like:", error)
    }
  }

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-start gap-3">
        <Avatar>
          <AvatarImage src={author.image} alt={author.name} />
          <AvatarFallback>{author.name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">{author.name}</h4>
              <p className="text-sm text-muted-foreground">{timeAgo}</p>
            </div>
          </div>
          <h3 className="mt-2 font-semibold">{title}</h3>
          <div className="mt-2">
            <PortableText value={body} />
          </div>
          <div className="mt-4 flex items-center gap-4">
            <Button variant="ghost" size="sm" className={`gap-1 ${isLiked ? "text-red-500 hover:text-red-500" : ""}`} onClick={handleLike}>
              <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
              {likes}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}