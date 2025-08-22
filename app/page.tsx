"use client"

import { useState } from "react"
import { SplashScreen } from "@/components/splash-screen"
import { LandingPage } from "@/components/landing-page"

export default function Home() {
  const [showSplash, setShowSplash] = useState(true)

  return (
    <main className="relative">
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      <LandingPage />
    </main>
  )
}
