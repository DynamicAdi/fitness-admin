"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { PortableText } from "@portabletext/react"
import { likePost, unlikePost, hasUserLikedPost } from "@/lib/likes"
import { useSession } from "next-auth/react"

interface Post {
  _id: string
  title: string
  body: any[] // Sanity block content type
  likes: number
  publishedAt: string
}

export function CommunityPosts() {
  const [posts, setPosts] = useState<Post[]>([])
  const { data: session } = useSession()

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    const response = await fetch("/api/posts")
    const data = await response.json()
    setPosts(data)
  }

  const handleLike = async (postId: string) => {
    if (!session?.user?.id) return

    try {
      const hasLiked = await hasUserLikedPost(postId, session.user.id)
      if (hasLiked) {
        await unlikePost(postId, session.user.id)
        setPosts(posts.map((post) => (post._id === postId ? { ...post, likes: post.likes - 1 } : post)))
      } else {
        await likePost(postId, session.user.id)
        setPosts(posts.map((post) => (post._id === postId ? { ...post, likes: post.likes + 1 } : post)))
      }
    } catch (error) {
      console.error("Error toggling like:", error)
    }
  }

  return (
    <Card className="h-[400px] flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle>Community Posts</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto scrollbar-hide">
        <div className="space-y-4">
          {posts.map((post) => (
            <PostItem key={post._id} post={post} onLike={handleLike} userId={session?.user?.id} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

interface PostItemProps {
  post: Post
  onLike: (postId: string) => void
  userId?: string
}

function PostItem({ post, onLike, userId }: PostItemProps) {
  const [isLiked, setIsLiked] = useState(false)

  useEffect(() => {
    if (userId) {
      hasUserLikedPost(post._id, userId).then(setIsLiked)
    }
  }, [post._id, userId])

  const handleLikeClick = () => {
    onLike(post._id)
    setIsLiked(!isLiked)
  }

  return (
    <div className="rounded-lg border bg-card p-4 text-card-foreground">
      <h3 className="font-semibold mb-2">{post.title}</h3>
      <div className="mb-4">
        <PortableText value={post.body} />
      </div>
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <Button variant="ghost" size="sm" className="gap-1" onClick={handleLikeClick}>
          <Heart className={`h-4 w-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
          <span>{post.likes} likes</span>
        </Button>
        <span className="ml-auto">{formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true })}</span>
      </div>
    </div>
  )
}