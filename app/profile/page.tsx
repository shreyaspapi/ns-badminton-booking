"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AuthProvider, useAuth } from "@/lib/auth-context"
import { Header } from "@/components/header"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Shield } from "lucide-react"
import { SKILL_LEVELS, type SkillLevel } from "@/lib/types"

function ProfilePage() {
  const { user, isLoading, updateSkillLevel } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
    }
  }, [isLoading, user, router])

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-8 text-lg font-medium text-foreground">Profile</h1>

        {/* Account Info */}
        <section className="mb-8">
          <h2 className="mb-3 text-sm font-medium text-foreground">Account</h2>
          <div className="rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-lg font-medium text-foreground">
                {user.discordUsername.slice(0, 1).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-foreground">{user.discordUsername}</p>
                  {user.isAdmin && (
                    <span className="flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                      <Shield className="h-3 w-3" />
                      Admin
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">Discord ID: {user.discordId}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Skill Level */}
        <section>
          <h2 className="mb-3 text-sm font-medium text-foreground">Skill level</h2>
          <div className="rounded-xl border border-border p-4 space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-normal text-muted-foreground">Your level</Label>
              <Select
                value={user.skillLevel}
                onValueChange={(value) => updateSkillLevel(value as SkillLevel)}
              >
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SKILL_LEVELS.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <p className="text-sm text-muted-foreground">
              You can only join games at your skill level or higher.
            </p>

            <div className="border-t border-border pt-4 space-y-2">
              <p className="text-xs font-medium text-foreground">Skill guide</p>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li><span className="text-foreground">Beginner</span> - New to badminton</li>
                <li><span className="text-foreground">Casual</span> - Play occasionally for fun</li>
                <li><span className="text-foreground">Intermediate</span> - Regular player</li>
                <li><span className="text-foreground">Advanced</span> - Competitive player</li>
                <li><span className="text-foreground">Pro</span> - Tournament level</li>
              </ul>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default function Page() {
  return (
    <AuthProvider>
      <ProfilePage />
    </AuthProvider>
  )
}
