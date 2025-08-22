"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface Product {
  id: number
  name: string
  image: string
}

interface ProductCarouselProps {
  onProductSelect: (product: Product) => void
}

export function ProductCarousel({ onProductSelect }: ProductCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Sample products - you can customize these
  const products: Product[] = [
    { id: 1, name: "Classic T-Shirt", image: "/white-t-shirt.png" },
    { id: 2, name: "Hoodie", image: "/hoodie-sweatshirt.png" },
    { id: 3, name: "Tank Top", image: "/simple-tank-top.png" },
    { id: 4, name: "Long Sleeve", image: "/long-sleeve-shirt.png" },
    { id: 5, name: "Polo Shirt", image: "/classic-polo-shirt.png" },
    { id: 6, name: "V-Neck", image: "/placeholder-j5bbd.png" },
    { id: 7, name: "Baseball Tee", image: "/baseball-tee.png" },
    { id: 8, name: "Crop Top", image: "/stylish-woman-crop-top.png" },
    { id: 9, name: "Sweatshirt", image: "/cozy-sweatshirt.png" },
    { id: 10, name: "Zip Hoodie", image: "/zip-hoodie.png" },
  ]

  const itemsPerView = 4
  const maxIndex = Math.max(0, products.length - itemsPerView)

  const handlePrevious = () => {
    setCurrentIndex(Math.max(0, currentIndex - 1))
  }

  const handleNext = () => {
    setCurrentIndex(Math.min(maxIndex, currentIndex + 1))
  }

  const handleProductClick = (product: Product) => {
    onProductSelect(product)
  }

  return (
    <div className="mb-8">
      <h2 className="text-xl font-serif font-bold text-center text-gray-800 mb-6">Select a Product To Get Started</h2>

      <div className="relative">
        {/* Navigation Buttons */}
        {currentIndex > 0 && (
          <button
            onClick={handlePrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full shadow-md flex items-center justify-center hover:bg-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
        )}

        {currentIndex < maxIndex && (
          <button
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full shadow-md flex items-center justify-center hover:bg-white transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        )}

        {/* Carousel Container */}
        <div className="overflow-hidden px-6">
          <div
            className="flex transition-transform duration-300 ease-in-out gap-3"
            style={{ transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)` }}
          >
            {products.map((product) => (
              <div
                key={product.id}
                className="flex-shrink-0 cursor-pointer group"
                style={{ width: `calc(25% - 9px)` }}
                onClick={() => handleProductClick(product)}
              >
                <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-4 group-hover:scale-105 transform transition-transform duration-200">
                  <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden mb-3">
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-xs font-medium text-gray-700 text-center leading-tight">{product.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center mt-4 space-x-1">
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? "bg-primary" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
