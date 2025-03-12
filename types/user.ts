export type UserStatus = "active" | "pending" | "inactive";
export type MembershipType = "basic" | "premium";

export interface User {
  id: string;
  name: string;
  email: string;
  status: UserStatus;
  membership: MembershipType;
  lastActive: string;
  avatarUrl?: string;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  inactiveUsers: number;
}

export interface Trainer {
  id: string;
  name: string;
  email: string;
  trainerSchedules: [];
  clients: {
    id: string;
    name: string;
    program?: {
      currentProgress: number;
      status: string;
    };
  }[];
  sessions: [];
}

export interface TrainerStats {
  trainers: {
    rating: null;
    clientsCount: number;
    name: string;
    status: UserStatus;
    sessions: [];
  }[];
  totalTrainers: number;
  activeTrainers: number;
  avgRating: number;
  totalClients: number;
}

export interface SessionsStats {
  totalSessions: number;
  activeSessions: number;
  pendingSessions: number;
  completionRate: number;
}

interface ScheduleTrainer {
  name: string;
}
interface ScheduleUser {
  name: string;
}

export interface TodaySchedule {
  id: string;
  date: string; // ISO 8601 date string
  startTime: string; // ISO 8601 date string
  endTime: string; // ISO 8601 date string
  scheduleLink: string | null;
  scheduleSubject: string;
  scheduleDescription: string;
  sessionType: string | null;
  status: string;
  userId: string;
  trainerId: string;
  createdAt: string; // ISO 8601 date string
  updatedAt: string; // ISO 8601 date string
  user: ScheduleUser;
  trainer: ScheduleTrainer;
}
