import { NextResponse } from "next/server"
import { VertexAI } from "@google-cloud/vertexai"
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

    const project = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT
    const location = process.env.VERTEX_LOCATION || "us-central1"
    if (!project) {
      return NextResponse.json({ error: "Missing GOOGLE_CLOUD_PROJECT/GCLOUD_PROJECT env" }, { status: 500 })
    }

    const vertex = new VertexAI({ project, location })
    const model = vertex.getGenerativeModel({
      model: "gemini-1.5-flash-002",
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 1000,
        responseMimeType: "application/json",
      },
      safetySettings: [
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_SELF_HARM", threshold: "BLOCK_LOW_AND_ABOVE" },
      ],
    })

    const result = await model.generateContent({
      systemInstruction: { role: "system", parts: [{ text: SYSTEM_PROMPT + "\nKeep within 300-400 words." }] },
      contents: [
        { role: "user", parts: [{ text: scenarioPrompt }] },
      ],
    })

    const response = await result.response
    const text = response.candidates?.[0]?.content?.parts?.[0]?.text || "{}"

    let parsed: { title?: string; story?: string }
    try {
      parsed = JSON.parse(text)
    } catch {
      // Fallback: if model returned plain text, synthesize a title
      parsed = { title: "A Gentle Story", story: text }
    }

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
