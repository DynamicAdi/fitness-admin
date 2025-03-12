"use client";
import { SessionsStats, TrainerStats, UserStats } from "@/types/user";
import { useSession } from "next-auth/react";
import { createContext, useContext, useEffect, useState } from "react";

interface AdminContextType {
  userStats: UserStats;
  trainerStats: TrainerStats;
  sessionsStats: SessionsStats;
  setSessionsStats: (stats: SessionsStats) => void;
  //   setUserStats: (stats: UserStats) => void;
}

const AdminContext = createContext<AdminContextType | null>(null);

export const AdminProvider = ({ children }: { children: React.ReactNode }) => {
  const [userStats, setUserStats] = useState<UserStats>({
    totalUsers: 0,
    activeUsers: 0,
    newUsers: 0,
    inactiveUsers: 0,
  });
  const [trainerStats, setTrainerStats] = useState<TrainerStats>({
    trainers: [],
    totalTrainers: 0,
    activeTrainers: 0,
    avgRating: 0,
    totalClients: 0,
  });
  const [sessionsStats, setSessionsStats] = useState<SessionsStats>({
    totalSessions: 0,
    activeSessions: 0,
    pendingSessions: 0,
    completionRate: 0,
  });

  const {data} = useSession()
  const user = data?.user

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userStatsResponse, trainerStatsResponse, sessionsStatsResponse] =
          await Promise.all([
            fetch("/api/users/stats"),
            fetch("/api/trainers/stats"),
            fetch("/api/schedule/stats"),
          ]);

        const [userStatsData, trainerStatsData, sessionsStatsData] =
          await Promise.all([
            userStatsResponse.json(),
            trainerStatsResponse.json(),
            sessionsStatsResponse.json(),
          ]);

        setUserStats(userStatsData);
        setTrainerStats(trainerStatsData);
        setSessionsStats(sessionsStatsData);
      } catch (error) {
        console.error("Error fetching user stats:", error);
      }
    };

    if (user?.role === "ADMIN") fetchData();
  }, [user?.role]);

  const value = {
    userStats,
    trainerStats,
    sessionsStats,
    setSessionsStats,
  };
  return (
    <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
  );
};

export const useAdminContext = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
};
