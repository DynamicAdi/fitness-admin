"use client"

import { useState, useEffect } from "react"
import { Dumbbell, Star, Users, Users2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CommunityPost } from "./components/community-post"
import { UnifiedStatCard } from "@/components/pages/components/unified-stat-card"
import { useAdminContext } from "@/context/admin"
import { client } from "@/sanity/lib/client"
import { useRouter } from "next/navigation"

interface Post {
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

export default function Community() {
  const [posts, setPosts] = useState<Post[]>([])
  const { trainerStats } = useAdminContext()
  const router = useRouter()

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    const query = `*[_type == "blog"] | order(publishedAt desc) {
      _id,
      title,
      author->{name, image},
      publishedAt,
      body,
      likes,
    }`
    const result = await client.fetch<Post[]>(query)
    setPosts(result)
  }

  return (
    <div className="flex-1 space-y-8 p-8 lg:ml-64">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <UnifiedStatCard
          title="Total Trainers"
          value={trainerStats.totalTrainers.toString()}
          icon={Dumbbell}
          className="bg-blue-600 dark:bg-blue-700"
        />
        <UnifiedStatCard
          title="Active Trainers"
          value={trainerStats.activeTrainers.toString()}
          icon={Users2}
          className="bg-green-600 dark:bg-green-700"
        />
        <UnifiedStatCard
          title="Avg Rating"
          value={trainerStats.avgRating.toFixed(1)}
          icon={Star}
          className="bg-amber-600 dark:bg-amber-700"
        />
        <UnifiedStatCard
          title="Total Clients"
          value={trainerStats.totalClients.toString()}
          icon={Users}
          className="bg-purple-600 dark:bg-purple-700"
        />
      </div>

      <div className="space-y-4">
        <div className="lg:flex items-center justify-between">
          <h2 className="text-2xl font-bold mb-5 lg:mb-0">Community Management</h2>
          <div className="flex items-center gap-4">
            <Input placeholder="Search posts..." className="w-[300px]" />
            <Button className="bg-blue-600 dark:bg-blue-700" onClick={() => router.push("/studio")}>
              + New Post
            </Button>
          </div>
        </div>

        <div className=" grid gap-2 lg:grid-cols-2">
          {posts.map((post) => (
            <CommunityPost key={post._id} {...post} />
          ))}
        </div>
      </div>
    </div>
  )
}