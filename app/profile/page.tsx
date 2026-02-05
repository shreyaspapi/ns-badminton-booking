"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AuthProvider, useAuth } from "@/lib/auth-context"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Shield, CheckCircle, User, Trophy, ArrowLeft } from "lucide-react"
import { SKILL_LEVELS, type SkillLevel } from "@/lib/types"
import Link from "next/link"
import { Footer } from "@/components/footer"

const SKILL_DESCRIPTIONS: Record<SkillLevel, string> = {
  Beginner: "New to badminton, learning the basics",
  Casual: "Play occasionally for fun, know basic rules",
  Intermediate: "Regular player with decent skills",
  Advanced: "Competitive player with strong technique",
  Pro: "Tournament level, highly skilled player",
}

function ProfilePage() {
  const { user, isLoading, updateSkillLevel } = useAuth()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
    }
  }, [isLoading, user, router])

  const handleSkillChange = async (value: string) => {
    setSaving(true)
    setSaved(false)
    await updateSkillLevel(value as SkillLevel)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="mx-auto max-w-2xl px-4 sm:px-6 py-6 sm:py-8">
        {/* Back button */}
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to bookings
        </Link>

        <h1 className="text-2xl font-bold mb-8">Your Profile</h1>

        {/* Profile card */}
        <section className="mb-8">
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-2xl font-bold text-primary-foreground">
                {user.discordUsername.slice(0, 1).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-semibold truncate">{user.discordUsername}</h2>
                  {user.isAdmin && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                      <Shield className="h-3 w-3" />
                      Admin
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">Discord ID: {user.discordId}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Skill Level */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Skill Level</h2>
          </div>
          
          <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Your current level</label>
                {saving && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Saving...
                  </span>
                )}
                {saved && (
                  <span className="text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Saved
                  </span>
                )}
              </div>
              <Select
                value={user.skillLevel || ""}
                onValueChange={handleSkillChange}
                disabled={saving}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select your skill level" />
                </SelectTrigger>
                <SelectContent>
                  {SKILL_LEVELS.map((level) => (
                    <SelectItem key={level} value={level} className="py-3">
                      <div>
                        <span className="font-medium">{level}</span>
                        <span className="text-muted-foreground ml-2 text-sm">
                          - {SKILL_DESCRIPTIONS[level]}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-xl bg-secondary/50 p-4">
              <p className="text-sm text-muted-foreground">
                Your skill level determines which games you can join. You can only join games that match your level or higher.
              </p>
            </div>

            {/* Skill guide */}
            <div>
              <h3 className="text-sm font-medium mb-3">Skill Level Guide</h3>
              <div className="space-y-2">
                {SKILL_LEVELS.map((level, index) => (
                  <div 
                    key={level}
                    className={`flex items-center gap-3 p-3 rounded-xl ${
                      user.skillLevel === level ? 'bg-primary/10' : 'bg-secondary/50'
                    }`}
                  >
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold ${
                      user.skillLevel === level 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-secondary text-muted-foreground'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className={`font-medium ${user.skillLevel === level ? 'text-primary' : ''}`}>
                        {level}
                      </p>
                      <p className="text-xs text-muted-foreground">{SKILL_DESCRIPTIONS[level]}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Admin link */}
        {user.isAdmin && (
          <section className="mt-8">
            <Link href="/admin">
              <Button variant="outline" className="w-full h-12">
                <Shield className="mr-2 h-4 w-4" />
                Go to Admin Panel
              </Button>
            </Link>
          </section>
        )}
      </main>
      
      <Footer />
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
