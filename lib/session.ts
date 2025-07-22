import "server-only"
import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"
import type { User } from "./auth"

const secretKey = process.env.JWT_SECRET || "your-secret-key"
const encodedKey = new TextEncoder().encode(secretKey)

export async function createSession(user: User) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

  const session = await new SignJWT({ user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(encodedKey)

  const cookieStore = await cookies()
  cookieStore.set("session", session, {
    httpOnly: true,
    secure: true,
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  })
}

export async function getSession(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const session = cookieStore.get("session")?.value

    if (!session) {
      return null
    }

    const { payload } = await jwtVerify(session, encodedKey)
    return payload.user as User
  } catch (error) {
    console.error("Session verification error:", error)
    return null
  }
}

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete("session")
}
