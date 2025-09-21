"use client"

import React, { useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

// Types
type Option = "A" | "B" | "C" | "D"

type Question = {
  id: number
  section: "Mood & Emotions" | "Stress & Pressure" | "Energy & Daily Functioning" | "Social Connection & Support"
  text: string
  helper?: string
}

type Analysis = {
  title: string
  observation: string
  suggestions: { title: string; description: string; href?: string }[]
}

const OPTIONS: { value: Option; label: string; sub?: string }[] = [
  { value: "A", label: "Not at all / Rarely" },
  { value: "B", label: "Some of the time" },
  { value: "C", label: "Often" },
  { value: "D", label: "Almost always" },
]

const QUESTIONS: Question[] = [
  // Section 1: Mood & Emotions (1-3)
  {
    id: 1,
    section: "Mood & Emotions",
    text: "In the last two weeks, how often have you felt low, sad, or down?",
    helper: "This question gently probes for symptoms of low mood or depression.",
  },
  {
    id: 2,
    section: "Mood & Emotions",
    text:
      "How often have you found it difficult to find joy or interest in activities you usually like (e.g., hobbies, talking to friends, watching movies)?",
    helper: "This assesses anhedonia, a common indicator of mental distress.",
  },
  {
    id: 3,
    section: "Mood & Emotions",
    text:
      "How often have you felt irritable, on edge, or easily annoyed by things or people around you?",
    helper:
      "Irritability is a frequent, but often overlooked, sign of both anxiety and depression.",
  },

  // Section 2: Stress & Pressure (4-6)
  {
    id: 4,
    section: "Stress & Pressure",
    text:
      "How often do you feel overwhelmed by pressure from your studies, exams, or career expectations?",
    helper:
      "This directly addresses the academic and societal pressure common among Indian youth.",
  },
  {
    id: 5,
    section: "Stress & Pressure",
    text:
      "How often have you found yourself worrying constantly about the future or about things you can't control?",
    helper: "This is a key indicator of generalized anxiety.",
  },
  {
    id: 6,
    section: "Stress & Pressure",
    text: "How often do you feel tense, restless, or unable to relax?",
    helper: "This question looks into the physical manifestations of anxiety.",
  },

  // Section 3: Energy & Daily Functioning (7-9)
  {
    id: 7,
    section: "Energy & Daily Functioning",
    text:
      "How would you describe your energy levels lately? Have you been feeling tired or drained most of the time?",
    helper:
      "Fatigue and low energy are common symptoms linked to various mental health challenges.",
  },
  {
    id: 8,
    section: "Energy & Daily Functioning",
    text:
      "How has your sleep been? (e.g., trouble falling asleep, waking up during the night, sleeping too much).",
    helper:
      "Sleep disruption is a critical indicator of one's mental state. Select the option that best fits your overall sleep quality.",
  },
  {
    id: 9,
    section: "Energy & Daily Functioning",
    text:
      "Have you noticed any significant changes in your appetite (eating much more or much less than usual)?",
    helper:
      "Changes in eating habits can be a physical sign of emotional distress.",
  },

  // Section 4: Social Connection & Support (10-12)
  {
    id: 10,
    section: "Social Connection & Support",
    text:
      "How often have you felt lonely or isolated, even when you are with other people?",
    helper:
      "This explores feelings of social disconnection, which can be a major factor in mental well-being.",
  },
  {
    id: 11,
    section: "Social Connection & Support",
    text:
      "How often do you feel like you have someone you can talk to honestly, without fear of being judged?",
    helper:
      "This assesses the user's perceived support system, which is crucial for resilience.",
  },
  {
    id: 12,
    section: "Social Connection & Support",
    text:
      "When you think about discussing your feelings, how comfortable do you feel about reaching out for help?",
    helper:
      "This question directly addresses the core challenge of stigma mentioned in your project description.",
  },
]

export default function KnowYourselfPage() {
  const [answers, setAnswers] = useState<Record<number, Option | undefined>>({})
  const [submitted, setSubmitted] = useState(false)
  const [storyTitle, setStoryTitle] = useState<string | null>(null)
  const [storyText, setStoryText] = useState<string | null>(null)
  const [storyLoading, setStoryLoading] = useState(false)
  const [storyError, setStoryError] = useState<string | null>(null)

  const allAnswered = useMemo(
    () => QUESTIONS.every((q) => !!answers[q.id]),
    [answers]
  )

  const analysis: Analysis | null = useMemo(() => {
    if (!submitted) return null

    // Count C/D answers overall and by section
    let cdTotal = 0
    const sectionCD: Record<Question["section"], number> = {
      "Mood & Emotions": 0,
      "Stress & Pressure": 0,
      "Energy & Daily Functioning": 0,
      "Social Connection & Support": 0,
    }

    QUESTIONS.forEach((q) => {
      const v = answers[q.id]
      if (!v) return
      if (v === "C" || v === "D") {
        cdTotal += 1
        sectionCD[q.section] += 1
      }
    })

    const moodCD = sectionCD["Mood & Emotions"]
    const stressCD = sectionCD["Stress & Pressure"]
    const energyCD = sectionCD["Energy & Daily Functioning"]
    const socialCD = sectionCD["Social Connection & Support"]

    const sectionsHigh = [moodCD, stressCD, energyCD, socialCD].filter((n) => n >= 2).length

    // Rule order:
    // 1) Mostly A/B
    if (cdTotal <= 3) {
      return {
        title: "Thanks for checking in",
        observation:
          "Thank you for sharing. It seems like you're navigating life's ups and downs, and it’s great that you’re taking time to check in with yourself. Building emotional awareness is a powerful skill.",
        suggestions: [
          {
            title: "Explore Resilience & Mindfulness",
            description: "Discover articles on building resilience and mindfulness.",
            href: "/",
          },
          {
            title: "Daily Gratitude Journal",
            description: "Try our daily gratitude journal to focus on the positives.",
          },
          {
            title: "Mood Tracker",
            description: "Keep track of your mood to notice patterns over time.",
          },
        ],
      }
    }

    // 4) Spread across multiple sections especially including Energy
    if (energyCD >= 2 && sectionsHigh >= 2) {
      return {
        title: "We’re here with you",
        observation:
          "Thank you for being so honest. It seems like you're going through a particularly challenging time that might be affecting many parts of your life, from your mood to your energy levels. It’s brave of you to share this, and we want you to know that support is available.",
        suggestions: [
          {
            title: "Immediate Support Resources",
            description:
              "Your well-being is the top priority. Here are some 24/7 confidential helplines you can connect with right now: 9152987821 (iCall), 080-46110007 (Kiran).",
          },
          {
            title: "Talk to the AI Companion",
            description: "Our AI companion is ready to listen immediately if you need to talk.",
            href: "/",
          },
          {
            title: "Connect with a Professional",
            description:
              "Navigating these feelings alone can be very difficult. We strongly encourage you to connect with a mental health professional who can provide the guidance you deserve. Let us help you find the right person.",
          },
        ],
      }
    }

    // 3) Concentration in Mood & Social
    if ((moodCD >= 2 && socialCD >= 1) || (socialCD >= 2 && moodCD >= 1)) {
      return {
        title: "You’re not alone",
        observation:
          "It seems like things might be feeling a bit heavy and lonely lately. It takes courage to acknowledge these feelings. Please know that you are not alone, and many people go through similar experiences.",
        suggestions: [
          {
            title: "AI Companion for Emotional Support",
            description: "Talk through what's on your mind. Our AI is designed to be an empathetic listener.",
            href: "/",
          },
          {
            title: "Positive Affirmations",
            description:
              "Start your day with our positive affirmation feature to build self-compassion.",
          },
          {
            title: "Consider Professional Support",
            description:
              "If these feelings continue, speaking with a wellness professional can make a big difference. We have a confidential directory of verified counselors you can explore.",
          },
        ],
      }
    }

    // 2) Concentration in Stress & Pressure
    if (stressCD >= 2 && stressCD >= moodCD && stressCD >= socialCD && stressCD >= energyCD) {
      return {
        title: "That’s a lot to carry",
        observation:
          "It sounds like you might be under a lot of pressure right now. Juggling academics, career plans, and expectations is tough, and feeling overwhelmed is a very normal response. Remember to be kind to yourself.",
        suggestions: [
          {
            title: "Stress Management Tools",
            description:
              "Explore our guided breathing exercises and meditation techniques to find some calm.",
            href: "/",
          },
          {
            title: "Time Management Guides",
            description:
              "Check out our resources on how to manage your workload effectively.",
          },
          {
            title: "AI Companion Chat",
            description:
              "Sometimes, just typing out your worries can help. Our AI companion is here to listen without judgment.",
            href: "/",
          },
        ],
      }
    }

    // Fallback to gentle supportive message
    return {
      title: "Thank you for sharing",
      observation:
        "Thank you for checking in. Your responses suggest you're experiencing a mix of feelings. We're here to support you with resources that can help, one step at a time.",
      suggestions: [
        {
          title: "Mindfulness & Breathing",
          description:
            "Try a short breathing practice to reduce stress and reconnect with your body.",
          href: "/",
        },
        {
          title: "Track Your Mood",
          description:
            "Keep a simple log of your mood and energy to notice patterns and triggers.",
        },
        {
          title: "Reach Out",
          description:
            "Consider talking to someone you trust or a professional if things feel heavy.",
        },
      ],
    }
  }, [answers, submitted])

  function setAnswer(id: number, value: Option) {
    setAnswers((prev) => ({ ...prev, [id]: value }))
  }

  function deriveScenarioPrompt(): string {
    const sectionCD: Record<Question["section"], number> = {
      "Mood & Emotions": 0,
      "Stress & Pressure": 0,
      "Energy & Daily Functioning": 0,
      "Social Connection & Support": 0,
    }
    QUESTIONS.forEach((q) => {
      const v = answers[q.id]
      if (v === "C" || v === "D") {
        sectionCD[q.section] += 1
      }
    })
    const moodCD = sectionCD["Mood & Emotions"]
    const stressCD = sectionCD["Stress & Pressure"]
    const energyCD = sectionCD["Energy & Daily Functioning"]
    const socialCD = sectionCD["Social Connection & Support"]
    const cdTotal = moodCD + stressCD + energyCD + socialCD

    // Scenario mapping
    // 1) High Stress & Pressure
    if (stressCD >= 2 && stressCD >= moodCD && stressCD >= energyCD && stressCD >= socialCD) {
      return "The user is a young person feeling immense pressure and anxiety. They feel overwhelmed, tense, and their mind is always racing with worries about the future. Their struggle feels like being caught in a relentless storm."
    }
    // 2) Low Mood & Loneliness
    if ((moodCD >= 2 && socialCD >= 1) || socialCD >= 2) {
      return "The user is a young person experiencing a persistent low mood and a loss of joy. They feel disconnected, isolated, and lonely, as if the world's color has faded to grey and they are invisible to everyone."
    }
    // 3) Fatigue & Burnout
    if (energyCD >= 2 && moodCD <= 1 && stressCD <= 1 && socialCD <= 1) {
      return "The user is a young person feeling completely drained of energy, both mentally and physically. Daily tasks feel like monumental efforts, and they feel stuck in a state of deep exhaustion, like they are trying to walk through thick mud."
    }
    // 4) Mixed & Challenging Feelings
    if (cdTotal >= 6 || (energyCD >= 2 && (moodCD >= 2 || stressCD >= 2 || socialCD >= 2))) {
      return "The user is a young person going through a very difficult time with a mix of sadness, stress, and exhaustion. They feel lost, overwhelmed, and isolated, and their energy is too low to see a clear path forward. It feels like they are lost in a cold, dense fog on a steep mountain."
    }

    // Fallback: pick the highest section
    const max = Math.max(stressCD, moodCD, energyCD, socialCD)
    if (max === stressCD) {
      return "The user is a young person feeling immense pressure and anxiety. They feel overwhelmed, tense, and their mind is always racing with worries about the future. Their struggle feels like being caught in a relentless storm."
    }
    if (max === energyCD) {
      return "The user is a young person feeling completely drained of energy, both mentally and physically. Daily tasks feel like monumental efforts, and they feel stuck in a state of deep exhaustion, like they are trying to walk through thick mud."
    }
    if (max === socialCD || max === moodCD) {
      return "The user is a young person experiencing a persistent low mood and a loss of joy. They feel disconnected, isolated, and lonely, as if the world's color has faded to grey and they are invisible to everyone."
    }
    return "The user is a young person going through a very difficult time with a mix of sadness, stress, and exhaustion. They feel lost, overwhelmed, and isolated, and their energy is too low to see a clear path forward. It feels like they are lost in a cold, dense fog on a steep mountain."
  }

  async function handleSubmit() {
    if (!allAnswered) return
    setSubmitted(true)
    setStoryError(null)
    setStoryTitle(null)
    setStoryText(null)
    setStoryLoading(true)
    try {
      const scenarioPrompt = deriveScenarioPrompt()
      const res = await fetch("/api/story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarioPrompt }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Failed to generate story")
      setStoryTitle(data.title)
      setStoryText(data.story)
    } catch (e: any) {
      setStoryError(e?.message || "Failed to generate story")
    } finally {
      setStoryLoading(false)
      // Scroll to reveal story
      window?.scrollTo?.({ top: 0, behavior: "smooth" })
    }
  }

  function handleRetake() {
    setAnswers({})
    setSubmitted(false)
    window?.scrollTo?.({ top: 0, behavior: "smooth" })
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Know Yourself</h1>
        <p className="text-muted-foreground">
          Mental Wellness Check-in
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Welcome!</CardTitle>
          <CardDescription>
            This is a safe and private space for you to check in with yourself. There are no right or wrong answers.
            Just be honest. This will help us understand how you're feeling so we can suggest the best ways to support
            you. Your responses are completely confidential.
          </CardDescription>
        </CardHeader>
      </Card>

      {!submitted && (
        <div className="space-y-6">
          {(["Mood & Emotions", "Stress & Pressure", "Energy & Daily Functioning", "Social Connection & Support"] as const).map(
            (section) => (
              <section key={section} className="space-y-4">
                <h2 className="text-xl font-medium">{section}</h2>
                {QUESTIONS.filter((q) => q.section === section).map((q) => (
                  <Card key={q.id}>
                    <CardHeader>
                      <CardTitle className="text-base font-medium">Q{q.id}. {q.text}</CardTitle>
                      {q.helper && (
                        <CardDescription className="leading-relaxed">{q.helper}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <RadioGroup
                        value={answers[q.id] ?? undefined}
                        onValueChange={(val) => setAnswer(q.id, val as Option)}
                        className="grid gap-2"
                        aria-label={`Question ${q.id}`}
                        required
                      >
                        {OPTIONS.map((opt) => (
                          <label
                            key={opt.value}
                            className="flex items-center gap-3 rounded-md border p-3 transition-colors hover:bg-accent/50"
                          >
                            <RadioGroupItem value={opt.value} id={`q${q.id}-${opt.value}`} />
                            <div className="grid">
                              <Label htmlFor={`q${q.id}-${opt.value}`} className="font-medium">
                                {opt.value}) {opt.label}
                              </Label>
                              {opt.sub && (
                                <span className="text-sm text-muted-foreground">{opt.sub}</span>
                              )}
                            </div>
                          </label>
                        ))}
                      </RadioGroup>
                    </CardContent>
                  </Card>
                ))}
              </section>
            )
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setAnswers({})} type="button">
              Clear
            </Button>
            <Button onClick={handleSubmit} disabled={!allAnswered} type="button">
              See Guidance
            </Button>
          </div>
        </div>
      )}

      {submitted && analysis && (
        <section className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{analysis.title}</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                {analysis.observation}
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            {analysis.suggestions.map((sug, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <CardTitle className="text-base">{sug.title}</CardTitle>
                  <CardDescription>{sug.description}</CardDescription>
                </CardHeader>
                {sug.href && (
                  <CardContent>
                    <Button asChild variant="outline" size="sm">
                      <a href={sug.href}>Open</a>
                    </Button>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>

          {(storyLoading || storyError || (storyTitle && storyText)) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">
                  {storyLoading ? "Generating your story..." : (storyTitle ?? "Your Story")}
                </CardTitle>
                {storyError && (
                  <CardDescription className="text-red-600">{storyError}</CardDescription>
                )}
              </CardHeader>
              {storyText && (
                <CardContent className="space-y-4">
                  <div className="whitespace-pre-wrap text-sm leading-7 text-muted-foreground">{storyText}</div>
                </CardContent>
              )}
            </Card>
          )}

          <div className="flex items-center justify-between pt-2">
            <Button variant="ghost" onClick={handleRetake}>Retake check-in</Button>
            <Button asChild>
              <a href="/">Go to Home</a>
            </Button>
          </div>
        </section>
      )}
    </main>
  )
}
