"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { useRef, useEffect } from "react"
import { parseLocalDate, formatLocalDate } from "@/lib/types"

interface DatePickerProps {
  selectedDate: string
  onDateChange: (date: string) => void
}

export function DatePicker({ selectedDate, onDateChange }: DatePickerProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const selected = parseLocalDate(selectedDate)
  
  const dates = Array.from({ length: 14 }, (_, i) => {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    return date
  })

  const formatDate = (date: Date) => {
    return formatLocalDate(date)
  }

  const isSelected = (date: Date) => {
    return formatDate(date) === selectedDate
  }

  const isToday = (date: Date) => {
    return formatDate(date) === formatDate(today)
  }

  // Scroll selected date into view on mount
  useEffect(() => {
    if (scrollRef.current) {
      const selectedIndex = dates.findIndex(d => formatDate(d) === selectedDate)
      const button = scrollRef.current.children[selectedIndex] as HTMLElement
      if (button) {
        const container = scrollRef.current
        const scrollLeft = button.offsetLeft - container.offsetWidth / 2 + button.offsetWidth / 2
        container.scrollTo({ left: scrollLeft, behavior: 'smooth' })
      }
    }
  }, [])

  const handlePrev = () => {
    const newDate = new Date(selected)
    newDate.setDate(selected.getDate() - 1)
    if (newDate >= today) {
      onDateChange(formatDate(newDate))
    }
  }

  const handleNext = () => {
    const newDate = new Date(selected)
    newDate.setDate(selected.getDate() + 1)
    const maxDate = new Date(today)
    maxDate.setDate(today.getDate() + 13)
    if (newDate <= maxDate) {
      onDateChange(formatDate(newDate))
    }
  }

  return (
    <div className="space-y-4">
      {/* Month header with nav */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            {selected.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </h2>
          <p className="text-sm text-muted-foreground">
            Select a date to view available slots
          </p>
        </div>
        <div className="flex gap-1">
          <button
            onClick={handlePrev}
            disabled={formatDate(selected) === formatDate(today)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-30"
            aria-label="Previous day"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={handleNext}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Next day"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Date scroll - with proper padding to prevent clipping */}
      <div className="relative -mx-4 sm:mx-0">
        <div 
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide scroll-smooth px-4 sm:px-0"
          style={{ 
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {dates.map((date) => {
            const dayName = date.toLocaleDateString("en-US", { weekday: "short" })
            const dayNum = date.getDate()
            
            return (
              <button
                key={formatDate(date)}
                onClick={() => onDateChange(formatDate(date))}
                className={`relative flex flex-col items-center justify-center flex-shrink-0 w-14 sm:w-16 h-16 sm:h-[72px] rounded-xl transition-all active:scale-95 ${
                  isSelected(date)
                    ? "bg-foreground text-background"
                    : "bg-secondary/50 active:bg-secondary text-foreground"
                }`}
              >
                <span className={`text-[10px] sm:text-[11px] font-medium uppercase tracking-wide ${
                  isSelected(date) ? "text-background/70" : "text-muted-foreground"
                }`}>
                  {dayName}
                </span>
                <span className="text-lg sm:text-xl font-semibold tabular-nums leading-none mt-1">{dayNum}</span>
                {isToday(date) && (
                  <div className={`absolute bottom-1.5 sm:bottom-2 h-1 w-1 rounded-full ${
                    isSelected(date) ? "bg-background" : "bg-foreground"
                  }`} />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
