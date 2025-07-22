"use client"

import {
  Download,
  BookOpen,
  Monitor,
  Heart,
  Users,
  Phone,
  Mail,
  MapPin,
  GraduationCap,
  FileText,
  Calculator,
  Camera,
  Play,
  Video,
  ArrowRight,
  Calendar,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Navbar from "@/components/navbar"
import ImageCarousel from "@/components/image-carousel"
import Footer from "@/components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 text-white relative">
      {/* Content */}
      <div className="relative z-10">
        <Navbar />
        
        {/* Hero Section with Carousel */}
        <section className="relative">
          <ImageCarousel />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center px-4">
              <h1 className="font-bold mb-6 text-white drop-shadow-lg text-[clamp(1.5rem,6vw,3rem)] md:text-[clamp(2.5rem,4vw,4rem)] whitespace-nowrap">
                Welcome to <span className="text-teal-400 whitespace-nowrap">TANZIL EDUCATION CENTRE</span>
              </h1>
              <p className="text-xl text-white max-w-3xl mx-auto drop-shadow-lg">
                A beacon of knowledge and Islamic values, nurturing young minds for a brighter future.
              </p>
          </div>
        </div>
      </section>

        {/* Features Section */}
        <section className="py-16">
        <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-12 text-white">Why Choose Tanzil?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-600 hover:border-teal-400 transition-all duration-300">
                <CardContent className="p-6">
                  <BookOpen className="h-12 w-12 text-teal-400 mb-4" />
                  <h3 className="text-xl font-bold mb-2 text-white">Quality Education</h3>
                  <p className="text-slate-200">
                    Comprehensive curriculum combining academic excellence with Islamic values
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-600 hover:border-teal-400 transition-all duration-300">
                <CardContent className="p-6">
                  <Users className="h-12 w-12 text-teal-400 mb-4" />
                  <h3 className="text-xl font-bold mb-2 text-white">Expert Faculty</h3>
                  <p className="text-slate-200">
                    Experienced teachers dedicated to nurturing young minds
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-600 hover:border-teal-400 transition-all duration-300">
                <CardContent className="p-6">
                  <GraduationCap className="h-12 w-12 text-teal-400 mb-4" />
                  <h3 className="text-xl font-bold mb-2 text-white">Holistic Development</h3>
                  <p className="text-slate-200">
                    Focus on academic, spiritual, and character development
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-600 hover:border-teal-400 transition-all duration-300">
                <CardContent className="p-6">
                  <Calendar className="h-12 w-12 text-teal-400 mb-4" />
                  <h3 className="text-xl font-bold mb-2 text-white">Modern Facilities</h3>
                  <p className="text-slate-200">
                    State-of-the-art infrastructure for enhanced learning
                  </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
        <section className="py-16">
        <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-12 text-white">Contact Us</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-600">
                <CardContent className="p-6 text-center">
                <Phone className="h-12 w-12 text-teal-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2 text-white">Phone</h3>
                <p className="text-slate-300">+254 726 376 569</p>
                <p className="text-slate-300">+254 769 199 301</p>
              </CardContent>
            </Card>

              <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-600">
                <CardContent className="p-6 text-center">
                <Mail className="h-12 w-12 text-teal-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2 text-white">Email</h3>
                <p className="text-slate-300">markaztanzil@gmail.com</p>
                <p className="text-slate-300">tanzileducationcenter@gmail.com</p>
              </CardContent>
            </Card>

              <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-600">
                <CardContent className="p-6 text-center">
                <MapPin className="h-12 w-12 text-teal-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2 text-white">Address</h3>
                  <p className="text-slate-300">
                    P.O. Box 83947 – 80100<br />
                    Jitoni, Jomvu<br />
                    Mombasa, Kenya
                  </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
        <Footer />
        </div>
    </div>
  )
}
