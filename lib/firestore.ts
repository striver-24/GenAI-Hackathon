import { Firestore } from "@google-cloud/firestore"

let db: Firestore | null = null

export function getFirestore() {
  if (!db) {
    const projectId =
      process.env.GOOGLE_CLOUD_PROJECT ||
      process.env.GCLOUD_PROJECT ||
      process.env.FIREBASE_PROJECT_ID ||
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID

    if (!projectId) {
      throw new Error(
        "Firestore project id is missing. Set GOOGLE_CLOUD_PROJECT (or GCLOUD_PROJECT/FIREBASE_PROJECT_ID/NEXT_PUBLIC_FIREBASE_PROJECT_ID) in your environment."
      )
    }

    db = new Firestore({
      projectId,
    })
  }
  return db
}
