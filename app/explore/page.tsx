"use client"

import Navbar from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Camera, Video, Users } from "lucide-react"
import { useRouter } from "next/navigation"

export default function ExplorePage() {
  const router = useRouter()
  return (
    <div className="min-h-screen bg-slate-800 text-white">
      <Navbar />
      
      {/* Video Background Section */}
      <div className="relative w-full h-[60vh] overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover"
        >
          <source src="/images/explore.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4 text-white">
              Welcome to <span className="text-teal-400">Our School</span>
            </h1>
            <p className="text-xl text-slate-200 max-w-2xl mx-auto">
              Discover excellence in education through our state-of-the-art facilities and vibrant learning environment
            </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <section className="py-16 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">
              Explore <span className="text-teal-400">Our Institution</span>
            </h3>
            <p className="text-slate-300 max-w-2xl mx-auto">
              Take a virtual tour of our facilities and see our students in action through our photo and video gallery.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="bg-slate-700/80 backdrop-blur-sm border-slate-600 hover:border-teal-400 transition-all duration-300 cursor-pointer transform hover:scale-105">
              <CardHeader className="text-center">
                <Camera className="h-16 w-16 text-teal-400 mx-auto mb-4" />
                <CardTitle className="text-white">Photo Gallery</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-slate-300 text-center">
                  Explore our beautiful campus facilities, classrooms, and learning environments through our
                  comprehensive photo collection.
                </CardDescription>
                <Button
                  className="mt-4 w-full bg-teal-600 hover:bg-teal-700 transition-colors"
                  onClick={() => router.push("/photo-gallery")}
                >
                  View Photos
                </Button>
              </CardContent>
            </Card>
            <Card className="bg-slate-700/80 backdrop-blur-sm border-slate-600 hover:border-teal-400 transition-all duration-300 cursor-pointer transform hover:scale-105">
              <CardHeader className="text-center">
                <Video className="h-16 w-16 text-teal-400 mx-auto mb-4" />
                <CardTitle className="text-white">Video Gallery</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-slate-300 text-center">
                  Watch videos of our teaching methods, student activities, and educational programs in action.
                </CardDescription>
                <Button
                  className="mt-4 w-full bg-teal-600 hover:bg-teal-700 transition-colors"
                  onClick={() => router.push("/video-gallery")}
                >
                  Watch Videos
                </Button>
              </CardContent>
            </Card>
            <Card className="bg-slate-700/80 backdrop-blur-sm border-slate-600 hover:border-teal-400 transition-all duration-300 cursor-pointer transform hover:scale-105">
              <CardHeader className="text-center">
                <Users className="h-16 w-16 text-teal-400 mx-auto mb-4" />
                <CardTitle className="text-white">Student Life</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-slate-300 text-center">
                  See our students engaged in learning, sports, and extracurricular activities throughout their day.
                </CardDescription>
                <Button
                  className="mt-4 w-full bg-teal-600 hover:bg-teal-700 transition-colors"
                  onClick={() => router.push("/student-life")}
                >
                  Learn More
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
} 