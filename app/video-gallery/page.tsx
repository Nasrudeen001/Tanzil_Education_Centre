"use client"

import { ImageIcon, ArrowLeft, Play } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useState } from "react"

export default function VideoGallery() {
  const [isPlaying, setIsPlaying] = useState(false)

  const handleVideoClick = (videoElement: HTMLVideoElement) => {
    if (videoElement.paused) {
      videoElement.play()
      setIsPlaying(true)
    } else {
      videoElement.pause()
      setIsPlaying(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <img
                src="/images/Tanzil Logo.jpeg"
                alt="Markaz Tanzil Logo"
                className="h-12 w-12 object-cover rounded-full border-2 border-teal-400"
              />
              <div>
                <h1 className="text-xl font-bold text-teal-400">MARKAZ TANZIL</h1>
                <p className="text-xs text-slate-300">Integrated Islamic Education</p>
              </div>
            </div>
            <div className="hidden md:flex space-x-6">
              <Link href="/#home" className="hover:text-teal-400 transition-colors">
                Home
              </Link>
              <Link href="/#about" className="hover:text-teal-400 transition-colors">
                About
              </Link>
              <Link href="/#programs" className="hover:text-teal-400 transition-colors">
                Programs
              </Link>
              <Link href="/#explore" className="hover:text-teal-400 transition-colors">
                Explore
              </Link>
              <Link href="/#application" className="hover:text-teal-400 transition-colors">
                Application
              </Link>
              <Link href="/#contact" className="hover:text-teal-400 transition-colors">
                Contact
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Video Gallery Page Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center mb-8">
          <Link href="/explore">
            <Button
              variant="outline"
              className="border-teal-400 text-teal-400 hover:bg-teal-400 hover:text-slate-900"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Explore
            </Button>
          </Link>
          <h1 className="text-3xl font-bold ml-4">
            Video <span className="text-teal-400">Gallery</span>
          </h1>
        </div>

        <div className="mb-8">
          <p className="text-slate-300 max-w-3xl">
            Watch our featured videos showcasing our educational programs, student activities, and campus life. Get a glimpse
            of the vibrant learning environment at TANZIL EDUCATION CENTRE.
          </p>
        </div>

        {/* Video Grid - Four videos in one line */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Welcome Video */}
          <div className="relative group cursor-pointer">
            <div className="relative">
              <video
                src="/images/Welcome Tanzil.mp4"
                controls
                className="w-full h-48 object-cover rounded-lg"
                onClick={(e) => handleVideoClick(e.currentTarget)}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
              {!isPlaying && (
                <div 
                  className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center cursor-pointer hover:bg-opacity-30 transition-all rounded-lg"
                  onClick={(e) => {
                    const video = e.currentTarget.previousElementSibling as HTMLVideoElement;
                    handleVideoClick(video);
                  }}
                >
                  <Play className="h-12 w-12 text-teal-400" />
                </div>
              )}
            </div>
            <div className="mt-2">
              <h3 className="text-white font-medium text-sm">Welcome to Tanzil Education Centre</h3>
              <p className="text-slate-400 text-xs">
                A comprehensive introduction to our institution, values, and educational philosophy
              </p>
            </div>
          </div>

          {/* Quran Video */}
          <div className="relative group cursor-pointer">
            <div className="relative">
              <video
                src="/images/Al-Quran.mp4"
                controls
                className="w-full h-48 object-cover rounded-lg"
                onClick={(e) => handleVideoClick(e.currentTarget)}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
              {!isPlaying && (
                <div 
                  className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center cursor-pointer hover:bg-opacity-30 transition-all rounded-lg"
                  onClick={(e) => {
                    const video = e.currentTarget.previousElementSibling as HTMLVideoElement;
                    handleVideoClick(video);
                  }}
                >
                  <Play className="h-12 w-12 text-teal-400" />
                </div>
              )}
            </div>
            <div className="mt-2">
              <h3 className="text-white font-medium text-sm">Al-Quran Recitation</h3>
              <p className="text-slate-400 text-xs">
                Beautiful Quran recitation showcasing our students' memorization and tajweed skills
              </p>
            </div>
          </div>

          {/* Graduation Video */}
          <div className="relative group cursor-pointer">
            <div className="relative">
              <video
                src="/images/Opening and Graduation.mp4"
                controls
                className="w-full h-48 object-cover rounded-lg"
                onClick={(e) => handleVideoClick(e.currentTarget)}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
              {!isPlaying && (
                <div 
                  className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center cursor-pointer hover:bg-opacity-30 transition-all rounded-lg"
                  onClick={(e) => {
                    const video = e.currentTarget.previousElementSibling as HTMLVideoElement;
                    handleVideoClick(video);
                  }}
                >
                  <Play className="h-12 w-12 text-teal-400" />
                </div>
              )}
            </div>
            <div className="mt-2">
              <h3 className="text-white font-medium text-sm">Opening and Graduation Ceremony</h3>
              <p className="text-slate-400 text-xs">
                Highlights from the official opening and graduation event at Tanzil Education Centre
              </p>
            </div>
          </div>

          {/* Institution's Programs Preview Video */}
          <div className="relative group cursor-pointer">
            <div className="relative">
              <video
                src="/images/Institutions_Programs_Preview.mp4"
                controls
                className="w-full h-48 object-cover rounded-lg"
                onClick={(e) => handleVideoClick(e.currentTarget)}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
              {!isPlaying && (
                <div 
                  className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center cursor-pointer hover:bg-opacity-30 transition-all rounded-lg"
                  onClick={(e) => {
                    const video = e.currentTarget.previousElementSibling as HTMLVideoElement;
                    handleVideoClick(video);
                  }}
                >
                  <Play className="h-12 w-12 text-teal-400" />
                </div>
              )}
            </div>
            <div className="mt-2">
              <h3 className="text-white font-medium text-sm">Institution's Programs Preview</h3>
              <p className="text-slate-400 text-xs">
                An overview of our comprehensive educational programs and facilities
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-800 border-t border-slate-700 py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <img
                src="/images/Tanzil Logo.jpeg"
                alt="Markaz Tanzil Logo"
                className="h-8 w-8 object-cover rounded-full border border-teal-400"
              />
              <span className="font-bold text-teal-400">MARKAZ TANZIL</span>
            </div>
            <div className="text-slate-400 text-sm">© 2025 Tanzil Education Centre. All rights reserved.</div>
          </div>
          <div className="text-center mt-4 text-slate-400 text-xs">
            <p>"Educating, Transforming and Serving" | "Knowledge and Values"</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
