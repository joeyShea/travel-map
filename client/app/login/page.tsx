"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const API_BASE_URL = "http://localhost:5001"

export default function LoginPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  async function loginWithCredentials(emailValue: string, passwordValue: string) {
    console.log("[login] attempting login", {
      apiBaseUrl: API_BASE_URL,
      email: emailValue,
    })

    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ email: emailValue, password: passwordValue }),
    })

    const data = await response.json()
    console.log("[login] login response", {
      status: response.status,
      ok: response.ok,
      data,
    })

    if (!response.ok) {
      setError(data.error || "Invalid email or password")
      return false
    }

    return true
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage("")
    setError("")
    setIsLoading(true)

    try {
      const rawEmail = email
      const rawPassword = password

      console.log("[login] creating account", {
        apiBaseUrl: API_BASE_URL,
        email: rawEmail,
      })

      const response = await fetch(`${API_BASE_URL}/create-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      })

      const data = await response.json()
      console.log("[login] create-user response", {
        status: response.status,
        ok: response.ok,
        data,
      })

      if (!response.ok) {
        setError(data.error || "Could not create account")
        return
      }

      const didLogin = await loginWithCredentials(rawEmail, rawPassword)
      if (!didLogin) {
        setMessage("Account created. Please click Log In.")
        return
      }

      setMessage("Account created successfully.")
      setName("")
      setEmail("")
      setPassword("")
      console.log("[login] routing to home after successful auth")
      router.push("/")
      router.refresh()
    } catch {
      setError("Could not reach server. Make sure Flask is running on localhost:5001.")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleLogin(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    setMessage("")
    setError("")
    setIsLoading(true)

    try {
      const didLogin = await loginWithCredentials(email, password)
      if (!didLogin) {
        return
      }

      console.log("[login] routing to home after log in")
      router.push("/")
      router.refresh()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Create Account</CardTitle>
          <CardDescription>Create your account to get started.</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your name"
                autoComplete="name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@school.edu"
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                required
                autoComplete="new-password"
              />
            </div>
            {message ? <p className="text-sm text-green-600">{message}</p> : null}
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? "Working..." : "Create Account"}
              </Button>
              <Button type="button" variant="outline" className="flex-1" disabled={isLoading} onClick={handleLogin}>
                {isLoading ? "Working..." : "Log In"}
              </Button>
            </div>
          </form>
        </CardContent>

        <CardFooter>
          <Link href="/" className="text-sm text-muted-foreground hover:underline">
            Back to map
          </Link>
        </CardFooter>
      </Card>
    </main>
  )
}
