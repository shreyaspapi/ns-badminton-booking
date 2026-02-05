"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { isAdmin, saveUser, getUser } from "@/lib/store"
import type { User } from "@/lib/types"

export default function AuthCompletePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState("Completing login...")

  useEffect(() => {
    const completeAuth = async () => {
      const data = searchParams.get("data")
      if (data) {
        try {
          setStatus("Verifying your account...")
          const userData = JSON.parse(decodeURIComponent(data))
          
          // Check if user exists and get their skill level
          const existingUser = await getUser(userData.discordId)
          
          // Check if user is admin
          const userIsAdmin = await isAdmin(userData.discordUsername)
          
          const user: User = {
            id: userData.discordId,
            discordId: userData.discordId,
            discordUsername: userData.discordUsername,
            discordAvatar: userData.discordAvatar,
            skillLevel: existingUser?.skillLevel,
            isAdmin: userIsAdmin,
            hasCompletedOnboarding: existingUser?.hasCompletedOnboarding || false,
          }

          setStatus("Saving your profile...")
          // Save user to storage
          await saveUser(user)
          localStorage.setItem("ns_current_user", JSON.stringify(user))

          // Check if user needs to complete onboarding (set skill level)
          if (!user.hasCompletedOnboarding || !user.skillLevel) {
            setStatus("Redirecting to setup...")
            router.push("/onboarding")
          } else {
            setStatus("Redirecting...")
            router.push("/")
          }
        } catch (error) {
          console.error("Failed to parse user data:", error)
          router.push("/?error=parse_failed")
        }
      } else {
        router.push("/?error=no_data")
      }
    }
    
    completeAuth()
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-foreground">{status}</p>
      </div>
    </div>
  )
}
