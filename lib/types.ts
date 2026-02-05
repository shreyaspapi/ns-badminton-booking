export type SkillLevel = "Beginner" | "Casual" | "Intermediate" | "Advanced" | "Pro"

export const SKILL_LEVELS: SkillLevel[] = ["Beginner", "Casual", "Intermediate", "Advanced", "Pro"]

export const SKILL_LEVEL_ORDER: Record<SkillLevel, number> = {
  Beginner: 1,
  Casual: 2,
  Intermediate: 3,
  Advanced: 4,
  Pro: 5,
}

// 30-minute time slots
// Afternoon: 12:30 PM - 4:30 PM
// Evening: 5:00 PM - 12:30 AM
export type TimeSlot = 
  // Afternoon slots
  | "12:30-13:00" | "13:00-13:30" | "13:30-14:00" | "14:00-14:30" 
  | "14:30-15:00" | "15:00-15:30" | "15:30-16:00" | "16:00-16:30"
  // Evening slots (with gap from 4:30-5:00)
  | "17:00-17:30" | "17:30-18:00" | "18:00-18:30"  // Core team: 5:00-6:30
  | "18:30-19:00" | "19:00-19:30"  // 6:30-7:30: Can be 1v1 or 2v2
  | "19:30-20:00" | "20:00-20:30" | "20:30-21:00" | "21:00-21:30" 
  | "21:30-22:00" | "22:00-22:30" | "22:30-23:00" | "23:00-23:30" 
  | "23:30-00:00" | "00:00-00:30"

// All time slots in order
export const TIME_SLOTS: TimeSlot[] = [
  // Afternoon
  "12:30-13:00", "13:00-13:30", "13:30-14:00", "14:00-14:30",
  "14:30-15:00", "15:00-15:30", "15:30-16:00", "16:00-16:30",
  // Evening
  "17:00-17:30", "17:30-18:00", "18:00-18:30",
  "18:30-19:00", "19:00-19:30",
  "19:30-20:00", "20:00-20:30", "20:30-21:00", "21:00-21:30",
  "21:30-22:00", "22:00-22:30", "22:30-23:00", "23:00-23:30",
  "23:30-00:00", "00:00-00:30"
]

// Core team slots - 5:00-6:30 PM (blocked by default, can be unblocked for specific days)
export const CORE_TEAM_SLOTS: TimeSlot[] = ["17:00-17:30", "17:30-18:00", "18:00-18:30"]

// Slots where user can choose between 1v1 and 2v2 (6:30-7:30)
export const FLEXIBLE_GAME_TYPE_SLOTS: TimeSlot[] = ["18:30-19:00", "19:00-19:30"]

// Maximum bookings per user per day
export const MAX_BOOKINGS_PER_DAY = 2

// Recommended player count (soft limit)
export const RECOMMENDED_PLAYERS = 4

// Maximum players per booking (hard limit)
export const MAX_PLAYERS_PER_BOOKING = 6

export interface User {
  id: string
  discordId: string
  discordUsername: string
  discordAvatar?: string
  skillLevel?: SkillLevel
  isAdmin: boolean
  hasCompletedOnboarding?: boolean
}

export interface Booking {
  id: string
  date: string // YYYY-MM-DD
  timeSlot: TimeSlot
  gameType: "1v1" | "2v2"
  createdBy: string // discord username
  createdById: string // discord id
  playerCount: number // suggested count, not enforced
  players: Player[]
  skillLevel: SkillLevel
  createdAt: string
}

export interface Player {
  discordId: string
  discordUsername: string
  skillLevel: SkillLevel
}

// Check if slot is in the 6:30-7:30 range (can be 1v1 or 2v2)
export function isFlexibleGameTypeSlot(slot: TimeSlot): boolean {
  return FLEXIBLE_GAME_TYPE_SLOTS.includes(slot)
}

// Check if slot is a core team slot (5:00-6:30)
export function isCoreTeamSlot(slot: TimeSlot): boolean {
  return CORE_TEAM_SLOTS.includes(slot)
}

// Get recommended players for a game type
export function getRecommendedPlayersForGameType(gameType: "1v1" | "2v2"): number {
  return gameType === "1v1" ? 2 : 4
}

// Check if user can join a booking
// Rules:
// 1. User must have sufficient skill level
// 2. Booking must not be at max capacity (6 players)
// 3. If creator specified they already have X players, don't allow more until actual players < X
export function canJoinBooking(booking: Booking, userSkill: SkillLevel): boolean {
  const userLevel = SKILL_LEVEL_ORDER[userSkill]
  const bookingLevel = SKILL_LEVEL_ORDER[booking.skillLevel]
  
  // Check skill level
  if (userLevel < bookingLevel) return false
  
  // Hard limit: max 6 players
  if (booking.players.length >= MAX_PLAYERS_PER_BOOKING) return false
  
  // If creator said they have X players, don't allow joining until actual < X
  // This means if someone books for 4 people, no one else can join
  if (booking.players.length >= booking.playerCount) return false
  
  return true
}

// Check why a user cannot join (for displaying appropriate message)
export function getJoinBlockedReason(booking: Booking, userSkill: SkillLevel): string | null {
  const userLevel = SKILL_LEVEL_ORDER[userSkill]
  const bookingLevel = SKILL_LEVEL_ORDER[booking.skillLevel]
  
  if (userLevel < bookingLevel) {
    return `Requires ${booking.skillLevel} or higher skill level`
  }
  
  if (booking.players.length >= MAX_PLAYERS_PER_BOOKING) {
    return "This game is at maximum capacity (6 players)"
  }
  
  if (booking.players.length >= booking.playerCount) {
    return "This game already has a full party"
  }
  
  return null
}

// Format time slot for display (convert 24h to 12h format)
export function formatTimeSlot(slot: TimeSlot): string {
  const [start, end] = slot.split("-")
  return `${formatTime(start)} - ${formatTime(end)}`
}

function formatTime(time: string): string {
  const [hours, minutes] = time.split(":").map(Number)
  if (hours === 0) return `12:${minutes.toString().padStart(2, "0")} AM`
  if (hours === 12) return `12:${minutes.toString().padStart(2, "0")} PM`
  if (hours > 12) return `${hours - 12}:${minutes.toString().padStart(2, "0")} PM`
  return `${hours}:${minutes.toString().padStart(2, "0")} AM`
}

// Group time slots by period for display
export function getAfternoonSlots(): TimeSlot[] {
  return TIME_SLOTS.filter(slot => {
    const hour = parseInt(slot.split(":")[0])
    return hour >= 12 && hour < 17
  })
}

export function getEveningSlots(): TimeSlot[] {
  return TIME_SLOTS.filter(slot => {
    const hour = parseInt(slot.split(":")[0])
    return hour >= 17 || hour < 1
  })
}
