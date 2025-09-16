"use client"

import React from "react"
import { cn } from "@/lib/utils"

export type RatingCirclesProps = {
  value: number
  onChange: (value: number) => void
  max?: number
  min?: number
  className?: string
  label?: string
}

export function RatingCircles({ value, onChange, max = 10, min = 1, className, label }: RatingCirclesProps) {
  const count = max - min + 1
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault()
      onChange(Math.min(max, value + 1))
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault()
      onChange(Math.max(min, value - 1))
    } else if (e.key >= "1" && e.key <= String(count)) {
      // Jump by number keys within range (1..count)
      const n = Number(e.key)
      const newVal = Math.min(max, Math.max(min, n))
      onChange(newVal)
    }
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {Array.from({ length: count }, (_, i) => {
        const v = i + min
        const selected = v <= value
        return (
          <button
            key={v}
            type="button"
            aria-label={(label ? label + " " : "") + v}
            className={cn(
              "size-8 rounded-full border transition-all focus:outline-none focus-visible:ring-4",
              selected
                ? "bg-green-600 border-green-600 text-white shadow-md"
                : "bg-white/70 border-green-300 text-green-700 hover:bg-green-50",
            )}
            onClick={() => onChange(v)}
          >
            {v}
          </button>
        )
      })}
      <div
        role="slider"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-label={label || "rating"}
        tabIndex={0}
        className="sr-only"
        onKeyDown={handleKeyDown}
      />
    </div>
  )
}
