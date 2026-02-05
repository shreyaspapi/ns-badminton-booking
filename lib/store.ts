"use client"

import type { Booking, User } from "./types"

const BOOKINGS_KEY = "ns_badminton_bookings"
const USERS_KEY = "ns_badminton_users"
const ADMIN_USERNAMES_KEY = "ns_badminton_admins"
const UNBLOCKED_CORE_DATES_KEY = "ns_badminton_unblocked_core_dates"

// Default admin usernames - add your Discord username here
const DEFAULT_ADMINS = ["your_discord_username"]

export function getBookings(): Booking[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(BOOKINGS_KEY)
  return data ? JSON.parse(data) : []
}

export function saveBookings(bookings: Booking[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings))
}

export function addBooking(booking: Booking) {
  const bookings = getBookings()
  bookings.push(booking)
  saveBookings(bookings)
}

export function updateBooking(booking: Booking) {
  const bookings = getBookings()
  const index = bookings.findIndex((b) => b.id === booking.id)
  if (index !== -1) {
    bookings[index] = booking
    saveBookings(bookings)
  }
}

export function deleteBooking(id: string) {
  const bookings = getBookings().filter((b) => b.id !== id)
  saveBookings(bookings)
}

export function getBookingsForDate(date: string): Booking[] {
  return getBookings().filter((b) => b.date === date)
}

// User management
export function getUsers(): User[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(USERS_KEY)
  return data ? JSON.parse(data) : []
}

export function saveUsers(users: User[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export function saveUser(user: User) {
  const users = getUsers()
  const existingIndex = users.findIndex((u) => u.discordId === user.discordId)
  if (existingIndex !== -1) {
    users[existingIndex] = user
  } else {
    users.push(user)
  }
  saveUsers(users)
}

export function getUser(discordId: string): User | undefined {
  return getUsers().find((u) => u.discordId === discordId)
}

// Admin management
export function getAdminUsernames(): string[] {
  if (typeof window === "undefined") return DEFAULT_ADMINS
  const data = localStorage.getItem(ADMIN_USERNAMES_KEY)
  return data ? JSON.parse(data) : DEFAULT_ADMINS
}

export function saveAdminUsernames(usernames: string[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(ADMIN_USERNAMES_KEY, JSON.stringify(usernames))
}

export function isAdmin(discordUsername: string): boolean {
  const admins = getAdminUsernames()
  return admins.some((admin) => admin.toLowerCase() === discordUsername.toLowerCase())
}

export function addAdmin(username: string) {
  const admins = getAdminUsernames()
  if (!admins.some((a) => a.toLowerCase() === username.toLowerCase())) {
    admins.push(username)
    saveAdminUsernames(admins)
  }
}

export function removeAdmin(username: string) {
  const admins = getAdminUsernames().filter(
    (a) => a.toLowerCase() !== username.toLowerCase()
  )
  saveAdminUsernames(admins)
}

// Core team slot management (5:00-6:30)
// By default, 5:00-6:30 is blocked for core team
// Admins can "unblock" specific dates to allow regular bookings

export function getUnblockedCoreDates(): string[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(UNBLOCKED_CORE_DATES_KEY)
  return data ? JSON.parse(data) : []
}

export function saveUnblockedCoreDates(dates: string[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(UNBLOCKED_CORE_DATES_KEY, JSON.stringify(dates))
}

export function isCoreSlotUnblocked(date: string): boolean {
  const unblockedDates = getUnblockedCoreDates()
  return unblockedDates.includes(date)
}

export function unblockCoreSlot(date: string) {
  const dates = getUnblockedCoreDates()
  if (!dates.includes(date)) {
    dates.push(date)
    saveUnblockedCoreDates(dates)
  }
}

export function blockCoreSlot(date: string) {
  const dates = getUnblockedCoreDates().filter((d) => d !== date)
  saveUnblockedCoreDates(dates)
}
