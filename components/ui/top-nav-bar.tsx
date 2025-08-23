"use client"

import { ArrowBackIcon } from "./arrow-back-icon"

interface TopNavBarProps {
  showBackButton?: boolean
  onBackClick?: () => void
  title?: string // Added title prop to make text customizable per page
}

export function TopNavBar({ showBackButton = false, onBackClick, title }: TopNavBarProps) {
  return (
    <div className="px-0 mb-0">
      <div className="max-w-[600px] mx-auto py-4 flex items-center relative min-h-[80px] justify-start text-left px-4">
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
          <h1 className="text-white font-bold text-xl">{title || "dfgdfgfd"}</h1>
        </div>
      </div>
    </div>
  )
}
