"use client";
import { TodaySchedule, Trainer, UserStats } from "@/types/user";
import { useSession } from "next-auth/react";
import { createContext, useContext, useEffect, useState } from "react";

interface TrainerContextType {
  trainer: Trainer | null;
  todaySchedule: TodaySchedule[] | [];
    userStats: UserStats;
    activePrograms: number;
}

const TrainerContext = createContext<TrainerContextType | null>(null);

export const TrainerProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [trainer, setTrainer] = useState<Trainer | null>(null);
  const [todaySchedule, setTodaySchedule] = useState<TodaySchedule[] | []>([]);
  const { data } = useSession();
  const user = data?.user;
  const [userStats, setUserStats] = useState<UserStats>({
    totalUsers: 0,
    activeUsers: 0,
    newUsers: 0,
    inactiveUsers: 0,
  });
  const [activePrograms, setActivePrograms] = useState(0);

  useEffect(() => {
    const fetchTrainer = async () => {
      try {
        const [trainerResponse, todayScheduleResponse, userStatsResponse, activeProgramsResponse] =
          await Promise.all([
            fetch("/api/user/details"),
            fetch("/api/schedule/today"),
            fetch("/api/users/stats"),
            fetch("/api/programs/count-active"),
          ]);

        const [trainerData, todayScheduleData, userStatsData, activeProgramsData] = await Promise.all([
          trainerResponse.json(),
          todayScheduleResponse.json(),
          userStatsResponse.json(),
          activeProgramsResponse.json(),
        ]);

        setTrainer(trainerData);
        setTodaySchedule(todayScheduleData.schedules);
        setUserStats(userStatsData);
        setActivePrograms(activeProgramsData.activePrograms);
      } catch (error) {
        console.error("Error fetching user stats:", error);
      }
    };

    if (user?.role === "TRAINER") {
      fetchTrainer();
    }
  }, [user?.role]);

  const value = {
    trainer,
    todaySchedule,
    userStats,
    activePrograms,
  };
  return (
    <TrainerContext.Provider value={value}>{children}</TrainerContext.Provider>
  );
};

export const useTrainerContext = () => {
  const context = useContext(TrainerContext);
  if (!context) {
    throw new Error("useTrainer must be used within a TrainerProvider");
  }
  return context;
};
