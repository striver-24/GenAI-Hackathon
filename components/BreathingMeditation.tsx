"use client"

import React, { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type BreathingMeditationProps = {
  className?: string
}

export default function BreathingMeditation({ className }: BreathingMeditationProps) {
  const [running, setRunning] = useState(false)
  const [phase, setPhase] = useState<"in" | "out">("in")
  const [overlayOpen, setOverlayOpen] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!running) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }
    // 4s in, 4s out loop
    intervalRef.current = setInterval(() => {
      setPhase((p) => (p === "in" ? "out" : "in"))
    }, 4000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [running])

  const waterHeight = phase === "in" ? "70%" : "10%"

  const Content = (
    <div className={cn("relative w-full max-w-md mx-auto p-4", className)}>
      <div className="relative rounded-xl overflow-hidden border border-blue-200 bg-white/70" style={{ height: 240 }}>
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="text-center">
            <div className="text-2xl font-semibold text-blue-700 mb-1">{phase === "in" ? "Breathe In" : "Breathe Out"}</div>
            <div className="text-sm text-blue-600">Follow the gentle rhythm</div>
          </div>
        </div>
        <div
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-600 to-blue-400/80 transition-[height] duration-[4000ms] ease-in-out"
          style={{ height: waterHeight }}
        />
      </div>
      <div className="mt-3 flex gap-2">
        <Button onClick={() => setRunning((r) => !r)} className="bg-blue-600 hover:bg-blue-700">
          {running ? "Pause" : "Start"}
        </Button>
        <Button variant="outline" onClick={() => setOverlayOpen(true)} className="border-blue-300 text-blue-700 hover:bg-blue-50">
          Open Full Screen
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {Content}
      {overlayOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full h-full md:h-[80vh] md:max-w-3xl md:rounded-2xl md:overflow-hidden md:border md:border-blue-300 bg-white/40">
            <button
              onClick={() => setOverlayOpen(false)}
              className="absolute top-4 right-4 z-20 rounded-full bg-white/90 text-blue-700 border border-blue-200 px-3 py-1 hover:bg-white"
              aria-label="Close"
            >
              ✕
            </button>
            <div className="absolute inset-0">
              <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                <div className="text-center">
                  <div className="text-3xl md:text-5xl font-semibold text-blue-800 mb-2">
                    {phase === "in" ? "Breathe In" : "Breathe Out"}
                  </div>
                  <div className="text-blue-700 md:text-xl">Inhale for 4s • Exhale for 4s</div>
                </div>
              </div>
              <div
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-700 to-blue-400/80 transition-[height] duration-[4000ms] ease-in-out"
                style={{ height: waterHeight }}
              />
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 z-20">
              <Button onClick={() => setRunning((r) => !r)} className="bg-blue-600 hover:bg-blue-700">
                {running ? "Pause" : "Start"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setPhase("in")
                  setRunning(false)
                }}
                className="border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                Reset
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
