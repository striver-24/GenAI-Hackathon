"use client"
import { useSession, signIn, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"

export default function AuthButtons() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return null
  }

  if (!session) {
    return (
      <Button variant="outline" size="sm" onClick={() => signIn("google")}>Sign in with Google</Button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">{session.user?.name}</span>
      <Button variant="outline" size="sm" onClick={() => signOut()}>Sign out</Button>
    </div>
  )
}
