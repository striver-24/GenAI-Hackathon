import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getFirestore } from "@/lib/firestore"
import { FieldValue } from "@google-cloud/firestore"

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 })
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const userId = (session.user as any).id as string | undefined
  if (!userId) {
    return NextResponse.json({ error: "Missing user id in session" }, { status: 500 })
  }
  try {
    const db = getFirestore()
    const doc = await db.collection("profiles").doc(userId).get()
    if (!doc.exists) {
      return NextResponse.json({ profile: null })
    }
    return NextResponse.json({ profile: { id: userId, ...(doc.data() as any) } })
  } catch (e: any) {
    console.error("GET /api/profile error", e)
    return NextResponse.json({ error: e?.message || "Failed to load profile" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const userId = (session.user as any).id as string | undefined
  const email = session.user.email || ""
  const name = session.user.name || ""
  if (!userId) {
    return NextResponse.json({ error: "Missing user id in session" }, { status: 500 })
  }

  let body: any
  try {
    body = await req.json()
  } catch {
    return badRequest("Invalid JSON body")
  }

  const { phone, age, place, emergencyContact, termsAccepted } = body || {}

  // Basic validation
  const ageNum = age !== undefined && age !== null && age !== "" ? Number(age) : undefined
  if (ageNum !== undefined && (Number.isNaN(ageNum) || ageNum < 0 || ageNum > 120)) {
    return badRequest("Invalid age")
  }
  if (phone && typeof phone !== "string") {
    return badRequest("Invalid phone")
  }
  if (place && typeof place !== "string") {
    return badRequest("Invalid place")
  }
  if (emergencyContact && typeof emergencyContact !== "string") {
    return badRequest("Invalid emergencyContact")
  }

  try {
    const db = getFirestore()
    const ref = db.collection("profiles").doc(userId)
    const snap = await ref.get()

    // Enforce T&C acceptance only on first creation
    if (!snap.exists && termsAccepted !== true) {
      return badRequest("You must accept the Terms & Conditions to register.")
    }

    const payload: any = {
      email,
      name,
      phone: phone || "",
      age: ageNum ?? null,
      place: place || "",
      emergencyContact: emergencyContact || "",
      termsAccepted: snap.exists ? snap.get("termsAccepted") ?? !!termsAccepted : !!termsAccepted,
      updatedAt: FieldValue.serverTimestamp(),
    }
    if (!snap.exists) {
      payload.createdAt = FieldValue.serverTimestamp()
    }

    await ref.set(payload, { merge: true })
    const saved = await ref.get()
    return NextResponse.json({ profile: { id: userId, ...(saved.data() as any) } })
  } catch (e: any) {
    console.error("POST /api/profile error", e)
    return NextResponse.json({ error: e?.message || "Failed to save profile" }, { status: 500 })
  }
}
