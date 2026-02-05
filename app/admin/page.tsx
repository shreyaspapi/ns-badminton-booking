"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AuthProvider, useAuth } from "@/lib/auth-context"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Shield, Plus, X, Trash2, CalendarIcon, Lock, Unlock } from "lucide-react"
import {
  getAdminUsernames,
  addAdmin,
  removeAdmin,
  getBookings,
  deleteBooking,
  getUsers,
  getUnblockedCoreDates,
  unblockCoreSlot,
  blockCoreSlot,
} from "@/lib/store"
import type { Booking } from "@/lib/types"
import { CORE_TEAM_SLOT } from "@/lib/types"

function AdminPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [admins, setAdmins] = useState<string[]>([])
  const [newAdmin, setNewAdmin] = useState("")
  const [bookings, setBookings] = useState<Booking[]>([])
  const [unblockedDates, setUnblockedDates] = useState<string[]>([])
  const [refreshKey, setRefreshKey] = useState(0)
  const [calendarOpen, setCalendarOpen] = useState(false)

  useEffect(() => {
    if (!isLoading && (!user || !user.isAdmin)) {
      router.push("/")
    }
  }, [isLoading, user, router])

  useEffect(() => {
    setAdmins(getAdminUsernames())
    setBookings(getBookings())
    setUnblockedDates(getUnblockedCoreDates())
  }, [refreshKey])

  const handleAddAdmin = () => {
    if (newAdmin.trim()) {
      addAdmin(newAdmin.trim())
      setNewAdmin("")
      setRefreshKey((k) => k + 1)
    }
  }

  const handleRemoveAdmin = (username: string) => {
    removeAdmin(username)
    setRefreshKey((k) => k + 1)
  }

  const handleDeleteBooking = (id: string) => {
    deleteBooking(id)
    setRefreshKey((k) => k + 1)
  }

  const handleUnblockDate = (date: Date | undefined) => {
    if (date) {
      const dateStr = date.toISOString().split("T")[0]
      unblockCoreSlot(dateStr)
      setRefreshKey((k) => k + 1)
      setCalendarOpen(false)
    }
  }

  const handleBlockDate = (date: string) => {
    blockCoreSlot(date)
    setRefreshKey((k) => k + 1)
  }

  if (isLoading || !user || !user.isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
      </div>
    )
  }

  const users = getUsers()
  const sortedBookings = [...bookings].sort((a, b) => {
    const dateCompare = b.date.localeCompare(a.date)
    if (dateCompare !== 0) return dateCompare
    return a.timeSlot.localeCompare(b.timeSlot)
  })

  const sortedUnblockedDates = [...unblockedDates].sort()

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-lg font-medium text-foreground">Admin</h1>
          <p className="text-sm text-muted-foreground">Manage admins, core team slot, and bookings</p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-border p-4">
            <p className="text-2xl font-medium text-foreground">{bookings.length}</p>
            <p className="text-sm text-muted-foreground">Bookings</p>
          </div>
          <div className="rounded-xl border border-border p-4">
            <p className="text-2xl font-medium text-foreground">{users.length}</p>
            <p className="text-sm text-muted-foreground">Users</p>
          </div>
          <div className="rounded-xl border border-border p-4">
            <p className="text-2xl font-medium text-foreground">{admins.length}</p>
            <p className="text-sm text-muted-foreground">Admins</p>
          </div>
        </div>

        {/* Core Team Slot Management */}
        <section className="mb-8">
          <h2 className="mb-1 text-sm font-medium text-foreground">Core team slot ({CORE_TEAM_SLOT})</h2>
          <p className="mb-3 text-xs text-muted-foreground">
            This slot is blocked by default. Unblock specific dates to allow regular bookings.
          </p>

          <div className="mb-3">
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 bg-transparent">
                  <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
                  Unblock a date
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  onSelect={handleUnblockDate}
                  disabled={(date) => {
                    const dateStr = date.toISOString().split("T")[0]
                    const today = new Date()
                    today.setHours(0, 0, 0, 0)
                    return date < today || unblockedDates.includes(dateStr)
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {sortedUnblockedDates.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
              No dates unblocked. The {CORE_TEAM_SLOT} slot is reserved for core team.
            </div>
          ) : (
            <div className="space-y-2">
              {sortedUnblockedDates.map((date) => {
                const dateObj = new Date(date + "T00:00:00")
                const isPast = dateObj < new Date(new Date().toDateString())
                return (
                  <div
                    key={date}
                    className={`flex items-center justify-between rounded-lg border border-border px-3 py-2 ${isPast ? "opacity-50" : ""}`}
                  >
                    <div className="flex items-center gap-2">
                      <Unlock className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm text-foreground">
                        {dateObj.toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {CORE_TEAM_SLOT} open for booking
                      </span>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                          <Lock className="h-3.5 w-3.5" />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Block this date?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will reserve the {CORE_TEAM_SLOT} slot for the core team on this date. Any existing bookings will remain.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-transparent">Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleBlockDate(date)}>
                            Block
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* Admin Management */}
        <section className="mb-8">
          <h2 className="mb-3 text-sm font-medium text-foreground">Admin users</h2>

          <div className="mb-3 flex gap-2">
            <Input
              placeholder="Discord username"
              value={newAdmin}
              onChange={(e) => setNewAdmin(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddAdmin()}
              className="h-9"
            />
            <Button onClick={handleAddAdmin} size="sm" className="h-9">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Add
            </Button>
          </div>

          <div className="space-y-2">
            {admins.map((admin) => (
              <div
                key={admin}
                className="flex items-center justify-between rounded-lg bg-muted px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-sm text-foreground">{admin}</span>
                  {admin.toLowerCase() === user.discordUsername.toLowerCase() && (
                    <span className="text-xs text-muted-foreground">(you)</span>
                  )}
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-30"
                      disabled={admin.toLowerCase() === user.discordUsername.toLowerCase()}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remove admin</AlertDialogTitle>
                      <AlertDialogDescription>
                        Remove {admin} from admin access?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-transparent">Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleRemoveAdmin(admin)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Remove
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </div>
        </section>

        {/* All Bookings */}
        <section>
          <h2 className="mb-3 text-sm font-medium text-foreground">All bookings</h2>

          {sortedBookings.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              No bookings yet
            </div>
          ) : (
            <div className="space-y-2">
              {sortedBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="group flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {new Date(booking.date + "T00:00:00").toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <span className="text-sm text-muted-foreground">{booking.timeSlot}</span>
                      <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                        {booking.gameType}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {booking.players.map((p) => p.discordUsername).join(", ")}
                    </p>
                  </div>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete booking</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete this booking.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-transparent">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteBooking(booking.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default function Page() {
  return (
    <AuthProvider>
      <AdminPage />
    </AuthProvider>
  )
}
