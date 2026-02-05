"use client"

import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { UserPlus, X } from "lucide-react"
import type { Booking } from "@/lib/types"
import { canJoinBooking, getMaxPlayersForSlot } from "@/lib/types"
import { updateBooking, deleteBooking, getUsers } from "@/lib/store"

interface BookingCardProps {
  booking: Booking
  onUpdate: () => void
}

export function BookingCard({ booking, onUpdate }: BookingCardProps) {
  const { user } = useAuth()
  const maxPlayers = getMaxPlayersForSlot(booking.timeSlot)
  const spotsLeft = maxPlayers - booking.players.length

  const isCreator = user?.discordId === booking.createdById
  const isPlayerInBooking = booking.players.some((p) => p.discordId === user?.discordId)
  const canJoin = user && !isPlayerInBooking && canJoinBooking(booking, user.skillLevel)

  const handleJoin = () => {
    if (!user) return
    const updatedBooking: Booking = {
      ...booking,
      players: [
        ...booking.players,
        {
          discordId: user.discordId,
          discordUsername: user.discordUsername,
          skillLevel: user.skillLevel,
        },
      ],
    }
    updateBooking(updatedBooking)
    onUpdate()
  }

  const handleLeave = () => {
    if (!user) return
    const updatedBooking: Booking = {
      ...booking,
      players: booking.players.filter((p) => p.discordId !== user.discordId),
    }
    updateBooking(updatedBooking)
    onUpdate()
  }

  const handleDelete = () => {
    deleteBooking(booking.id)
    onUpdate()
  }

  return (
    <div className="group rounded-xl border border-border bg-card p-4 transition-colors hover:border-foreground/20">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-lg font-medium text-foreground">{booking.timeSlot}</span>
            <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {booking.gameType}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {booking.skillLevel}+ skill level
          </p>
        </div>
        
        {(isCreator || user?.isAdmin) && (
          <button
            onClick={handleDelete}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {booking.players.map((player) => (
          <div
            key={player.discordId}
            className="flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1"
          >
            <div className="h-5 w-5 rounded-full bg-foreground/10 flex items-center justify-center text-[10px] font-medium text-foreground">
              {player.discordUsername.slice(0, 1).toUpperCase()}
            </div>
            <span className="text-sm text-foreground">{player.discordUsername}</span>
            {player.discordId === booking.createdById && (
              <span className="text-xs text-muted-foreground">host</span>
            )}
          </div>
        ))}
        {Array.from({ length: spotsLeft }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="flex items-center gap-1.5 rounded-full border border-dashed border-border px-2.5 py-1"
          >
            <div className="h-5 w-5 rounded-full border border-dashed border-border" />
            <span className="text-sm text-muted-foreground">Open</span>
          </div>
        ))}
      </div>

      {user && (
        <div className="mt-4 flex gap-2">
          {canJoin && (
            <Button onClick={handleJoin} size="sm" className="h-8 text-sm font-normal">
              <UserPlus className="mr-1.5 h-3.5 w-3.5" />
              Join
            </Button>
          )}
          {isPlayerInBooking && !isCreator && (
            <Button onClick={handleLeave} variant="outline" size="sm" className="h-8 text-sm font-normal bg-transparent">
              Leave
            </Button>
          )}
        </div>
      )}

      {!canJoin && !isPlayerInBooking && user && (
        <p className="mt-3 text-xs text-muted-foreground">
          {spotsLeft === 0
            ? "Game is full"
            : `Requires ${booking.skillLevel} or higher`}
        </p>
      )}
    </div>
  )
}
