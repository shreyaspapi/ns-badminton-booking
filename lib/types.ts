export type SkillLevel = "Beginner" | "Casual" | "Intermediate" | "Advanced" | "Pro"

export const SKILL_LEVELS: SkillLevel[] = ["Beginner", "Casual", "Intermediate", "Advanced", "Pro"]

export const SKILL_LEVEL_ORDER: Record<SkillLevel, number> = {
  Beginner: 1,
  Casual: 2,
  Intermediate: 3,
  Advanced: 4,
  Pro: 5,
}

export type TimeSlot = "5:00-6:30" | "6:30-7:30" | "7:30-8:30" | "8:30-9:30" | "9:30-10:30"

export const TIME_SLOTS: TimeSlot[] = ["5:00-6:30", "6:30-7:30", "7:30-8:30", "8:30-9:30", "9:30-10:30"]

// Core team slot - blocked by default, can be unblocked for specific days
export const CORE_TEAM_SLOT: TimeSlot = "5:00-6:30"

export interface User {
  id: string
  discordId: string
  discordUsername: string
  discordAvatar?: string
  skillLevel: SkillLevel
  isAdmin: boolean
}

export interface Booking {
  id: string
  date: string // YYYY-MM-DD
  timeSlot: TimeSlot
  gameType: "1v1" | "2v2"
  createdBy: string // discord username
  createdById: string // discord id
  playerCount: number // 1-4
  players: Player[]
  skillLevel: SkillLevel
  createdAt: string
}

export interface Player {
  discordId: string
  discordUsername: string
  skillLevel: SkillLevel
}

// 6:30-7:30 is 1v1 only, rest are 2v2
export function getGameTypeForSlot(slot: TimeSlot): "1v1" | "2v2" {
  return slot === "6:30-7:30" ? "1v1" : "2v2"
}

export function getMaxPlayersForSlot(slot: TimeSlot): number {
  return slot === "6:30-7:30" ? 2 : 4
}

export function canJoinBooking(booking: Booking, userSkill: SkillLevel): boolean {
  const userLevel = SKILL_LEVEL_ORDER[userSkill]
  const bookingLevel = SKILL_LEVEL_ORDER[booking.skillLevel]
  const maxPlayers = getMaxPlayersForSlot(booking.timeSlot)
  
  return booking.players.length < maxPlayers && userLevel >= bookingLevel
}
