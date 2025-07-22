"use client"

import { useState, useEffect } from "react"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ImageItem {
  src: string
  alt: string
  title?: string
  description?: string
}

interface ImageViewerProps {
  images: ImageItem[]
  initialIndex: number
  isOpen: boolean
  onClose: () => void
}

export default function ImageViewer({ images, initialIndex, isOpen, onClose }: ImageViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  useEffect(() => {
    setCurrentIndex(initialIndex)
  }, [initialIndex])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case "Escape":
          onClose()
          break
        case "ArrowLeft":
          goToPrevious()
          break
        case "ArrowRight":
          goToNext()
          break
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, currentIndex, onClose])

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  if (!isOpen) return null

  const currentImage = images[currentIndex]

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center">
      {/* Close Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 text-white hover:bg-white hover:text-black z-10"
        onClick={onClose}
      >
        <X className="h-6 w-6" />
      </Button>

      {/* Navigation Buttons */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white hover:text-black z-10"
        onClick={goToPrevious}
      >
        <ChevronLeft className="h-8 w-8" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white hover:text-black z-10"
        onClick={goToNext}
      >
        <ChevronRight className="h-8 w-8" />
      </Button>

      {/* Image Container */}
      <div className="relative max-w-[90vw] max-h-[90vh] flex flex-col items-center">
        <img
          src={currentImage.src}
          alt={currentImage.alt}
          className="max-w-full max-h-[80vh] object-contain rounded-lg"
        />
        
        {/* Image Info */}
        {(currentImage.title || currentImage.description) && (
          <div className="mt-4 text-center text-white max-w-2xl">
            {currentImage.title && (
              <h3 className="text-xl font-semibold mb-2">{currentImage.title}</h3>
            )}
            {currentImage.description && (
              <p className="text-slate-300">{currentImage.description}</p>
            )}
          </div>
        )}

        {/* Image Counter */}
        <div className="mt-4 text-white text-sm">
          {currentIndex + 1} of {images.length}
        </div>
      </div>

      {/* Keyboard Instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm opacity-70">
        Use arrow keys or click to navigate • Press ESC to close
      </div>
    </div>
  )
} 