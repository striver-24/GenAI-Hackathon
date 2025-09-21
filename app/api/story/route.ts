import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { getFirestore } from "@/lib/firestore"
import { FieldValue } from "@google-cloud/firestore"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const SYSTEM_PROMPT = `You are a wise, empathetic, and gentle storyteller. Your task is to write a short, metaphorical story (around 300-400 words) for a young person in India who is struggling with their mental health, based on the specific situation provided.

Core Rules for Every Story:

Metaphorical, Not Literal: You MUST AVOID direct mentions of studies, exams, family pressure, or clinical terms. Instead, you will represent these struggles through powerful metaphors. For example:

Stress/Anxiety: A relentless, howling wind; a climb up a steep, crumbling mountain; a boat in a churning storm.
Sadness/Depression: A world that has lost its color; a heavy, invisible cloak; a persistent, grey fog.
Loneliness: Being in a bustling city where no one can see you; a single tree in a vast, empty field.
Fatigue/Burnout: A traveler whose backpack is filled with heavy stones; a lamp running low on oil.

Relatable Protagonist: Create a character with a simple, culturally resonant Indian name (e.g., Rohan, Priya, Aarav, Meera) who embodies the user's feelings.

Embed Subtle Coping Mechanisms: Weave one or two simple, actionable coping strategies into the narrative as actions the character takes. These actions should lead to a small but significant shift in the story.
- For Stress/Worry: The character learns to calm the storm by taking three deep, steady breaths.
- For Sadness: The character finds a single, vibrant flower by noticing something small and beautiful in the grey landscape.
- For Loneliness: The character feels a moment of connection by simply nodding at a friendly forest creature (representing sharing a small part of their burden).
- For Fatigue: The character discovers the strength to continue not by pushing harder, but by resting beside a quiet stream and just listening.

Culturally Sensitive Imagery: Ground the story in a gentle, Indian context. Use imagery like ancient banyan trees, the scent of jasmine or marigolds, the feel of the first monsoon rain, or the sight of fireflies at dusk.

A Hopeful, Gentle Ending: The story MUST NOT offer a magical cure. The problem is not "solved." Instead, the character finds a new tool, a moment of peace, or a flicker of hope. The story should end with the feeling that this difficult moment is just one part of a much longer journey, and that the character now has a new way to take the next step.

Output format: Strict JSON with keys {"title": string, "story": string}.`

export async function POST(req: Request) {
  try {
    const { scenarioPrompt } = await req.json()
    if (!scenarioPrompt || typeof scenarioPrompt !== "string") {
      return NextResponse.json({ error: "Missing scenarioPrompt" }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash-002"
    if (!apiKey) {
      return NextResponse.json({ error: "Missing GEMINI_API_KEY env" }, { status: 500 })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: modelName })

    const result = await model.generateContent({
      systemInstruction: { role: "system", parts: [{ text: SYSTEM_PROMPT + "\nKeep within 300-400 words." }] },
      contents: [
        { role: "user", parts: [{ text: scenarioPrompt }] },
      ],
      generationConfig: { responseMimeType: "application/json" },
    })

    const text = await result.response.text()

    function tryParseJson(raw: string): any | null {
      try {
        return JSON.parse(raw)
      } catch {
        return null
      }
    }

    function extractJson(raw: string): any | null {
      // 1) Direct parse
      let obj = tryParseJson(raw)
      if (obj) return obj
      // 2) Strip code fences
      const fenceMatch = raw.match(/```[a-zA-Z]*\n([\s\S]*?)```/)
      if (fenceMatch) {
        obj = tryParseJson(fenceMatch[1].trim())
        if (obj) return obj
      }
      // 3) Parse substring between first { and last }
      const first = raw.indexOf("{")
      const last = raw.lastIndexOf("}")
      if (first !== -1 && last !== -1 && last > first) {
        const sub = raw.slice(first, last + 1)
        obj = tryParseJson(sub)
        if (obj) return obj
      }
      return null
    }

    const parsedAny = extractJson(text)

    const parsed: { title?: string; story?: string } = parsedAny && typeof parsedAny === 'object'
      ? parsedAny
      : { title: "A Gentle Story", story: text }

    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id || null

    try {
      const db = getFirestore()
      await db.collection("stories").add({
        userId,
        scenarioPrompt,
        title: parsed.title || "A Gentle Story",
        story: parsed.story || "",
        createdAt: FieldValue.serverTimestamp(),
      })
    } catch (e) {
      // Ignore Firestore errors to not block UX
      console.error("Firestore write failed", e)
    }

    return NextResponse.json({
      title: parsed.title || "A Gentle Story",
      story: parsed.story || "",
    })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err?.message || "Failed to generate story" }, { status: 500 })
  }
}
