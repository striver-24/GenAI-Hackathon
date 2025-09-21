"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Brain, Heart, Smile, Moon, Sun, Target, Zap, ChevronRight, Sparkles, Phone } from "lucide-react"

const OPTIONS = [
  { key: "mood", label: "Mood Boost", icon: Smile, color: "from-rose-400 to-pink-500" },
  { key: "energy", label: "Energy Up", icon: Zap, color: "from-amber-400 to-orange-500" },
  { key: "focus", label: "Deep Focus", icon: Brain, color: "from-sky-400 to-indigo-500" },
  { key: "calm", label: "Find Calm", icon: Heart, color: "from-emerald-400 to-green-500" },
  { key: "sleep", label: "Sleep Better", icon: Moon, color: "from-blue-400 to-violet-500" },
  { key: "routine", label: "Daily Routine", icon: Sun, color: "from-lime-400 to-green-500" },
] as const

type OptionKey = typeof OPTIONS[number]["key"]

function SimpleNavbar() {
  return (
    <nav className="fixed z-50 inset-x-0 top-3 flex justify-center">
      <div className="w-[95%] sm:w-[90%] md:max-w-5xl lg:max-w-6xl">
        <div className="rounded-full px-4 py-3 border border-white/30 bg-[#FDFAF6]/70 backdrop-blur-xl shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/mindspacelogo.png" alt="Mindspace" className="h-8 w-8 rounded-md" />
            <span className="hidden sm:inline text-lg font-semibold text-[#99BC85] tracking-wide">Mindspace</span>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <a href="/" className="inline-flex"><Button variant="ghost" className="rounded-full px-4">Dashboard</Button></a>
            <a href="/know-yourself" className="inline-flex"><Button variant="default" className="rounded-full px-4 bg-[#99BC85] hover:bg-[#86A976]">Know Yourself</Button></a>
          </div>
        </div>
      </div>
    </nav>
  )
}

function SimpleFooter() {
  return (
    <footer className="bg-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-[#2f6a3a]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          <div>
            <div className="flex items-center gap-3 mb-4"><img src="/mindspacelogo.png" alt="Mindspace" className="h-7 w-7 rounded-md" /><span className="text-lg font-semibold">Mindspace</span></div>
            <p className="text-sm opacity-90">Your safe space for mental wellness and growth.</p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <div className="space-y-2 text-sm">
              <a href="/" className="block hover:text-[#86A976]">Dashboard</a>
              <a href="/know-yourself" className="block hover:text-[#86A976]">Know Yourself</a>
              <a href="/profile" className="block hover:text-[#86A976]">Profile</a>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Emergency Support</h3>
            <a href="tel:+91-44-2464-0050" className="inline-block w-full"><Button className="bg-[#ff6b6b] hover:bg-[#e85d5d] text-white w-full flex items-center justify-center gap-2 rounded-full"><Phone className="h-4 w-4" /><span>Get Help Now</span></Button></a>
          </div>
        </div>
        <div className="border-t border-[#E4EFE7] mt-8 pt-8 text-center text-sm opacity-90"><p>&copy; {new Date().getFullYear()} Mindspace. All rights reserved. Made with ❤️ for mental wellness.</p></div>
      </div>
    </footer>
  )
}

export default function KnowYourselfPage() {
  const [selected, setSelected] = useState<OptionKey[]>([])
  const [note, setNote] = useState("")
  const [latest, setLatest] = useState<any | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('knowYourselfLatest')
      if (raw) setLatest(JSON.parse(raw))
    } catch {}
  }, [])

  const toggle = (k: OptionKey) => {
    setSelected((prev) => (prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]))
  }

  const suggestions = getSuggestions(selected)

  return (
    <div className="min-h-screen px-4 pt-24 pb-12 bg-gradient-to-br from-emerald-100 via-green-50 to-lime-200">
      <SimpleNavbar />
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-md border border-green-200 text-green-800 px-4 py-1.5 rounded-full text-sm">
            <Sparkles className="h-4 w-4 text-green-600" />
            <span>Interactive Wellbeing Explorer</span>
          </div>
          <h1 className="mt-4 text-4xl md:text-5xl font-bold text-green-800">Know Yourself</h1>
          <p className="mt-3 text-green-700 max-w-2xl mx-auto">Pick what you need right now. We’ll suggest quick, effective steps to help you feel better.</p>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {OPTIONS.map(({ key, label, icon: Icon, color }) => (
            <button
              key={key}
              onClick={() => toggle(key)}
              className={`group relative overflow-hidden rounded-2xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-400 ${
                selected.includes(key)
                  ? "ring-2 ring-green-500 shadow-xl"
                  : "shadow hover:shadow-lg"
              }`}
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${color} opacity-80`} />
              <div className="relative p-6 flex items-center gap-4 text-white">
                <div className="h-12 w-12 rounded-xl bg-white/20 grid place-items-center">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="text-left">
                  <div className="text-lg font-semibold drop-shadow-sm">{label}</div>
                  <div className="text-sm text-white/90">Tap to {selected.includes(key) ? "remove" : "select"}</div>
                </div>
                <ChevronRight className="ml-auto h-5 w-5 opacity-90 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
        </div>

        {/* Notes */}
        <Card className="mt-8 bg-white/70 backdrop-blur-md border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800">Add a quick note (optional)</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What would you like to share or remember about today?"
              className="bg-white/60 border-green-200 focus:border-green-400"
            />
            <div className="mt-3 text-xs text-green-600">Your note stays private on this device.</div>
          </CardContent>
        </Card>

        {/* Suggestions */}
        {selected.length > 0 && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 bg-white/80 backdrop-blur-md border-green-200">
              <CardHeader>
                <CardTitle className="text-green-800">Personalized Suggestions</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-green-800">
                  {suggestions.map((s, i) => (
                    <li key={i} className="p-3 rounded-lg border border-green-200 bg-green-50/60">
                      {s}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex flex-wrap gap-3">
                  <a href="/" className="inline-block"><Button className="bg-[#99BC85] hover:bg-[#86A976] rounded-full">Go to Dashboard</Button></a>
                  <a href="/" className="inline-block"><Button variant="outline" className="border-green-300 text-green-700 hover:bg-green-50 rounded-full">Start Daily Check-in</Button></a>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2">Breathe with us</h3>
                <p className="text-white/90 mb-4">Try a 60-second breathing exercise to reset your mind and body.</p>
                <a href="/" className="inline-block"><Button variant="secondary" className="bg-white text-green-700 hover:bg-green-50">Open Activities</Button></a>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Latest Findings & Story */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 bg-white/80 backdrop-blur-md border-green-200">
            <CardHeader>
              <CardTitle className="text-green-800">Your Latest Check-in</CardTitle>
              <CardDescription>Insights from your Mental Wellness Check-in</CardDescription>
            </CardHeader>
            <CardContent>
              {latest ? (
                <div className="space-y-4">
                  <div className="text-green-800 text-sm">{latest.observation}</div>
                  <ul className="list-disc pl-5 text-sm text-green-800">
                    {latest.suggestions?.map((s: string, i: number) => (<li key={i}>{s}</li>))}
                  </ul>
                  {latest.story?.title || latest.story?.story ? (
                    <div className="mt-4">
                      <h3 className="text-lg font-semibold text-green-900 mb-2">{latest.story.title || 'A Gentle Story'}</h3>
                      <p className="text-green-800 whitespace-pre-wrap leading-relaxed">{latest.story.story || ''}</p>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="text-green-800 text-sm">No check-in found yet. Please visit your Dashboard to take the Mental Wellness Check-in.</div>
              )}
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-md border-green-200">
            <CardHeader>
              <CardTitle className="text-green-800">Take the Check-in</CardTitle>
              <CardDescription>A 2–3 minute reflection to support you better</CardDescription>
            </CardHeader>
            <CardContent>
              <a href="/" className="inline-block w-full"><Button className="w-full rounded-full bg-[#99BC85] hover:bg-[#86A976]">Go to Dashboard</Button></a>
              <p className="mt-3 text-xs text-green-700">Your responses are private and help personalize your experience.</p>
            </CardContent>
          </Card>
        </div>

        {/* Back */}
        <div className="mt-10 text-center">
          <a href="/" className="inline-block"><Button variant="ghost" className="text-green-700 hover:bg-green-50">← Back to Home</Button></a>
        </div>
      </div>
      <SimpleFooter />
    </div>
  )
}

function getSuggestions(selected: OptionKey[]): string[] {
  const s: string[] = []
  if (selected.includes("mood")) s.push("Write down one good thing that happened today and re-read it in the evening.")
  if (selected.includes("energy")) s.push("Stand up for a 2-minute stretch and drink a glass of water.")
  if (selected.includes("focus")) s.push("Try a 10-minute deep-focus sprint: silence notifications and focus on one small task.")
  if (selected.includes("calm")) s.push("Close your eyes and take 5 slow breaths, counting 4-4-6.")
  if (selected.includes("sleep")) s.push("Avoid screens for 30 minutes before bed and dim your lights.")
  if (selected.includes("routine")) s.push("Pick one tiny habit for today (e.g., 1-page journal or 5-minute walk).")
  if (s.length === 0) s.push("Select one or more options above to get personalized suggestions.")
  return s
}