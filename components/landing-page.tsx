"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { TopNavBar } from "@/components/ui/top-nav-bar"
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel"
import { Upload, Sparkles, Type, Loader2, ArrowUp } from "lucide-react"

interface Product {
  id: number
  name: string
  image: string
}

interface GeneratedImage {
  id: number
  url: string
  prompt: string
  isLoading?: boolean
}

export function LandingPage() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showOptions, setShowOptions] = useState(false)
  const [showAIPrompt, setShowAIPrompt] = useState(false)
  const [showAILoading, setShowAILoading] = useState(false)
  const [showAIResults, setShowAIResults] = useState(false)
  const [aiPrompt, setAiPrompt] = useState("")
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationCount, setGenerationCount] = useState(0)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [progressTimer, setProgressTimer] = useState<NodeJS.Timeout | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const products: Product[] = [
    { id: 1, name: "T-Shirt", image: "/white-t-shirt.png" },
    { id: 2, name: "Hoodie", image: "/transparent-hoodie.png" },
    { id: 3, name: "Tank Top", image: "/brown-tank-top.png" },
    { id: 4, name: "Long Sleeve", image: "/navy-long-sleeve.png" },
    { id: 5, name: "Polo Shirt", image: "/golden-polo-shirt.png" },
    { id: 6, name: "V-Neck", image: "/green-v-neck.png" },
    { id: 7, name: "Baseball Tee", image: "/gray-navy-baseball-tee.png" },
    { id: 8, name: "Hat", image: "/burgundy-hat.png" },
    { id: 9, name: "Sweatshirt", image: "/royal-blue-sweatshirt.png" },
    { id: 10, name: "Zip Hoodie", image: "/orange-zip-hoodie.png" },
    { id: 11, name: "Long Sleeve Polo", image: "/forest-green-long-sleeve-polo.png" },
    { id: 14, name: "Tote Bag", image: "/natural-canvas-tote-bag.png" },
  ]

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product)
    setShowOptions(true)
  }

  const handleNavigation = (option: string) => {
    const baseUrl = "https://rushordertees.com/design"

    switch (option) {
      case "upload":
        fileInputRef.current?.click()
        break
      case "ai":
        setShowAIPrompt(true)
        break
      case "text":
        window.location.href = "https://www.rushordertees.com/design/"
        break
    }
  }

  const handleBackToProducts = () => {
    setShowOptions(false)
    setSelectedProduct(null)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0]
      if (file) {
        // Validate file type
        if (!file.type.startsWith("image/")) {
          console.error("[v0] Invalid file type:", file.type)
          return
        }

        // Validate file size (max 10MB to prevent memory issues)
        const maxSize = 10 * 1024 * 1024 // 10MB
        if (file.size > maxSize) {
          console.error("[v0] File too large:", file.size)
          alert("File is too large. Please choose an image under 10MB.")
          return
        }

        console.log("[v0] File selected successfully:", file.name, file.size)
        window.location.href = "https://rushordertees.com/design"
      }
    } catch (error) {
      console.error("[v0] Error handling file upload:", error)
    } finally {
      // Reset the input to allow selecting the same file again
      if (event.target) {
        event.target.value = ""
      }
    }
  }

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) return

    setIsGenerating(true)
    setShowAILoading(true)
    setShowAIPrompt(false)
    setProgress(0)

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev < 20) return Math.min(prev + 4, 20)
        if (prev < 70) return Math.min(prev + 2, 70)
        if (prev < 95) return Math.min(prev + 1, 95)
        return prev
      })
    }, 200)
    setProgressTimer(timer)

    const startIndex = generatedImages.length
    const placeholderImages: GeneratedImage[] = Array.from({ length: 3 }, (_, index) => ({
      id: startIndex + index + 1,
      url: "",
      prompt: aiPrompt,
      isLoading: true,
    }))

    setGeneratedImages((prev) => [...prev, ...placeholderImages])

    try {
      const imagePromises = Array.from({ length: 3 }, async (_, index) => {
        try {
          const response = await fetch("/api/generate-image", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              prompt: aiPrompt,
              seed: Date.now() + index,
            }),
          })

          if (!response.ok) {
            const errorData = await response.json()
            console.error(`[v0] API error for image ${index + 1}:`, errorData)

            if (response.status === 429) {
              console.log(`[v0] Rate limited on image ${index + 1}, using placeholder`)
            }

            throw new Error(errorData.error || "Failed to generate image")
          }

          const data = await response.json()
          console.log(`[v0] Generated image ${index + 1} data:`, data)

          const imageId = startIndex + index + 1
          setGeneratedImages((prev) =>
            prev.map((img) => (img.id === imageId ? { ...img, url: data.imageUrl, isLoading: false } : img)),
          )

          return { success: true, index, data }
        } catch (error) {
          console.error(`Error generating image ${index + 1}:`, error)

          const imageId = startIndex + index + 1
          setGeneratedImages((prev) =>
            prev.map((img) =>
              img.id === imageId
                ? {
                    ...img,
                    url: `/placeholder.svg?height=300&width=300&query=${encodeURIComponent(aiPrompt)}`,
                    isLoading: false,
                  }
                : img,
            ),
          )

          return { success: false, index, error }
        }
      })

      await Promise.allSettled(imagePromises)
      setGenerationCount((prev) => prev + 1)
    } catch (error) {
      console.error("Error in AI generation process:", error)
    } finally {
      if (progressTimer) {
        clearInterval(progressTimer)
        setProgressTimer(null)
      }
      setProgress(100)
      setTimeout(() => {
        setIsGenerating(false)
        setShowAILoading(false)
        setShowAIResults(true)
      }, 300)
    }
  }

  const handleUseDesign = (image: GeneratedImage) => {
    window.location.href = "https://www.rushordertees.com/design"
  }

  const handleBackToOptions = () => {
    setShowAIPrompt(false)
    setShowAIResults(false)
    setShowAILoading(false)
    setAiPrompt("")
    setGeneratedImages([])
    setGenerationCount(0)
  }

  const handleGenerateMore = async () => {
    if (!aiPrompt.trim()) return

    setIsGenerating(true)

    const startIndex = generatedImages.length
    const placeholderImages: GeneratedImage[] = Array.from({ length: 3 }, (_, index) => ({
      id: startIndex + index + 1,
      url: "",
      prompt: aiPrompt,
      isLoading: true,
    }))

    setGeneratedImages((prev) => [...prev, ...placeholderImages])
    setCurrentImageIndex(startIndex)

    try {
      const imagePromises = Array.from({ length: 3 }, async (_, index) => {
        try {
          const response = await fetch("/api/generate-image", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              prompt: aiPrompt,
              seed: Date.now() + index,
            }),
          })

          if (!response.ok) {
            const errorData = await response.json()
            console.error(`[v0] API error for additional image ${index + 1}:`, errorData)
            throw new Error(errorData.error || "Failed to generate image")
          }

          const data = await response.json()
          console.log(`[v0] Generated additional image ${index + 1} data:`, data)

          const imageId = startIndex + index + 1
          setGeneratedImages((prev) =>
            prev.map((img) => (img.id === imageId ? { ...img, url: data.imageUrl, isLoading: false } : img)),
          )

          return { success: true, index, data }
        } catch (error) {
          console.error(`Error generating additional image ${index + 1}:`, error)

          const imageId = startIndex + index + 1
          setGeneratedImages((prev) =>
            prev.map((img) =>
              img.id === imageId
                ? {
                    ...img,
                    url: `/placeholder.svg?height=300&width=300&query=${encodeURIComponent(aiPrompt)}`,
                    isLoading: false,
                  }
                : img,
            ),
          )

          return { success: false, index, error }
        }
      })

      await Promise.allSettled(imagePromises)
      setGenerationCount((prev) => prev + 1)
    } catch (error) {
      console.error("Error generating additional images:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleTopNavBack = () => {
    if (showAIResults) {
      setShowAIResults(false)
      setShowAIPrompt(true)
    } else if (showAILoading) {
      setShowAILoading(false)
      setShowAIPrompt(true)
      setIsGenerating(false)
    } else if (showAIPrompt) {
      handleBackToOptions()
    } else if (showOptions) {
      handleBackToProducts()
    }
  }

  const handlePrevImage = () => {
    const totalSlides = generationCount < 15 ? generatedImages.length + 1 : generatedImages.length
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : totalSlides - 1))
  }

  const handleNextImage = () => {
    const totalSlides = generationCount < 15 ? generatedImages.length + 1 : generatedImages.length
    setCurrentImageIndex((prev) => (prev < totalSlides - 1 ? prev + 1 : 0))
  }

  const handleDotClick = (index: number) => {
    setCurrentImageIndex(index)
  }

  const shouldShowTopNav = !showAILoading
  const shouldShowBackButton = showOptions || showAIPrompt || showAILoading || showAIResults

  return (
    <div>
      <div className="min-h-screen bg-gradient-to-br from-blue-800 via-purple-900 to-pink-800">
        {shouldShowTopNav && (
          <TopNavBar
            showBackButton={shouldShowBackButton}
            onBackClick={handleTopNavBack}
            title={
              showAIResults
                ? "AI Results"
                : showAILoading
                  ? "AI Loading"
                  : showAIPrompt
                    ? "Create With AI"
                    : showOptions
                      ? "Design Options"
                      : "Select Product"
            }
          />
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileUpload}
          className="hidden"
        />

        {showAIPrompt && (
          <div className="min-h-screen py-0 px-0">
            <div className="max-w-[600px] mx-auto">
              <div className="relative overflow-y-auto p-4 min-h-[85vh] py-5">
                <div className="relative z-10">
                  <div className="mb-16 rounded-full">
                    <div className="relative rounded-full">
                      <div className="border border-white/40 shadow-sm overflow-hidden rounded-4xl bg-[rgba(255,255,255,0.16)]">
                        <div className="flex items-center px-4 py-2 pr-2 shadow-none text-transparent bg-transparent">
                          <textarea
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            placeholder="Describe your design..."
                            className="flex-1 border-0 text-base focus:ring-0 focus:outline-none bg-transparent resize-none min-h-[24px] max-h-32 text-white placeholder-white/30"
                            disabled={isGenerating}
                            rows={1}
                            style={{ lineHeight: "1.5" }}
                            onInput={(e) => {
                              const target = e.target as HTMLTextAreaElement
                              target.style.height = "auto"
                              target.style.height = Math.min(target.scrollHeight, 128) + "px"
                            }}
                          />
                          <button
                            onClick={aiPrompt.trim() ? handleAIGenerate : undefined}
                            className={`ml-3 rounded-full flex items-center justify-center transition-all duration-200 flex-shrink-0 h-10 w-10 ${
                              aiPrompt.trim() ? "bg-white hover:bg-gray-100" : "bg-white/20 hover:bg-white/30"
                            }`}
                            disabled={isGenerating || !aiPrompt.trim()}
                          >
                            {isGenerating ? (
                              <Loader2 className="w-4 h-4 text-white animate-spin" />
                            ) : aiPrompt.trim() ? (
                              <ArrowUp className="w-4 h-4" style={{ color: "#c703af" }} strokeWidth={3} />
                            ) : (
                              <ArrowUp className="w-4 h-4 text-[rgba(255,255,255,0.2)]" strokeWidth={3} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-12">
                  <h2 className="text-white font-medium text-sm mb-4">Example Prompt</h2>

                  <div className="mb-6">
                    <div className="flex flex-wrap mb-4 gap-0.5 text-xs">
                      <span className="py-2 text-white font-medium bg-[rgba(245,73,0,0.7)] text-xs rounded-md px-2">
                        A logo
                      </span>
                      <span className="text-white font-medium py-2 bg-[rgba(22,93,251,0.7)] text-xs rounded-md px-2">
                        of a dog wearing a black top hat winking
                      </span>
                      <span className="py-2 text-white font-medium bg-[rgba(152,16,250,0.7065217391304348)] text-xs rounded-md px-2">
                        with text that says Good Dog Bar
                      </span>
                      <span className="py-2 text-white font-medium bg-[rgba(0,166,62,0.7065217391304348)] text-xs rounded-md px-2">
                        on a white background
                      </span>
                    </div>

                    <div className="flex flex-wrap text-sm gap-4">
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
                        <span className="text-white font-bold tracking-wider text-xs">STYLE</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                        <span className="text-white font-bold tracking-wider text-xs">SUBJECT</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                        <span className="text-white font-bold tracking-wider text-xs">TEXT</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                        <span className="text-white font-bold tracking-wider text-xs">BACKGROUND</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h2 className="mb-4 text-white text-sm font-medium">Output from example prompt</h2>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="aspect-square flex items-center justify-center overflow-hidden rounded-xl">
                      <img
                        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/a-clean-and-modern-logo-illustration-fea_aFuultKgQh-HNvXcKTMAZw_hGGDDkT3QsqQ5SxEV74Nug_0003_Layer_1-k0tu4OCtfnKVKGRdqhaU28eMrcisy6.webp"
                        alt="Good Dog Bar logo with winking golden retriever"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="aspect-square flex items-center justify-center overflow-hidden rounded-xl">
                      <img
                        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/a-clean-and-modern-logo-illustration-fea_aFuultKgQh-HNvXcKTMAZw_hGGDDkT3QsqQ5SxEV74Nug_0001_a-logo-illustration-of-a-cha-uNghBXLNvHCOZ8cuA8C5t6fPZFbvP8.webp"
                        alt="Good Dog Bar logo with terrier in top hat"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="aspect-square flex items-center justify-center overflow-hidden rounded-xl">
                      <img
                        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/a-clean-and-modern-logo-illustration-fea_aFuultKgQh-HNvXcKTMAZw_hGGDDkT3QsqQ5SxEV74Nug_0004_Background-Lsj0003epmE1MMZaEHvOIVaVNYB2gD.webp"
                        alt="Good Dog Bar logo with sitting puppy"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {showAILoading && (
          <div className="min-h-screen px-4 py-0 flex items-center justify-center">
            <div className="max-w-[600px] mx-auto w-full">
              <div className="flex flex-col items-center justify-center space-y-8 px-6">
                <div className="text-center space-y-6 w-full">
                  <h1 className="font-bold text-white leading-tight text-left text-2xl">Cooking up your designs</h1>

                  <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full bg-[#c703af] rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="text-left">
                    <span className="text-2xl font-bold text-white">{progress}%</span>
                  </div>

                  <p className="text-white/70 text-sm text-left">
                    Please wait while we generate your custom designs...
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {showAIResults && (
          <div className="min-h-screen py-0 text-transparent bg-transparent px-0">
            <div className="max-w-[600px] mx-auto">
              <div className="relative overflow-y-auto px-4 min-h-[85vh]">
                <div className="relative z-10">
                  <div className="text-center mb-6"></div>

                  <div className="mb-6">
                    <div className="relative">
                      <Carousel
                        className="w-full"
                        opts={{
                          align: "start",
                        }}
                        setApi={(api) => {
                          if (api) {
                            api.on("select", () => {
                              setCurrentImageIndex(api.selectedScrollSnap())
                            })
                          }
                        }}
                      >
                        <CarouselContent>
                          {generatedImages.map((image, index) => (
                            <CarouselItem key={image.id}>
                              <div className="mb-4">
                                <div className="aspect-square overflow-hidden flex items-center justify-center relative rounded-xl">
                                  {image.isLoading ? (
                                    <div className="w-full h-full bg-white/20 rounded-2xl flex flex-col items-center justify-center space-y-4 p-8">
                                      <Loader2 className="w-12 h-12 text-white animate-spin" />
                                      <div className="text-center space-y-2">
                                        <p className="text-white text-xl font-bold">Generating</p>
                                        <p className="text-white/70 text-sm">Will load as soon as it's ready</p>
                                      </div>
                                    </div>
                                  ) : (
                                    <img
                                      src={image.url || "/placeholder.svg"}
                                      alt={`Generated design ${index + 1}`}
                                      className="w-full h-full object-contain"
                                      onError={(e) => {
                                        console.log("[v0] Image failed to load:", image.url)
                                        e.currentTarget.src = "/abstract-geometric-shapes.png"
                                      }}
                                    />
                                  )}
                                </div>
                              </div>
                            </CarouselItem>
                          ))}
                          {generationCount < 15 && (
                            <CarouselItem>
                              <div className="mb-4">
                                <div className="aspect-square overflow-hidden flex items-center justify-center relative rounded-xl">
                                  <div
                                    className="flex flex-col items-center justify-center space-y-6 p-8 cursor-pointer hover:opacity-90 transition-opacity w-full h-full bg-gradient-to-br from-purple-800 to-purple-900"
                                    onClick={handleGenerateMore}
                                  >
                                    <ArrowUp className="w-12 h-12 text-white" />
                                    <div className="text-center space-y-2">
                                      <p className="text-white text-xl font-bold">Generate 3 more designs</p>
                                      <p className="text-white/70 text-sm">Using the same prompt</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CarouselItem>
                          )}
                        </CarouselContent>

                        <div className="flex items-center justify-between mb-6 px-0">
                          <CarouselPrevious className="static translate-y-0 hover:bg-black/30 flex items-center justify-center transition-colors w-12 h-12 rounded-2xl bg-[rgba(255,255,255,0.14)] border-0 text-white hover:text-white disabled:bg-black/20 disabled:text-white/50" />

                          <div className="backdrop-blur-sm rounded-full px-3 py-1 bg-transparent">
                            <span className="text-white text-sm font-medium">
                              {generationCount < 15
                                ? `${currentImageIndex + 1}/${generatedImages.length + 1}`
                                : `${currentImageIndex + 1}/${generatedImages.length}`}
                            </span>
                          </div>

                          <CarouselNext className="static translate-y-0 hover:bg-black/30 flex items-center justify-center transition-colors rounded-2xl w-12 h-12 bg-[rgba(255,255,255,0.14)] border-0 text-white hover:text-white disabled:bg-black/20 disabled:text-white/50" />
                        </div>
                      </Carousel>

                      {currentImageIndex < generatedImages.length && (
                        <Button
                          onClick={() => handleUseDesign(generatedImages[currentImageIndex])}
                          className="w-full transition-all duration-200 border-0 rounded-xl transform hover:scale-[1.02] active:scale-[0.98]"
                          disabled={generatedImages[currentImageIndex]?.isLoading}
                          style={{
                            background: "white",
                            borderRadius: "0.75rem",
                            padding: "20px 0.75rem",
                            fontSize: "16px",
                            fontWeight: "bold",
                            color: "#c703af",
                            height: "60px",
                          }}
                        >
                          Use Design
                        </Button>
                      )}

                      <div className="text-center mt-16">
                        <button
                          onClick={() => {
                            setShowAIResults(false)
                            setShowAIPrompt(true)
                            setCurrentImageIndex(0)
                            setAiPrompt("")
                          }}
                          className="text-white hover:text-white text-sm transition-colors"
                        >
                          Try another prompt
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {!showOptions && !showAIPrompt && !showAIResults && !showAILoading && (
          <div className={`min-h-screen py-0 px-0`}>
            <div className="max-w-[600px] mx-auto">
              <div className="relative overflow-y-auto p-4 min-h-[85vh] pt-[0] pb-6">
                <div className="grid grid-cols-2 gap-3 h-[calc(100%-80px)] overflow-y-auto">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="cursor-pointer group relative z-10"
                      onClick={() => handleProductSelect(product)}
                    >
                      <div className="flex flex-col space-y-2">
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-200 aspect-square relative overflow-hidden border-none">
                          <div className="flex items-center justify-center w-auto h-full">
                            <img
                              src={product.image || "/placeholder.svg"}
                              alt={product.name}
                              className="max-w-full max-h-full object-contain"
                            />
                          </div>
                        </div>
                        <p className="text-white text-left leading-tight px-1 pt-0.5 pb-0 mb-3.5 font-semibold leading-7 text-base">
                          {product.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {showOptions && !showAIPrompt && !showAIResults && !showAILoading && (
          <div className="min-h-screen py-0 px-0">
            <div className="max-w-[600px] mx-auto relative z-10">
              <div className="relative overflow-y-auto p-6 min-h-[85vh] pb-0 pl-4 pr-4 pt-0">
                <div className="relative z-10 space-y-4">
                  <div
                    className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 cursor-pointer hover:bg-white/15 transition-all duration-200 pb-4 pt-4 pl-4 pr-4 border-none"
                    onClick={() => handleNavigation("ai")}
                  >
                    <div className="flex items-center justify-center w-12 h-12 rounded-lg mb-4 bg-fuchsia-600">
                      <Sparkles className="text-white h-6 w-6" />
                    </div>
                    <h3 className="text-white text-lg font-bold leading-5 mb-1.5">Create with AI</h3>
                    <p className="text-white/70 leading-relaxed text-sm leading-4">
                      Describe your idea and let AI generate unique designs for you
                    </p>
                  </div>

                  <div
                    className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 cursor-pointer hover:bg-white/15 transition-all duration-200 pb-4 pt-4 pl-4 pr-4 border-none"
                    onClick={() => handleNavigation("upload")}
                  >
                    <div className="flex items-center justify-center w-12 h-12 rounded-lg mb-4 bg-sky-500">
                      <Upload className="text-white h-6 w-6" />
                    </div>
                    <h3 className="text-white font-bold leading-5 text-lg mb-1.5">Upload Art</h3>
                    <p className="text-white/70 leading-relaxed font-normal text-sm leading-4">
                      Have your own design? Upload and customize it on any product
                    </p>
                  </div>

                  <div
                    className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 cursor-pointer hover:bg-white/15 transition-all duration-200 pb-4 pt-4 pl-4 pr-4 border-none"
                    onClick={() => handleNavigation("text")}
                  >
                    <div className="flex items-center justify-center w-12 h-12 rounded-lg mb-4 bg-yellow-600">
                      <Type className="text-white h-6 w-6" />
                    </div>
                    <h3 className="text-white text-lg leading-5 font-bold mb-1.5">Add Text</h3>
                    <p className="text-white/70 leading-relaxed text-sm leading-4">
                      Create custom text designs with fonts, colors, and effects
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
