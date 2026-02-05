"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"

interface DatePickerProps {
  selectedDate: string
  onDateChange: (date: string) => void
}

export function DatePicker({ selectedDate, onDateChange }: DatePickerProps) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const selected = new Date(selectedDate)
  
  const dates = Array.from({ length: 14 }, (_, i) => {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    return date
  })

  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0]
  }

  const isSelected = (date: Date) => {
    return formatDate(date) === selectedDate
  }

  const isToday = (date: Date) => {
    return formatDate(date) === formatDate(today)
  }

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
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {selected.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </span>
        <div className="flex gap-1">
          <button
            onClick={handlePrev}
            disabled={formatDate(selected) === formatDate(today)}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={handleNext}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        {dates.map((date) => {
          const dayName = date.toLocaleDateString("en-US", { weekday: "short" })
          const dayNum = date.getDate()
          
          return (
            <button
              key={formatDate(date)}
              onClick={() => onDateChange(formatDate(date))}
              className={`flex min-w-[52px] flex-col items-center rounded-lg px-2.5 py-2 transition-all ${
                isSelected(date)
                  ? "bg-foreground text-background"
                  : "hover:bg-muted"
              }`}
            >
              <span className={`text-[10px] uppercase tracking-wider ${
                isSelected(date) ? "text-background/70" : "text-muted-foreground"
              }`}>
                {dayName}
              </span>
              <span className="text-lg font-medium tabular-nums">{dayNum}</span>
              {isToday(date) && (
                <div className={`mt-0.5 h-1 w-1 rounded-full ${
                  isSelected(date) ? "bg-background" : "bg-foreground"
                }`} />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
