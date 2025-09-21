import { Firestore } from "@google-cloud/firestore"

let db: Firestore | null = null

export function getFirestore() {
  if (!db) {
    db = new Firestore({
      projectId: process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT,
    })
  }
  return db
}
