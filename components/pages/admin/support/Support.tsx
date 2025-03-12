"use client";
import { AlertCircle, MessageCircle, Users } from "lucide-react";

import { UnifiedStatCard } from "@/components/pages/components/unified-stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { ChatEntry } from "./components/chat-entry";
import { ChatMonitor } from "./components/chat-monitor";

export interface AllChatResponse {
  id: string;
  user: {
    name: string;
    image: string | null;
  };
  trainer: {
    name: string;
    image: string | null;
  };
  messages: {
    id: string;
    content: string;
    createdAt: string;
  }[];
}

export interface TrainerDetailsWithCounts {
  trainerName: string;
  trainerImage: string | null;
  userCount: number;
}

export default function DashboardPage() {
  const [allChat, setAllChat] = useState<AllChatResponse[] | []>([]);
  const [trainerDetailsWithCounts, setTrainerDetailsWithCounts] = useState<
    TrainerDetailsWithCounts[] | []
  >([]);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await fetch("/api/help/admin");
        const { chats, trainerDetailsWithCounts } = await response.json();
        setAllChat(chats);
        setTrainerDetailsWithCounts(trainerDetailsWithCounts);
      } catch (error) {
        console.error(error);
      }
    };

    fetchChats();
  }, []);
  return (
    <div className="space-y-8 p-8 lg:ml-64">
      {/* <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric) => (
          <UnifiedStatCard key={metric.title} {...metric} />
        ))}
      </div> */}
      <p className="text-2xl"><strong>Chat Monitoring System</strong></p>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Active Chats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {trainerDetailsWithCounts.length > 0 ? (
              trainerDetailsWithCounts.map((chat) => (
                <ChatEntry
                  key={chat.trainerName}
                  trainerDetailsWithCounts={chat}
                />
              ))
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <p>No active chats found</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Chat Monitor & Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {allChat.length > 0 ? (
              allChat.map((chat) => <ChatMonitor key={chat.id} chat={chat} />)
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <p>No active chats found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
