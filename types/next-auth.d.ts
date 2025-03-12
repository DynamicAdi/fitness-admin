import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email?: string | null
      image?: string | null
      role: "ADMIN" | "TRAINER" | "USER" | "SUPER_ADMIN"
      name?: string | null
      gender?: "MALE" | "FEMALE" | null
      birthDate?: Date | null
      bio?: string | null
      emailNotifications?: boolean
      smsNotifications?: boolean
    }
  }

  interface User {
    id: string
    role: "ADMIN" | "TRAINER" | "USER" | "SUPER_ADMIN"
    name?: string | null
    gender?: "MALE" | "FEMALE" | null
    birthDate?: Date | null
    bio?: string | null
    emailNotifications?: boolean
    smsNotifications?: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: "ADMIN" | "TRAINER" | "USER" | "SUPER_ADMIN"
    name?: string | null
    gender?: "MALE" | "FEMALE" | null
    birthDate?: Date | null
    bio?: string | null
    emailNotifications?: boolean
    smsNotifications?: boolean
  }
}