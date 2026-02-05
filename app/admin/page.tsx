"use client"

import { useEffect, useState, useCallback } from "react"
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
import { 
  Shield, Plus, X, Trash2, CalendarIcon, Lock, Unlock, 
  Users, BookOpen, ArrowLeft, Clock
} from "lucide-react"
import { Footer } from "@/components/footer"
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
import type { Booking, User } from "@/lib/types"
import { CORE_TEAM_SLOTS, formatTimeSlot } from "@/lib/types"
import Link from "next/link"

function AdminPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [admins, setAdmins] = useState<string[]>([])
  const [newAdmin, setNewAdmin] = useState("")
  const [bookings, setBookings] = useState<Booking[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [unblockedDates, setUnblockedDates] = useState<string[]>([])
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    if (!isLoading && (!user || !user.isAdmin)) {
      router.push("/")
    }
  }, [isLoading, user, router])

  const loadData = useCallback(async () => {
    setDataLoading(true)
    try {
      const [adminsData, bookingsData, usersData, unblockedData] = await Promise.all([
        getAdminUsernames(),
        getBookings(),
        getUsers(),
        getUnblockedCoreDates(),
      ])
      setAdmins(adminsData)
      setBookings(bookingsData)
      setUsers(usersData)
      setUnblockedDates(unblockedData)
    } catch (error) {
      console.error("Error loading data:", error)
    }
    setDataLoading(false)
  }, [])

  useEffect(() => {
    if (user?.isAdmin) {
      loadData()
    }
  }, [user?.isAdmin, loadData])

  const handleAddAdmin = async () => {
    if (newAdmin.trim()) {
      setActionLoading(true)
      try {
        await addAdmin(newAdmin.trim())
        setNewAdmin("")
        await loadData()
      } catch (error) {
        console.error("Error adding admin:", error)
      }
      setActionLoading(false)
    }
  }

  const handleRemoveAdmin = async (username: string) => {
    setActionLoading(true)
    try {
      await removeAdmin(username)
      await loadData()
    } catch (error) {
      console.error("Error removing admin:", error)
    }
    setActionLoading(false)
  }

  const handleDeleteBooking = async (id: string) => {
    setActionLoading(true)
    try {
      await deleteBooking(id)
      await loadData()
    } catch (error) {
      console.error("Error deleting booking:", error)
    }
    setActionLoading(false)
  }

  const handleUnblockDate = async (date: Date | undefined) => {
    if (date) {
      setActionLoading(true)
      const dateStr = date.toISOString().split("T")[0]
      try {
        await unblockCoreSlot(dateStr)
        await loadData()
      } catch (error) {
        console.error("Error unblocking date:", error)
      }
      setCalendarOpen(false)
      setActionLoading(false)
    }
  }

  const handleBlockDate = async (date: string) => {
    setActionLoading(true)
    try {
      await blockCoreSlot(date)
      await loadData()
    } catch (error) {
      console.error("Error blocking date:", error)
    }
    setActionLoading(false)
  }

  if (isLoading || !user || !user.isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  const sortedBookings = [...bookings].sort((a, b) => {
    const dateCompare = b.date.localeCompare(a.date)
    if (dateCompare !== 0) return dateCompare
    return a.timeSlot.localeCompare(b.timeSlot)
  })

  const sortedUnblockedDates = [...unblockedDates].sort()
  const coreTeamSlotsDisplay = CORE_TEAM_SLOTS.map(formatTimeSlot).join(", ")

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-6 sm:py-8">
        {/* Back button */}
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to bookings
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground mt-1">Manage admins, core team slots, and bookings</p>
        </div>

        {dataLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
                    <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <p className="text-3xl font-bold">{bookings.length}</p>
                <p className="text-sm text-muted-foreground">Total Bookings</p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/30">
                    <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <p className="text-3xl font-bold">{users.length}</p>
                <p className="text-sm text-muted-foreground">Users</p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30">
                    <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <p className="text-3xl font-bold">{admins.length}</p>
                <p className="text-sm text-muted-foreground">Admins</p>
              </div>
            </div>

            {/* Core Team Slots */}
            <section className="mb-8 rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30">
                  <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h2 className="font-semibold">Core Team Slots</h2>
                  <p className="text-sm text-muted-foreground">{coreTeamSlotsDisplay}</p>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground mb-4">
                These slots are blocked by default. Unblock specific dates to allow regular bookings.
              </p>

              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="mb-4" disabled={actionLoading}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
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

              {sortedUnblockedDates.length === 0 ? (
                <div className="rounded-xl border-2 border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  No dates unblocked. Core team slots are reserved.
                </div>
              ) : (
                <div className="space-y-2">
                  {sortedUnblockedDates.map((date) => {
                    const dateObj = new Date(date + "T00:00:00")
                    const isPast = dateObj < new Date(new Date().toDateString())
                    return (
                      <div
                        key={date}
                        className={`flex items-center justify-between rounded-xl border border-border p-4 ${isPast ? "opacity-50" : ""}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/30">
                            <Unlock className="h-4 w-4 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {dateObj.toLocaleDateString("en-US", {
                                weekday: "long",
                                month: "short",
                                day: "numeric",
                              })}
                            </p>
                            <p className="text-xs text-muted-foreground">Core slots open for booking</p>
                          </div>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" disabled={actionLoading}>
                              <Lock className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Block this date?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will reserve the core team slots for this date. Existing bookings will remain.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
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
            <section className="mb-8 rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30">
                  <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h2 className="font-semibold">Admin Users</h2>
              </div>

              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="Discord username"
                  value={newAdmin}
                  onChange={(e) => setNewAdmin(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddAdmin()}
                  className="h-11"
                  disabled={actionLoading}
                />
                <Button onClick={handleAddAdmin} className="h-11" disabled={actionLoading}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add
                </Button>
              </div>

              <div className="space-y-2">
                {admins.map((admin) => (
                  <div
                    key={admin}
                    className="flex items-center justify-between rounded-xl bg-secondary/50 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                        {admin.slice(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{admin}</p>
                        {admin.toLowerCase() === user.discordUsername.toLowerCase() && (
                          <p className="text-xs text-muted-foreground">This is you</p>
                        )}
                      </div>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={admin.toLowerCase() === user.discordUsername.toLowerCase() || actionLoading}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove admin?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Remove {admin} from admin access?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
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
            <section className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
                  <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="font-semibold">All Bookings</h2>
              </div>

              {sortedBookings.length === 0 ? (
                <div className="rounded-xl border-2 border-dashed border-border p-8 text-center text-muted-foreground">
                  No bookings yet
                </div>
              ) : (
                <div className="space-y-2">
                  {sortedBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="group flex items-center justify-between rounded-xl border border-border p-4 transition-colors hover:bg-secondary/30"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-sm font-bold">
                            {new Date(booking.date + "T00:00:00").toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{formatTimeSlot(booking.timeSlot)}</p>
                            <span className="rounded-full bg-secondary px-2 py-0.5 text-xs">
                              {booking.gameType}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {booking.players.map((p) => p.discordUsername).join(", ")}
                          </p>
                        </div>
                      </div>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            disabled={actionLoading}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete booking?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete this booking.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
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
          </>
        )}
      </main>
      
      <Footer />
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
