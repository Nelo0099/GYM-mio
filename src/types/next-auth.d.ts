import NextAuth, { DefaultSession } from "next-auth"
import { AdapterUser } from "next-auth/adapters"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string | null
      role: string
    } & DefaultSession["user"]
  }

  interface User extends AdapterUser {
    role: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string
  }
}
