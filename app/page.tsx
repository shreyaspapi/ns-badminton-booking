"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { AuthProvider, useAuth } from "@/lib/auth-context"
import { Header } from "@/components/header"
import { DatePicker } from "@/components/date-picker"
import { BookingCard } from "@/components/booking-card"
import { NewBookingDialog } from "@/components/new-booking-dialog"
import { getBookingsForDate, getUnblockedCoreDates } from "@/lib/store"
import type { Booking, TimeSlot } from "@/lib/types"
import { 
  TIME_SLOTS, 
  CORE_TEAM_SLOTS, 
  FLEXIBLE_GAME_TYPE_SLOTS,
  formatTimeSlot,
  getAfternoonSlots,
  getEveningSlots,
  MAX_BOOKINGS_PER_DAY,
  getTodayString,
  formatDateForDisplay
} from "@/lib/types"
import { Lock, Clock, ChevronDown } from "lucide-react"
import { Footer } from "@/components/footer"

function HomePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState(() => getTodayString())
  const [bookings, setBookings] = useState<Booking[]>([])
  const [unblockedDates, setUnblockedDates] = useState<string[]>([])
  const [refreshKey, setRefreshKey] = useState(0)
  const [dataLoading, setDataLoading] = useState(true)
  const [guidelinesExpanded, setGuidelinesExpanded] = useState(false)

  // Check if user needs onboarding
  useEffect(() => {
    if (!isLoading && user && !user.hasCompletedOnboarding) {
      router.push("/onboarding")
    }
  }, [isLoading, user, router])

  const loadData = useCallback(async () => {
    setDataLoading(true)
    try {
      const [bookingsData, unblockedData] = await Promise.all([
        getBookingsForDate(selectedDate),
        getUnblockedCoreDates()
      ])
      setBookings(bookingsData)
      setUnblockedDates(unblockedData)
    } catch (error) {
      console.error("Error loading data:", error)
    }
    setDataLoading(false)
  }, [selectedDate])

  useEffect(() => {
    loadData()
  }, [loadData, refreshKey])

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1)
  }

  const getBookingForSlot = (slot: TimeSlot) => {
    return bookings.find((b) => b.timeSlot === slot)
  }

  const isCoreSlotUnblocked = (slot: TimeSlot) => {
    if (!CORE_TEAM_SLOTS.includes(slot)) return true
    return unblockedDates.includes(selectedDate)
  }

  // Count user's bookings for selected date
  const userBookingsToday = user 
    ? bookings.filter(b => b.createdById === user.discordId).length 
    : 0

  const afternoonSlots = getAfternoonSlots()
  const eveningSlots = getEveningSlots()

  // Calculate available slots
  const availableSlots = TIME_SLOTS.filter(slot => {
    const hasBooking = bookings.some(b => b.timeSlot === slot)
    const isCoreBlocked = CORE_TEAM_SLOTS.includes(slot) && !unblockedDates.includes(selectedDate)
    return !hasBooking && !isCoreBlocked
  }).length

  const totalBookings = bookings.length

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
      </div>
    )
  }

  const renderSlot = (slot: TimeSlot) => {
    const booking = getBookingForSlot(slot)
    const isFlexible = FLEXIBLE_GAME_TYPE_SLOTS.includes(slot)
    const isCoreSlot = CORE_TEAM_SLOTS.includes(slot)
    const isBlocked = isCoreSlot && !isCoreSlotUnblocked(slot)

    if (booking) {
      return <BookingCard key={slot} booking={booking} onUpdate={handleRefresh} />
    }

    if (isBlocked) {
      return (
        <div
          key={slot}
          className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium text-muted-foreground">{formatTimeSlot(slot)}</p>
            </div>
          </div>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">Core Team</span>
        </div>
      )
    }

    return (
      <div
        key={slot}
        className="flex items-center justify-between rounded-xl border border-dashed border-border px-4 py-3 transition-colors hover:border-foreground/20 hover:bg-muted/30"
      >
        <div className="flex items-center gap-3">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="font-medium">{formatTimeSlot(slot)}</p>
            <p className="text-xs text-muted-foreground">
              {isFlexible ? "1v1 or 2v2" : "2v2"}
            </p>
          </div>
        </div>
        <span className="text-xs text-muted-foreground">Available</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="mx-auto max-w-2xl px-4 sm:px-6 py-6 sm:py-8 pb-24">
        {/* Welcome & Guidelines section - collapsible */}
        <section className="mb-8">
          <button
            onClick={() => setGuidelinesExpanded(!guidelinesExpanded)}
            className="w-full flex items-center justify-between rounded-xl border border-border bg-muted/30 px-4 py-3 text-left transition-colors hover:bg-muted/50"
          >
            <span className="font-semibold">Guidelines & Rules</span>
            <ChevronDown 
              className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${
                guidelinesExpanded ? "rotate-180" : ""
              }`} 
            />
          </button>
          
          {guidelinesExpanded && (
            <div className="mt-3 space-y-4 animate-in slide-in-from-top-2 duration-200">
              <div className="rounded-xl border border-border bg-muted/30 p-5">
                <h3 className="text-base font-semibold mb-2">Welcome New Players!</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Just a few general things to keep in mind when playing badminton at the gym:
                </p>
                <ul className="space-y-1.5 text-sm text-muted-foreground mb-3">
                  <li>• We cannot disrupt the burn sessions the next day</li>
                  <li>• Please don't remove the entire net when disassembling the court</li>
                </ul>
                <p className="text-sm text-muted-foreground mb-3">
                  Can't wait to get some games in!
                </p>
                <a 
                  href="https://imported-pickle-bc8.notion.site/Quick-Guide-How-to-Use-Badminton-Court-1f212fd3b8cd80bca699c31143a16292"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:underline"
                >
                  Read the full guide
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
              
              <div className="px-1">
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">Booking Rules</h4>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  <li>• Max {MAX_BOOKINGS_PER_DAY} bookings per day, 6 players per booking</li>
                  <li>• 5:00-6:30 PM reserved for Core Team</li>
                  <li>• 6:30-7:30 PM supports 1v1 or 2v2</li>
                  <li>• Join games at your skill level or higher</li>
                </ul>
              </div>
            </div>
          )}
        </section>

        {/* Hero for non-logged in users */}
        {!user && (
          <div className="mb-8 text-center py-8 border-b border-border">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-2">Book Your Court</h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Sign in with Discord to book badminton courts and join games.
            </p>
          </div>
        )}

        {/* Date picker */}
        <div className="mb-8">
          <DatePicker selectedDate={selectedDate} onDateChange={setSelectedDate} />
        </div>

        {/* Stats bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold">
              {formatDateForDisplay(selectedDate, {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}
            </h2>
            <p className="text-sm text-muted-foreground">
              {dataLoading ? "Loading..." : `${availableSlots} available · ${totalBookings} booked`}
            </p>
          </div>
          
          {user && user.hasCompletedOnboarding && (
            <div className="flex items-center gap-3">
              {userBookingsToday > 0 && (
                <span className="hidden sm:inline-block text-xs text-muted-foreground">
                  {userBookingsToday}/{MAX_BOOKINGS_PER_DAY} today
                </span>
              )}
              <NewBookingDialog 
                selectedDate={selectedDate} 
                onBookingCreated={handleRefresh}
                userBookingsToday={userBookingsToday}
              />
            </div>
          )}
        </div>

        {user && !user.hasCompletedOnboarding && (
          <div className="mb-6 rounded-xl border border-border bg-muted/30 p-4 text-center">
            <p className="text-sm text-muted-foreground">
              Complete your profile setup to start booking.
            </p>
          </div>
        )}

        {/* Loading state */}
        {dataLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
          </div>
        )}

        {/* Slots */}
        {!dataLoading && (
          <div className="space-y-8">
            {/* Afternoon slots */}
            {afternoonSlots.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Afternoon</h3>
                  <span className="text-xs text-muted-foreground">12:30 - 4:30 PM</span>
                </div>
                <div className="space-y-2">
                  {afternoonSlots.map(renderSlot)}
                </div>
              </section>
            )}

            {/* Evening slots */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Evening</h3>
                <span className="text-xs text-muted-foreground">5:00 PM - 12:30 AM</span>
              </div>
              <div className="space-y-2">
                {eveningSlots.map(renderSlot)}
              </div>
            </section>
          </div>
        )}
      </main>
      
      <Footer />
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
