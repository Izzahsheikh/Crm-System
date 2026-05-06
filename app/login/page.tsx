"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Building2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

export default function LoginPage() {
  const router = useRouter()
  const params = useSearchParams()
  const redirect = params.get("redirect") || "/dashboard"
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [needsSetup, setNeedsSetup] = useState(false)

  useEffect(() => {
    fetch("/api/auth/setup-status")
      .then((r) => r.json())
      .then((d) => {
        if (d?.initialized === false) setNeedsSetup(true)
      })
      .catch(() => {})
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Login failed")
      toast.success(`Welcome back, ${data.user.name}`)
      router.push(redirect)
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-svh grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between p-10 bg-primary text-primary-foreground">
        <div className="flex items-center gap-2">
          <div className="size-9 rounded-md bg-primary-foreground/10 flex items-center justify-center">
            <Building2 className="size-5" />
          </div>
          <span className="font-semibold tracking-tight">Estate CRM</span>
        </div>
        <div className="space-y-4 max-w-md">
          <h1 className="text-4xl font-semibold tracking-tight text-balance leading-tight">
            Close more property deals with a system built for the way you actually work.
          </h1>
          <p className="text-primary-foreground/70 leading-relaxed">
            Capture every walk-in, referral, and online enquiry. Score leads automatically, assign them to the right
            agent, and never let a hot prospect go cold.
          </p>
        </div>
        <div className="text-sm text-primary-foreground/60">
          Trusted by independent dealers and brokerage teams.
        </div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10">
        <Card className="w-full max-w-md border-border">
          <CardHeader className="space-y-2">
            <div className="lg:hidden flex items-center gap-2 mb-2">
              <div className="size-9 rounded-md bg-primary text-primary-foreground flex items-center justify-center">
                <Building2 className="size-5" />
              </div>
              <span className="font-semibold tracking-tight">Estate CRM</span>
            </div>
            <CardTitle className="text-2xl">Sign in</CardTitle>
            <CardDescription>Enter your credentials to access your dashboard.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="size-4 animate-spin" /> : "Sign in"}
              </Button>
              {needsSetup && (
                <p className="text-sm text-muted-foreground text-center">
                  No admin account yet?{" "}
                  <Link href="/setup" className="text-foreground font-medium underline underline-offset-4">
                    Run first-time setup
                  </Link>
                </p>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
