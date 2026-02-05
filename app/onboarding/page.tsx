"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { SKILL_LEVELS, type SkillLevel } from "@/lib/types"
import { saveUser } from "@/lib/store"
import { CheckCircle2, Trophy, ArrowRight } from "lucide-react"
import { Footer } from "@/components/footer"

const SKILL_DESCRIPTIONS: Record<SkillLevel, { description: string; examples: string }> = {
  Beginner: {
    description: "New to badminton, learning the basics",
    examples: "Learning grips, basic serves, and court movement"
  },
  Casual: {
    description: "Play occasionally for fun",
    examples: "Know the rules, can rally but still developing consistency"
  },
  Intermediate: {
    description: "Regular player with solid fundamentals",
    examples: "Consistent shots, basic strategies, can play competitive games"
  },
  Advanced: {
    description: "Competitive player with strong technique",
    examples: "Powerful smashes, good court coverage, tactical play"
  },
  Pro: {
    description: "Tournament level player",
    examples: "Excellent all-round skills, plays in competitive leagues"
  },
}

const SKILL_COLORS: Record<SkillLevel, string> = {
  Beginner: "from-green-500 to-emerald-500",
  Casual: "from-blue-500 to-cyan-500",
  Intermediate: "from-purple-500 to-violet-500",
  Advanced: "from-orange-500 to-amber-500",
  Pro: "from-red-500 to-rose-500",
}

export default function OnboardingPage() {
  const router = useRouter()
  const [selectedLevel, setSelectedLevel] = useState<SkillLevel | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<Record<string, unknown> | null>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem("ns_current_user")
    if (!storedUser) {
      router.push("/")
      return
    }
    setUser(JSON.parse(storedUser))
  }, [router])

  const handleContinue = async () => {
    if (!selectedLevel || !user) return
    
    setIsLoading(true)
    try {
      const updatedUser = {
        ...user,
        skillLevel: selectedLevel,
        hasCompletedOnboarding: true,
      }
      
      await saveUser(updatedUser as Parameters<typeof saveUser>[0])
      localStorage.setItem("ns_current_user", JSON.stringify(updatedUser))
      router.push("/")
    } catch (error) {
      console.error("Error saving skill level:", error)
      setIsLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/40">
        <div className="mx-auto max-w-2xl px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Trophy className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold">NS Badminton</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
        {/* Welcome section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">
            Welcome, {user.discordUsername as string}!
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Let's set up your profile. Select your skill level to get matched with the right games.
          </p>
        </div>

        {/* Skill level cards */}
        <div className="space-y-3 mb-8">
          {SKILL_LEVELS.map((level, index) => (
            <button
              key={level}
              onClick={() => setSelectedLevel(level)}
              className={`w-full text-left rounded-2xl border-2 p-4 sm:p-5 transition-all ${
                selectedLevel === level
                  ? "border-primary bg-primary/5 shadow-lg"
                  : "border-border hover:border-primary/30 hover:bg-secondary/50"
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Level indicator */}
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${SKILL_COLORS[level]} text-white font-bold`}>
                  {index + 1}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-lg font-semibold">{level}</h3>
                    {selectedLevel === level && (
                      <CheckCircle2 className="h-6 w-6 text-primary shrink-0" />
                    )}
                  </div>
                  <p className="text-muted-foreground mt-1">
                    {SKILL_DESCRIPTIONS[level].description}
                  </p>
                  <p className="text-sm text-muted-foreground/70 mt-2">
                    {SKILL_DESCRIPTIONS[level].examples}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Continue button */}
        <div className="space-y-4">
          <Button
            onClick={handleContinue}
            disabled={!selectedLevel || isLoading}
            className="w-full h-14 text-lg font-medium"
            size="lg"
          >
            {isLoading ? (
              <>
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                Setting up...
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
          
          <p className="text-center text-sm text-muted-foreground">
            You can change this anytime in your profile settings
          </p>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}
