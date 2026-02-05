"use client"

import { useState, useEffect } from "react"
import { AuthProvider, useAuth } from "@/lib/auth-context"
import { Header } from "@/components/header"
import { DatePicker } from "@/components/date-picker"
import { BookingCard } from "@/components/booking-card"
import { NewBookingDialog } from "@/components/new-booking-dialog"
import { getBookingsForDate, isCoreSlotUnblocked } from "@/lib/store"
import type { Booking, TimeSlot } from "@/lib/types"
import { TIME_SLOTS, CORE_TEAM_SLOT, getGameTypeForSlot } from "@/lib/types"
import { Lock } from "lucide-react"

function HomePage() {
  const { user, isLoading } = useAuth()
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split("T")[0]
  })
  const [bookings, setBookings] = useState<Booking[]>([])
  const [refreshKey, setRefreshKey] = useState(0)

  const coreSlotUnblocked = isCoreSlotUnblocked(selectedDate)

  useEffect(() => {
    setBookings(getBookingsForDate(selectedDate))
  }, [selectedDate, refreshKey])

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1)
  }

  const getBookingForSlot = (slot: TimeSlot) => {
    return bookings.find((b) => b.timeSlot === slot)
  }

  if (isLoading) {
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
        {/* Date picker */}
        <div className="mb-8">
          <DatePicker selectedDate={selectedDate} onDateChange={setSelectedDate} />
        </div>

        {/* Section header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-medium text-foreground">
              {new Date(selectedDate).toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}
            </h1>
            <p className="text-sm text-muted-foreground">
              {TIME_SLOTS.length - bookings.length - (coreSlotUnblocked ? 0 : 1)} slots available
            </p>
          </div>
          {user && <NewBookingDialog selectedDate={selectedDate} onBookingCreated={handleRefresh} />}
        </div>

        {!user && (
          <div className="mb-6 rounded-xl border border-border bg-card p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Sign in with Discord to book a slot or join a game.
            </p>
          </div>
        )}

        {/* Time slots */}
        <div className="space-y-3">
          {TIME_SLOTS.map((slot) => {
            const booking = getBookingForSlot(slot)
            const gameType = getGameTypeForSlot(slot)

            if (booking) {
              return <BookingCard key={slot} booking={booking} onUpdate={handleRefresh} />
            }

            // Check if this is the core team slot and if it's blocked
            const isCoreSlot = slot === CORE_TEAM_SLOT
            const isBlocked = isCoreSlot && !coreSlotUnblocked

            if (isBlocked) {
              return (
                <div
                  key={slot}
                  className="flex items-center justify-between rounded-xl border border-border bg-muted/50 p-4"
                >
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-base font-medium text-muted-foreground">{slot}</span>
                    <span className="text-sm text-muted-foreground/60">{gameType}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">Core Team</span>
                </div>
              )
            }

            return (
              <div
                key={slot}
                className="flex items-center justify-between rounded-xl border border-dashed border-border p-4"
              >
                <div>
                  <span className="text-base font-medium text-muted-foreground">{slot}</span>
                  <span className="ml-2 text-sm text-muted-foreground/60">{gameType}</span>
                </div>
                <span className="text-sm text-muted-foreground">Available</span>
              </div>
            )
          })}
        </div>

        {/* Rules */}
        <div className="mt-12 space-y-3 border-t border-border pt-8">
          <h2 className="text-sm font-medium text-foreground">Booking rules</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>5:00-6:30 is reserved for Core Team (can be opened by admins)</li>
            <li>6:30-7:30 is 1v1 only (2 players max)</li>
            <li>All other slots are 2v2 (4 players max)</li>
            <li>Players can join games at their skill level or higher</li>
          </ul>
        </div>
      </main>
    </div>
  )
}

export default function Page() {
  return (
    <AuthProvider>
      <HomePage />
    </AuthProvider>
  )
}
