"use client"

import { useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { isAdmin, saveUser, getUser } from "@/lib/store"
import type { User } from "@/lib/types"

export default function AuthCompletePage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const data = searchParams.get("data")
    if (data) {
      try {
        const userData = JSON.parse(decodeURIComponent(data))
        
        // Check if user exists and get their skill level
        const existingUser = getUser(userData.discordId)
        
        const user: User = {
          id: userData.discordId,
          discordId: userData.discordId,
          discordUsername: userData.discordUsername,
          discordAvatar: userData.discordAvatar,
          skillLevel: existingUser?.skillLevel || "Intermediate",
          isAdmin: isAdmin(userData.discordUsername),
        }

        // Save user to storage
        saveUser(user)
        localStorage.setItem("ns_current_user", JSON.stringify(user))

        // Redirect to home
        router.push("/")
      } catch (error) {
        console.error("Failed to parse user data:", error)
        router.push("/?error=parse_failed")
      }
    } else {
      router.push("/?error=no_data")
    }
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-foreground">Completing login...</p>
      </div>
    </div>
  )
}
