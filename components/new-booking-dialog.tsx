"use client"

import { useState } from "react"
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
import { Plus, AlertCircle } from "lucide-react"
import type { Booking, TimeSlot } from "@/lib/types"
import { TIME_SLOTS, CORE_TEAM_SLOT, getGameTypeForSlot, getMaxPlayersForSlot } from "@/lib/types"
import { addBooking, getBookingsForDate, isCoreSlotUnblocked } from "@/lib/store"

interface NewBookingDialogProps {
  selectedDate: string
  onBookingCreated: () => void
}

export function NewBookingDialog({ selectedDate, onBookingCreated }: NewBookingDialogProps) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [timeSlot, setTimeSlot] = useState<TimeSlot | "">("")
  const [playerCount, setPlayerCount] = useState<string>("1")

  if (!user) return null

  const existingBookings = getBookingsForDate(selectedDate)
  const bookedSlots = existingBookings.map((b) => b.timeSlot)
  
  // Filter out core team slot unless it's unblocked for this date
  const coreSlotAvailable = isCoreSlotUnblocked(selectedDate)
  const availableSlots = TIME_SLOTS.filter((slot) => {
    if (bookedSlots.includes(slot)) return false
    if (slot === CORE_TEAM_SLOT && !coreSlotAvailable) return false
    return true
  })

  const handleSubmit = () => {
    if (!timeSlot) return

    const gameType = getGameTypeForSlot(timeSlot)
    const maxPlayers = getMaxPlayersForSlot(timeSlot)
    const count = Math.min(parseInt(playerCount), maxPlayers)

    const booking: Booking = {
      id: crypto.randomUUID(),
      date: selectedDate,
      timeSlot,
      gameType,
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

    addBooking(booking)
    setOpen(false)
    setTimeSlot("")
    setPlayerCount("1")
    onBookingCreated()
  }

  const selectedSlotGameType = timeSlot ? getGameTypeForSlot(timeSlot) : null
  const maxPlayersForSlot = timeSlot ? getMaxPlayersForSlot(timeSlot) : 4

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-8 text-sm font-normal">
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Book slot
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium">Book a slot</DialogTitle>
          <DialogDescription>
            {new Date(selectedDate).toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {availableSlots.length === 0 ? (
            <div className="flex items-center gap-2 rounded-lg bg-muted p-3 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              All slots are booked for this date.
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label className="text-sm font-normal text-muted-foreground">Time slot</Label>
                <Select value={timeSlot} onValueChange={(v) => setTimeSlot(v as TimeSlot)}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSlots.map((slot) => (
                      <SelectItem key={slot} value={slot}>
                        <span>{slot}</span>
                        <span className="ml-2 text-muted-foreground">
                          ({getGameTypeForSlot(slot)})
                          {slot === CORE_TEAM_SLOT && " - Core team slot"}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedSlotGameType && (
                <div className="rounded-lg bg-muted p-3 text-sm">
                  <span className="text-muted-foreground">This is a </span>
                  <span className="font-medium text-foreground">{selectedSlotGameType}</span>
                  <span className="text-muted-foreground">
                    {selectedSlotGameType === "1v1" ? " slot (max 2 players)" : " slot (max 4 players)"}
                  </span>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-sm font-normal text-muted-foreground">How many players?</Label>
                <Select value={playerCount} onValueChange={setPlayerCount}>
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: maxPlayersForSlot }, (_, i) => i + 1).map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num === 1
                          ? "Just me"
                          : num === maxPlayersForSlot
                          ? `${num} (full)`
                          : `${num} players`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-lg border border-border p-3 text-sm">
                <p className="text-foreground">
                  Your skill level: <span className="font-medium">{user.skillLevel}</span>
                </p>
                <p className="mt-1 text-muted-foreground">
                  Players at {user.skillLevel} or higher can join.
                </p>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => setOpen(false)} className="bg-transparent">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!timeSlot || availableSlots.length === 0}
          >
            Create booking
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
