import { Firestore } from "@google-cloud/firestore"

let db: Firestore | null = null

export function getFirestore() {
  if (!db) {
    const projectId =
      process.env.GOOGLE_CLOUD_PROJECT ||
      process.env.GCLOUD_PROJECT ||
      process.env.FIREBASE_PROJECT_ID ||
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID

    db = new Firestore({
      projectId,
    })
  }
  return db
}
