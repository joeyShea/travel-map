"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import TravelMap from "@/components/travel-map"

const API_BASE_URL = "http://localhost:5001"

export default function Page() {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function checkSession() {
      try {
        const response = await fetch(`${API_BASE_URL}/me`, {
          method: "GET",
          credentials: "include",
        })

        if (!response.ok) {
          router.replace("/signup")
          return
        }

        if (isMounted) {
          setReady(true)
        }
      } catch {
        router.replace("/signup")
      }
    }

    void checkSession()

    return () => {
      isMounted = false
    }
  }, [router])

  if (!ready) {
    return null
  }

  return <TravelMap />
}
