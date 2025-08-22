"use client"

import { ArrowBackIcon } from "./arrow-back-icon"

interface TopNavBarProps {
  showBackButton?: boolean
  onBackClick?: () => void
  title?: string // Added title prop to make text customizable per page
}

export function TopNavBar({ showBackButton = false, onBackClick, title }: TopNavBarProps) {
  return (
    <div className="px-4 mb-1">
      <div className="max-w-sm mx-auto py-4 flex items-center relative min-h-[80px] px-4 justify-start text-left">
        {showBackButton && onBackClick && (
          <div className="w-[68px]">
            <button
              onClick={onBackClick}
              className="flex items-center justify-center w-12 h-12 rounded-2xl text-white hover:bg-black/30 transition-colors bg-[rgba(255,255,255,0.14)]"
            >
              <ArrowBackIcon />
            </button>
          </div>
        )}

        <div className="flex-1 whitespace-nowrap">
          <h1 className="text-white text-xl font-bold">{title || "dfgdfgfd"}</h1>
        </div>
      </div>
    </div>
  )
}
