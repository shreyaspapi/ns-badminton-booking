"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type { User, SkillLevel } from "./types"
import { getUser, isAdmin, saveUser } from "./store"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: () => void
  logout: () => void
  updateSkillLevel: (level: SkillLevel) => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshUser = async () => {
    const storedUser = localStorage.getItem("ns_current_user")
    if (storedUser) {
      const parsed = JSON.parse(storedUser)
      // Refresh admin status from API
      const adminStatus = await isAdmin(parsed.discordUsername)
      parsed.isAdmin = adminStatus
      setUser(parsed)
      localStorage.setItem("ns_current_user", JSON.stringify(parsed))
    }
  }

  useEffect(() => {
    // Check for existing session
    const initAuth = async () => {
      const storedUser = localStorage.getItem("ns_current_user")
      if (storedUser) {
        const parsed = JSON.parse(storedUser)
        // Refresh admin status from API
        try {
          const adminStatus = await isAdmin(parsed.discordUsername)
          parsed.isAdmin = adminStatus
          setUser(parsed)
          localStorage.setItem("ns_current_user", JSON.stringify(parsed))
        } catch (error) {
          console.error("Error refreshing admin status:", error)
          setUser(parsed)
        }
      }
      setIsLoading(false)
    }
    initAuth()
  }, [])

  const login = () => {
    // Redirect to Discord OAuth
    const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID
    const redirectUri = encodeURIComponent(`${window.location.origin}/api/auth/callback`)
    const scope = encodeURIComponent("identify")
    
    window.location.href = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`
  }

  const logout = () => {
    localStorage.removeItem("ns_current_user")
    setUser(null)
  }

  const updateSkillLevel = async (level: SkillLevel) => {
    if (!user) return
    const updated = { ...user, skillLevel: level, hasCompletedOnboarding: true }
    setUser(updated)
    try {
      await saveUser(updated)
      localStorage.setItem("ns_current_user", JSON.stringify(updated))
    } catch (error) {
      console.error("Error saving user:", error)
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, updateSkillLevel, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
