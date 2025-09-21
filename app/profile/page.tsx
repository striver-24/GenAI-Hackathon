"use client"

import { useEffect, useState } from "react"
import { useSession, signIn } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isNew, setIsNew] = useState(false)

  const [phone, setPhone] = useState("")
  const [age, setAge] = useState<string | number | "">("")
  const [place, setPlace] = useState("")
  const [emergencyContact, setEmergencyContact] = useState("")
  const [termsAccepted, setTermsAccepted] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") return
    if (status !== "authenticated") return

    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        // Use absolute URL for API calls in production
        const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL 
          ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` 
          : '';
        const res = await fetch(`${baseUrl}/api/profile`, { cache: "no-store" })
        if (res.status === 401) {
          return
        }
        const data = await res.json()
        if (data?.profile) {
          const p = data.profile
          setIsNew(false)
          setPhone(p.phone || "")
          setAge(typeof p.age === "number" ? p.age : "")
          setPlace(p.place || "")
          setEmergencyContact(p.emergencyContact || "")
          setTermsAccepted(!!p.termsAccepted)
        } else {
          setIsNew(true)
        }
      } catch (e: any) {
        setError(e?.message || "Failed to load profile")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [status])

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, age: age === '' ? null : Number(age), place, emergencyContact, termsAccepted })
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to save')
      }
      setSuccess('Profile saved successfully')
      setIsNew(false)
      if (data?.profile) {
        setTermsAccepted(!!data.profile.termsAccepted)
        // If profile has T&C accepted (new user just completed), go to dashboard via home
        if (data.profile.termsAccepted) {
          window.location.href = '/'
        }
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Sign in required</CardTitle>
            <CardDescription>Please sign in with Google to manage your profile.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => signIn('google')}>Sign in with Google</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-xl bg-white/30 backdrop-blur-sm border-white/50">
        <CardHeader>
          <CardTitle className="text-2xl text-green-800">Your Profile</CardTitle>
          <CardDescription>
            {isNew ? 'Complete your details to finish registration' : 'Update your details'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : (
            <form onSubmit={onSave} className="space-y-4">
              <div className="space-y-2">
                <Label>Email (Google Account)</Label>
                <Input value={session?.user?.email || ''} disabled readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. +91-XXXXXXXXXX" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input id="age" type="number" min={0} max={120} value={age} onChange={(e) => setAge(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="place">Place</Label>
                  <Input id="place" value={place} onChange={(e) => setPlace(e.target.value)} placeholder="City / Town" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyContact">Emergency Contact</Label>
                <Input id="emergencyContact" value={emergencyContact} onChange={(e) => setEmergencyContact(e.target.value)} placeholder="Name & phone of emergency contact" />
              </div>
              {isNew ? (
                <div className="flex items-center space-x-2">
                  <Checkbox id="terms" checked={termsAccepted} onCheckedChange={(v) => setTermsAccepted(!!v)} />
                  <Label htmlFor="terms" className="text-sm text-green-800">I agree to the Terms and Conditions</Label>
                </div>
              ) : (
                <div className="text-xs text-green-700">Terms & Conditions accepted</div>
              )}
              {error && <div className="text-sm text-red-600">{error}</div>}
              {success && <div className="text-sm text-green-700">{success}</div>}
              <Button type="submit" className="bg-[#99BC85] hover:bg-[#86A976] rounded-full" disabled={saving || (isNew && !termsAccepted)}>
                {saving ? 'Saving...' : 'Save Profile'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
