"use client"

import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, Shield, User, Menu } from "lucide-react"
import Link from "next/link"

export function Header() {
  const { user, login, logout } = useAuth()

  return (
    <header className="sticky top-0 z-50 w-full bg-background">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
        <Link href="/" className="text-base font-medium tracking-tight text-foreground">
          NS Badminton
        </Link>

        <div className="flex items-center gap-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 gap-2 px-2 text-sm font-normal">
                  <span className="text-foreground">{user.discordUsername}</span>
                  {user.isAdmin && <Shield className="h-3.5 w-3.5 text-muted-foreground" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center gap-2 text-sm">
                    <User className="h-3.5 w-3.5" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                {user.isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="flex items-center gap-2 text-sm">
                      <Shield className="h-3.5 w-3.5" />
                      Admin
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-muted-foreground text-sm">
                  <LogOut className="mr-2 h-3.5 w-3.5" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={login} size="sm" className="h-8 text-sm font-normal">
              Sign in
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
