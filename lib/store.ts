"use client"

import type { Booking, User } from "./types"

// API base URL
const API_BASE = "/api"

// ============ BOOKINGS ============

export async function getBookings(): Promise<Booking[]> {
  try {
    const response = await fetch(`${API_BASE}/bookings`)
    if (!response.ok) throw new Error("Failed to fetch bookings")
    const data = await response.json()
    // Map database fields to app types
    return data.map((b: Record<string, unknown>) => ({
      id: b.id,
      date: b.date,
      timeSlot: b.timeSlot || b.time_slot,
      gameType: b.gameType || b.game_type,
      createdBy: b.createdBy || b.created_by,
      createdById: b.createdById || b.created_by_id,
      playerCount: b.playerCount || b.player_count,
      players: b.players,
      skillLevel: b.skillLevel || b.skill_level,
      createdAt: b.createdAt || b.created_at,
    }))
  } catch (error) {
    console.error("Error fetching bookings:", error)
    return []
  }
}

export async function getBookingsForDate(date: string): Promise<Booking[]> {
  try {
    const response = await fetch(`${API_BASE}/bookings?date=${encodeURIComponent(date)}`)
    if (!response.ok) throw new Error("Failed to fetch bookings")
    const data = await response.json()
    return data.map((b: Record<string, unknown>) => ({
      id: b.id,
      date: b.date,
      timeSlot: b.timeSlot || b.time_slot,
      gameType: b.gameType || b.game_type,
      createdBy: b.createdBy || b.created_by,
      createdById: b.createdById || b.created_by_id,
      playerCount: b.playerCount || b.player_count,
      players: b.players,
      skillLevel: b.skillLevel || b.skill_level,
      createdAt: b.createdAt || b.created_at,
    }))
  } catch (error) {
    console.error("Error fetching bookings for date:", error)
    return []
  }
}

export async function addBooking(booking: Booking): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(booking),
    })
    if (!response.ok) throw new Error("Failed to add booking")
  } catch (error) {
    console.error("Error adding booking:", error)
    throw error
  }
}

export async function updateBooking(booking: Booking): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/bookings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(booking),
    })
    if (!response.ok) throw new Error("Failed to update booking")
  } catch (error) {
    console.error("Error updating booking:", error)
    throw error
  }
}

export async function deleteBooking(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/bookings?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    })
    if (!response.ok) throw new Error("Failed to delete booking")
  } catch (error) {
    console.error("Error deleting booking:", error)
    throw error
  }
}

// Legacy sync function - no longer saves bookings
export function saveBookings(_bookings: Booking[]): void {
  console.warn("saveBookings is deprecated - use addBooking, updateBooking, or deleteBooking instead")
}

// ============ USERS ============

export async function getUsers(): Promise<User[]> {
  try {
    const response = await fetch(`${API_BASE}/users`)
    if (!response.ok) throw new Error("Failed to fetch users")
    const data = await response.json()
    return data.map((u: Record<string, unknown>) => ({
      id: u.id,
      discordId: u.discordId || u.discord_id,
      discordUsername: u.discordUsername || u.discord_username,
      discordAvatar: u.discordAvatar || u.discord_avatar,
      skillLevel: u.skillLevel || u.skill_level,
      isAdmin: u.isAdmin || u.is_admin,
      hasCompletedOnboarding: u.hasCompletedOnboarding || u.has_completed_onboarding || false,
    }))
  } catch (error) {
    console.error("Error fetching users:", error)
    return []
  }
}

export async function getUser(discordId: string): Promise<User | undefined> {
  try {
    const response = await fetch(`${API_BASE}/users?discordId=${encodeURIComponent(discordId)}`)
    if (!response.ok) throw new Error("Failed to fetch user")
    const data = await response.json()
    if (!data) return undefined
    return {
      id: data.id,
      discordId: data.discordId || data.discord_id,
      discordUsername: data.discordUsername || data.discord_username,
      discordAvatar: data.discordAvatar || data.discord_avatar,
      skillLevel: data.skillLevel || data.skill_level,
      isAdmin: data.isAdmin || data.is_admin,
      hasCompletedOnboarding: data.hasCompletedOnboarding || data.has_completed_onboarding || false,
    }
  } catch (error) {
    console.error("Error fetching user:", error)
    return undefined
  }
}

export async function saveUser(user: User): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    })
    if (!response.ok) throw new Error("Failed to save user")
  } catch (error) {
    console.error("Error saving user:", error)
    throw error
  }
}

// Legacy sync function
export function saveUsers(_users: User[]): void {
  console.warn("saveUsers is deprecated - use saveUser instead")
}

// ============ ADMINS ============

export async function getAdminUsernames(): Promise<string[]> {
  try {
    const response = await fetch(`${API_BASE}/admins`)
    if (!response.ok) throw new Error("Failed to fetch admins")
    return await response.json()
  } catch (error) {
    console.error("Error fetching admins:", error)
    return ["shreyaspapi"] // Default fallback
  }
}

export async function isAdmin(discordUsername: string): Promise<boolean> {
  const admins = await getAdminUsernames()
  return admins.some((admin) => admin.toLowerCase() === discordUsername.toLowerCase())
}

export async function addAdmin(username: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/admins`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    })
    if (!response.ok) throw new Error("Failed to add admin")
  } catch (error) {
    console.error("Error adding admin:", error)
    throw error
  }
}

export async function removeAdmin(username: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/admins?username=${encodeURIComponent(username)}`, {
      method: "DELETE",
    })
    if (!response.ok) throw new Error("Failed to remove admin")
  } catch (error) {
    console.error("Error removing admin:", error)
    throw error
  }
}

// Legacy sync function
export function saveAdminUsernames(_usernames: string[]): void {
  console.warn("saveAdminUsernames is deprecated - use addAdmin or removeAdmin instead")
}

// ============ CORE DATES ============

export async function getUnblockedCoreDates(): Promise<string[]> {
  try {
    const response = await fetch(`${API_BASE}/core-dates`)
    if (!response.ok) throw new Error("Failed to fetch core dates")
    return await response.json()
  } catch (error) {
    console.error("Error fetching core dates:", error)
    return []
  }
}

export async function isCoreSlotUnblocked(date: string): Promise<boolean> {
  const unblockedDates = await getUnblockedCoreDates()
  return unblockedDates.includes(date)
}

export async function unblockCoreSlot(date: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/core-dates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date }),
    })
    if (!response.ok) throw new Error("Failed to unblock core slot")
  } catch (error) {
    console.error("Error unblocking core slot:", error)
    throw error
  }
}

export async function blockCoreSlot(date: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/core-dates?date=${encodeURIComponent(date)}`, {
      method: "DELETE",
    })
    if (!response.ok) throw new Error("Failed to block core slot")
  } catch (error) {
    console.error("Error blocking core slot:", error)
    throw error
  }
}

// Legacy sync function
export function saveUnblockedCoreDates(_dates: string[]): void {
  console.warn("saveUnblockedCoreDates is deprecated - use unblockCoreSlot or blockCoreSlot instead")
}
