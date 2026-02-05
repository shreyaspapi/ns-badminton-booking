"use client"

import Link from "next/link"

export function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 border-t border-border bg-background z-50">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
          <p>
            Built by{" "}
            <Link 
              href="https://onera.chat" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-medium text-foreground hover:underline underline-offset-4"
            >
              Onera Team
            </Link>
          </p>
          <p className="text-xs">
            NS Badminton © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  )
}
