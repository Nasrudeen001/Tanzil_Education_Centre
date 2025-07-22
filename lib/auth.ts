import bcrypt from "bcryptjs"
import { sql } from "./db"

export interface User {
  id: number
  username: string
  role: "admin" | "staff" | "student"
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function authenticateUser(username: string, password: string): Promise<User | null> {
  try {
    // Special handling for the admin credentials
    if (username === "tanzileducationcenter@gmail.com" && password === "Markaz_001") {
      // Check if admin user exists in database
      const adminUsers = await sql`
        SELECT id, username, password, role 
        FROM users 
        WHERE username = ${username} AND role = 'admin'
      `

      if (adminUsers.length > 0) {
        const adminUser = adminUsers[0]
        // Verify the stored password
        const isValid = await verifyPassword(password, adminUser.password)
        if (isValid) {
          return {
            id: adminUser.id,
            username: adminUser.username,
            role: adminUser.role as "admin" | "staff" | "student",
          }
        }
      }

      // If admin doesn't exist or password doesn't match, create/update admin user
      const hashedPassword = await hashPassword(password)

      // Delete existing admin and create new one
      await sql`DELETE FROM users WHERE username = ${username} OR role = 'admin'`

      const newAdminResult = await sql`
        INSERT INTO users (username, password, role, created_at, updated_at) 
        VALUES (${username}, ${hashedPassword}, 'admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id, username, role
      `

      if (newAdminResult.length > 0) {
        const newAdmin = newAdminResult[0]
        return {
          id: newAdmin.id,
          username: newAdmin.username,
          role: newAdmin.role as "admin" | "staff" | "student",
        }
      }
    }

    // Regular authentication for other users
    const users = await sql`
      SELECT id, username, password, role 
      FROM users 
      WHERE username = ${username}
    `

    if (users.length === 0) {
      return null
    }

    const user = users[0]
    const isValid = await verifyPassword(password, user.password)

    if (!isValid) {
      return null
    }

    return {
      id: user.id,
      username: user.username,
      role: user.role as "admin" | "staff" | "student",
    }
  } catch (error) {
    console.error("Authentication error:", error)
    return null
  }
}

export async function generateStaffId(category: "teaching" | "non_teaching"): Promise<string> {
  const counterType = category === "teaching" ? "teaching_staff" : "non_teaching_staff"
  const prefix = category === "teaching" ? "TSP124" : "TSP125"

  // Get and increment counter
  await sql`
    UPDATE id_counters 
    SET current_value = current_value + 1 
    WHERE counter_type = ${counterType}
  `

  const result = await sql`
    SELECT current_value 
    FROM id_counters 
    WHERE counter_type = ${counterType}
  `

  const counter = result[0].current_value
  const paddedCounter = counter.toString().padStart(4, "0")

  return `${prefix}/${paddedCounter}`
}

export async function generateAdmissionNumber(category: "tahfidh" | "integrated" | "talim"): Promise<string> {
  const counterType = `${category}_student`
  let prefix = ""

  switch (category) {
    case "tahfidh":
      prefix = "TPP214"
      break
    case "integrated":
      prefix = "TPP215"
      break
    case "talim":
      prefix = "TPP216"
      break
  }

  // Get and increment counter
  await sql`
    UPDATE id_counters 
    SET current_value = current_value + 1 
    WHERE counter_type = ${counterType}
  `

  const result = await sql`
    SELECT current_value 
    FROM id_counters 
    WHERE counter_type = ${counterType}
  `

  const counter = result[0].current_value
  const paddedCounter = counter.toString().padStart(4, "0")

  return `${prefix}/${paddedCounter}`
}
