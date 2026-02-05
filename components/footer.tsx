"use client"

import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border mt-auto">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
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
