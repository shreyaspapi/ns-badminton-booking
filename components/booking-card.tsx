"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { UserPlus, Trash2, Users, Clock } from "lucide-react"
import type { Booking, SkillLevel } from "@/lib/types"
import { canJoinBooking, formatTimeSlot, getJoinBlockedReason, MAX_PLAYERS_PER_BOOKING } from "@/lib/types"
import { updateBooking, deleteBooking } from "@/lib/store"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface BookingCardProps {
  booking: Booking
  onUpdate: () => void
}

export function BookingCard({ booking, onUpdate }: BookingCardProps) {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  
  const currentPlayers = booking.players.length
  const expectedPlayers = booking.playerCount
  const spotsOpen = Math.max(0, Math.min(expectedPlayers, MAX_PLAYERS_PER_BOOKING) - currentPlayers)
  const isFullParty = currentPlayers >= expectedPlayers || currentPlayers >= MAX_PLAYERS_PER_BOOKING

  const isCreator = user?.discordId === booking.createdById
  const isPlayerInBooking = booking.players.some((p) => p.discordId === user?.discordId)
  const canJoin = user?.skillLevel && !isPlayerInBooking && canJoinBooking(booking, user.skillLevel as SkillLevel)
  const joinBlockedReason = user?.skillLevel && !isPlayerInBooking 
    ? getJoinBlockedReason(booking, user.skillLevel as SkillLevel) 
    : null

  const handleJoin = async () => {
    if (!user || !user.skillLevel) return
    setIsLoading(true)
    
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
    
    try {
      await updateBooking(updatedBooking)
      onUpdate()
    } catch (error) {
      console.error("Error joining booking:", error)
    }
    setIsLoading(false)
  }

  const handleLeave = async () => {
    if (!user) return
    setIsLoading(true)
    
    const updatedBooking: Booking = {
      ...booking,
      players: booking.players.filter((p) => p.discordId !== user.discordId),
    }
    
    try {
      await updateBooking(updatedBooking)
      onUpdate()
    } catch (error) {
      console.error("Error leaving booking:", error)
    }
    setIsLoading(false)
  }

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      await deleteBooking(booking.id)
      onUpdate()
    } catch (error) {
      console.error("Error deleting booking:", error)
    }
    setIsLoading(false)
  }

  return (
    <div className={`rounded-xl border p-4 transition-all ${
      isPlayerInBooking ? 'border-foreground/20 bg-muted/30' : 'border-border bg-card'
    }`}>
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold">{formatTimeSlot(booking.timeSlot)}</span>
            </div>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {booking.gameType}
            </span>
            {isPlayerInBooking && (
              <span className="text-xs text-foreground bg-foreground/10 px-2 py-0.5 rounded-full">
                Joined
              </span>
            )}
            {isFullParty && (
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                Full
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {booking.skillLevel}+ · {currentPlayers}/{expectedPlayers} players
            {spotsOpen > 0 && ` · ${spotsOpen} open`}
          </p>
        </div>
        
        {/* Delete button */}
        {(isCreator || user?.isAdmin) && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                disabled={isLoading}
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-[90vw] sm:max-w-lg">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete booking?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove all players from this slot.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* Players */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {booking.players.map((player) => (
          <div
            key={player.discordId}
            className={`flex items-center gap-1.5 rounded-full px-2 py-1 text-xs ${
              player.discordId === user?.discordId 
                ? 'bg-foreground text-background' 
                : 'bg-muted'
            }`}
          >
            <div className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold ${
              player.discordId === user?.discordId
                ? 'bg-background/20 text-background'
                : 'bg-foreground/10 text-foreground'
            }`}>
              {player.discordUsername.slice(0, 1).toUpperCase()}
            </div>
            <span className="font-medium max-w-[80px] truncate">{player.discordUsername}</span>
            {player.discordId === booking.createdById && (
              <span className="text-[10px] opacity-70">host</span>
            )}
          </div>
        ))}
        
        {/* Empty spots */}
        {spotsOpen > 0 && Array.from({ length: Math.min(spotsOpen, 3) }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="flex items-center gap-1.5 rounded-full border border-dashed border-border px-2 py-1 text-xs text-muted-foreground"
          >
            <div className="h-5 w-5 rounded-full border border-dashed border-border" />
            <span>Open</span>
          </div>
        ))}
        {spotsOpen > 3 && (
          <span className="flex items-center text-xs text-muted-foreground px-2">
            +{spotsOpen - 3}
          </span>
        )}
      </div>

      {/* Actions */}
      {user && (
        <div className="flex gap-2">
          {canJoin && (
            <Button 
              onClick={handleJoin} 
              size="sm"
              className="h-9 flex-1 sm:flex-none"
              disabled={isLoading}
            >
              <UserPlus className="mr-1.5 h-4 w-4" />
              {isLoading ? "Joining..." : "Join"}
            </Button>
          )}
          {isPlayerInBooking && !isCreator && (
            <Button 
              onClick={handleLeave} 
              variant="outline" 
              size="sm"
              className="h-9 flex-1 sm:flex-none"
              disabled={isLoading}
            >
              {isLoading ? "Leaving..." : "Leave"}
            </Button>
          )}
        </div>
      )}

      {/* Blocked reason */}
      {!canJoin && !isPlayerInBooking && user && user.skillLevel && joinBlockedReason && (
        <p className="text-xs text-muted-foreground mt-2">
          {joinBlockedReason}
        </p>
      )}
    </div>
  )
}
