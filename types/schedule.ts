export type ScheduleStatus =
  | "pending"
  | "requested"
  | "completed"



export interface Schedule {
  id: string;
  date: Date;
  startTime: Date;
  endTime: Date;
  scheduleLink?: string;
  scheduleSubject: string;
  scheduleDescription?: string;
  sessionType?: string
  status: ScheduleStatus;
  userId: string;
  trainerId: string;
  user: {
    name: string | null;
    gender?: "MALE" | "FEMALE" | null;
    birthDate?: Date | null;
  };
  trainer: {
    name: string | null;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateScheduleDTO {
  date: string;
  startTime: string;
  endTime: string;
  scheduleLink?: string;
  scheduleSubject: string;
  scheduleDescription?: string;
  sessionType?: string;
  trainerId?: string;
}

export interface UpdateScheduleDTO {
  date?: string;
  startTime?: string;
  endTime?: string;
  scheduleLink?: string;
  scheduleSubject?: string;
  scheduleDescription?: string;
}

export interface DaySchedule {
  date: string;
  events: {
    title: string;
    time: string;
    type: "yoga" | "hiit";
  }[];
}

export interface ScheduleItem {
  title: string;
  startTime: string;
  endTime: string;
}

export interface Session {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  scheduleSubject: string;
  scheduleLink?: string;
  status: string;
  trainer: any
  user: {
    name: string;
    image: string;
  };
}