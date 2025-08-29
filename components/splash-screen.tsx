"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface SplashScreenProps {
  onComplete: () => void
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [visibleLines, setVisibleLines] = useState<number>(0)
  const [loadingProgress, setLoadingProgress] = useState(0)

  const textLines = [
    "Generate art with AI",
    "Upload and edit your own artwork",
    "Choose from a variety of apparel",
    "No minimums",
  ]

  useEffect(() => {
    const textTimers: NodeJS.Timeout[] = []

    // Show each line of text every 1.2 seconds
    textLines.forEach((_, index) => {
      const timer = setTimeout(
        () => {
          setVisibleLines(index + 1)
        },
        (index + 1) * 1200,
      )
      textTimers.push(timer)
    })

    const progressInterval = setInterval(() => {
      setLoadingProgress((prev) => {
        const newProgress = prev + 100 / 60 // 60 updates over 6 seconds = 100ms intervals
        return newProgress >= 100 ? 100 : newProgress
      })
    }, 100)

    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onComplete, 300) // Allow fade out animation to complete
    }, 6000) // Changed from 5000 to 6000 milliseconds for 6 second duration

    return () => {
      clearTimeout(timer)
      clearInterval(progressInterval)
      textTimers.forEach(clearTimeout)
    }
  }, [onComplete])

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 transition-opacity duration-300 bg-gradient-to-br from-blue-800 via-purple-900 to-pink-800",
        !isVisible && "opacity-0",
      )}
    >
      <div className="flex flex-col items-center justify-center h-full">
        <div className="flex flex-col items-center space-y-8">
          <img
            src="/ai-tshirt-designer-logo-new.png"
            alt="AI T-Shirt Designer Logo"
            className="w-48 h-48 object-contain"
          />

          <div className="relative">
            <div className="w-32 h-1 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-700 to-purple-800 rounded-full transition-all duration-100 ease-out"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
          </div>

          <div className="flex flex-col items-center space-y-2 min-h-[120px]">
            {textLines.map((line, index) => (
              <div
                key={index}
                className={cn(
                  "text-white text-sm font-bold text-center transition-all duration-700 ease-out",
                  index < visibleLines
                    ? "opacity-100 transform translate-y-0 scale-100"
                    : "opacity-0 transform translate-y-4 scale-95",
                )}
                style={{
                  transitionDelay: `${index * 100}ms`,
                }}
              >
                {line}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
