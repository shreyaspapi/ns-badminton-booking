"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, AlertCircle, Info, Clock, Users, Trophy } from "lucide-react"
import type { Booking, TimeSlot } from "@/lib/types"
import { 
  TIME_SLOTS, 
  CORE_TEAM_SLOTS, 
  FLEXIBLE_GAME_TYPE_SLOTS,
  MAX_BOOKINGS_PER_DAY,
  RECOMMENDED_PLAYERS,
  MAX_PLAYERS_PER_BOOKING,
  formatTimeSlot,
  isFlexibleGameTypeSlot,
  formatDateForDisplay
} from "@/lib/types"
import { addBooking, getBookingsForDate, getUnblockedCoreDates } from "@/lib/store"

interface NewBookingDialogProps {
  selectedDate: string
  onBookingCreated: () => void
  userBookingsToday: number
}

export function NewBookingDialog({ selectedDate, onBookingCreated, userBookingsToday }: NewBookingDialogProps) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [timeSlot, setTimeSlot] = useState<TimeSlot | "">("")
  const [gameType, setGameType] = useState<"1v1" | "2v2">("2v2")
  const [playerCount, setPlayerCount] = useState<string>("4")
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [loadingSlots, setLoadingSlots] = useState(false)

  const loadAvailableSlots = useCallback(async () => {
    setLoadingSlots(true)
    try {
      const [existingBookings, unblockedDates] = await Promise.all([
        getBookingsForDate(selectedDate),
        getUnblockedCoreDates()
      ])
      
      const bookedSlots = existingBookings.map((b) => b.timeSlot)
      const coreSlotAvailable = unblockedDates.includes(selectedDate)
      
      const slots = TIME_SLOTS.filter((slot) => {
        if (bookedSlots.includes(slot)) return false
        if (CORE_TEAM_SLOTS.includes(slot) && !coreSlotAvailable) return false
        return true
      })
      
      setAvailableSlots(slots)
    } catch (error) {
      console.error("Error loading slots:", error)
    }
    setLoadingSlots(false)
  }, [selectedDate])

  useEffect(() => {
    if (open) {
      loadAvailableSlots()
      // Reset form
      setTimeSlot("")
      setGameType("2v2")
      setPlayerCount("4")
    }
  }, [open, loadAvailableSlots])

  if (!user || !user.skillLevel) return null

  // Check if user has reached booking limit
  const hasReachedLimit = userBookingsToday >= MAX_BOOKINGS_PER_DAY

  const handleSubmit = async () => {
    if (!timeSlot || !user.skillLevel) return
    
    setIsLoading(true)
    
    // Determine game type - for flexible slots, use user's choice; otherwise 2v2
    const finalGameType = isFlexibleGameTypeSlot(timeSlot) ? gameType : "2v2"
    const recommendedCount = finalGameType === "1v1" ? 2 : RECOMMENDED_PLAYERS
    const count = parseInt(playerCount) || recommendedCount

    const booking: Booking = {
      id: crypto.randomUUID(),
      date: selectedDate,
      timeSlot,
      gameType: finalGameType,
      createdBy: user.discordUsername,
      createdById: user.discordId,
      playerCount: count,
      players: [
        {
          discordId: user.discordId,
          discordUsername: user.discordUsername,
          skillLevel: user.skillLevel,
        },
      ],
      skillLevel: user.skillLevel,
      createdAt: new Date().toISOString(),
    }

    try {
      await addBooking(booking)
      setOpen(false)
      onBookingCreated()
    } catch (error) {
      console.error("Error creating booking:", error)
    }
    setIsLoading(false)
  }

  const isFlexible = timeSlot ? isFlexibleGameTypeSlot(timeSlot) : false
  const selectedGameType = isFlexible ? gameType : "2v2"
  const recommendedPlayers = selectedGameType === "1v1" ? 2 : RECOMMENDED_PLAYERS

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          className="h-11 px-5 font-medium shadow-lg shadow-primary/25"
          disabled={hasReachedLimit}
        >
          <Plus className="mr-2 h-4 w-4" />
          Book Slot
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">Book a Court</DialogTitle>
          <DialogDescription className="text-base">
            {formatDateForDisplay(selectedDate)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {hasReachedLimit ? (
            <div className="flex items-start gap-3 rounded-xl bg-destructive/10 p-4">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-destructive">Booking limit reached</p>
                <p className="text-sm text-destructive/80">
                  You've reached your limit of {MAX_BOOKINGS_PER_DAY} bookings for today.
                </p>
              </div>
            </div>
          ) : loadingSlots ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : availableSlots.length === 0 ? (
            <div className="flex items-start gap-3 rounded-xl bg-secondary p-4">
              <AlertCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">No slots available</p>
                <p className="text-sm text-muted-foreground">
                  All slots are booked for this date. Try another day!
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Time slot selector */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Time Slot
                </Label>
                <Select value={timeSlot} onValueChange={(v) => setTimeSlot(v as TimeSlot)}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Choose a time slot" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSlots.map((slot) => {
                      const isCore = CORE_TEAM_SLOTS.includes(slot)
                      const isFlex = FLEXIBLE_GAME_TYPE_SLOTS.includes(slot)
                      return (
                        <SelectItem key={slot} value={slot} className="py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{formatTimeSlot(slot)}</span>
                            {isCore && (
                              <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full">
                                Core slot open
                              </span>
                            )}
                            {isFlex && (
                              <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded-full">
                                1v1 or 2v2
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Game type selector for flexible slots */}
              {isFlexible && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Game Type
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setGameType("1v1")}
                      className={`flex flex-col items-center gap-1 rounded-xl border-2 p-4 transition-all ${
                        gameType === "1v1"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/30"
                      }`}
                    >
                      <span className="text-2xl font-bold">1v1</span>
                      <span className="text-xs text-muted-foreground">Singles (2 players)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setGameType("2v2")}
                      className={`flex flex-col items-center gap-1 rounded-xl border-2 p-4 transition-all ${
                        gameType === "2v2"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/30"
                      }`}
                    >
                      <span className="text-2xl font-bold">2v2</span>
                      <span className="text-xs text-muted-foreground">Doubles (4 players)</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Info box */}
              {timeSlot && (
                <div className="rounded-xl bg-secondary p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p>
                        <span className="font-medium">{selectedGameType}</span> game - recommended {recommendedPlayers} players
                      </p>
                      <p className="text-muted-foreground mt-1">
                        Max {MAX_PLAYERS_PER_BOOKING} players per booking
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Player count */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">How many players do you have?</Label>
                <Select value={playerCount} onValueChange={setPlayerCount}>
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: MAX_PLAYERS_PER_BOOKING }, (_, i) => i + 1).map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num === 1
                          ? "Just me (looking for partners)"
                          : num < recommendedPlayers
                          ? `${num} players (looking for ${recommendedPlayers - num} more)`
                          : num === recommendedPlayers
                          ? `${num} players (full team)`
                          : `${num} players (extra players)`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  If you already have your group, select the total number. Others won't be able to join a full party.
                </p>
              </div>

              {/* Skill level display */}
              <div className="flex items-center gap-3 rounded-xl border border-border p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Trophy className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{user.skillLevel} Level</p>
                  <p className="text-sm text-muted-foreground">
                    Players at your level or higher can join
                  </p>
                </div>
              </div>

              {userBookingsToday > 0 && (
                <p className="text-center text-sm text-muted-foreground">
                  You have {userBookingsToday} of {MAX_BOOKINGS_PER_DAY} bookings today
                </p>
              )}
            </>
          )}
        </div>

        <DialogFooter className="gap-3 sm:gap-2">
          <Button 
            variant="outline" 
            onClick={() => setOpen(false)}
            className="flex-1 sm:flex-none h-11"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!timeSlot || availableSlots.length === 0 || hasReachedLimit || isLoading}
            className="flex-1 sm:flex-none h-11"
          >
            {isLoading ? "Creating..." : "Create Booking"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
