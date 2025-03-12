"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { client } from "@/sanity/lib/client"
import { formatDistanceToNow } from "date-fns"

interface Activity {
  _id: string
  member: string
  activity: string
  post: string
  createdAt: string
}

export function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([])

  useEffect(() => {
    const fetchActivities = async () => {
      const query = `*[_type == "activity"] | order(createdAt desc)[0...5] {
        _id,
        member,
        activity,
        post,
        createdAt
      }`
      const result = await client.fetch<Activity[]>(query)
      setActivities(result)
    }

    fetchActivities()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Community Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Activity</TableHead>
              <TableHead>Post</TableHead>
              <TableHead className="text-right">Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.map((activity) => (
              <TableRow key={activity._id}>
                <TableCell>{activity.member}</TableCell>
                <TableCell>{activity.activity}</TableCell>
                <TableCell>{activity.post}</TableCell>
                <TableCell className="text-right">
                  {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}