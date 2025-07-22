"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

const images = [
  "/images/Home1.jpeg",
  "/images/Home2.jpeg",
  "/images/Home3.jpeg",
  "/images/Home4.jpeg",
  "/images/Home5.jpeg",
  "/images/Welcome 1.jpeg",
  "/images/Welcome 2.jpeg",
  "/images/Welcome 3.jpeg",
  "/images/Welcome 4.jpeg",
  "/images/Welcome 5.jpeg",
]

export default function ImageCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
    }, 5000) // Change image every 5 seconds

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="relative w-full h-[40vh] md:h-[80vh] overflow-hidden">
      {images.map((image, index) => (
        <div
          key={image}
          className={cn(
            "absolute inset-0 transition-opacity duration-1000 ease-in-out",
            index === currentIndex ? "opacity-100" : "opacity-0"
          )}
        >
          <div className="absolute inset-0 animate-kenburns">
            <Image
              src={image}
              alt={`Welcome image ${index + 1}`}
              fill
              className="object-cover"
              priority={index === 0}
              sizes="100vw"
            />
          </div>
          {/* Overlay gradient for better text visibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent" />
        </div>
      ))}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3">
        {images.map((_, index) => (
          <button
            key={index}
            className={cn(
              "w-4 h-4 rounded-full transition-all duration-300",
              index === currentIndex ? "bg-white scale-125" : "bg-white/50 hover:bg-white/75"
            )}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  )
} 