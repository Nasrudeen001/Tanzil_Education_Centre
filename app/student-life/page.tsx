"use client"

import { useState } from "react"
import { ArrowLeft, Clock, Users, Heart, BookOpen, Trophy, Utensils, Home } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import ImageViewer from "@/components/image-viewer"

interface ImageItem {
  src: string
  alt: string
  title: string
  description?: string
}

export default function StudentLife() {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)
  const [isViewerOpen, setIsViewerOpen] = useState(false)

  const studentActivityImages: ImageItem[] = [
    {
      src: "/images/Computer Laboratory.jpg",
      alt: "Computer Classes",
      title: "Computer Classes",
      description: "Students learning modern technology and digital skills"
    },
    {
      src: "/images/Trip to County Assembly.jpeg",
      alt: "Trip to County Assembly",
      title: "Trip to County Assembly",
      description: "Students visiting the County Assembly for civic education"
    },
    {
      src: "/images/Hafla Tahfidh.jpeg",
      alt: "Hafla Tahfidh",
      title: "Hufaz from our Markaz Tanzil",
      description: "Our Graduant Students in their Hafla"
    },
    {
      src: "/images/Group Study.jpeg",
      alt: "Group Study",
      title: "Group Study",
      description: "Students collaborating in group study sessions"
    },
    {
      src: "/images/Classroom Learning.jpeg",
      alt: "Classroom Learning",
      title: "Classroom Learning",
      description: "Students actively participating in classroom activities"
    },
    {
      src: "/images/Agriculture Activity.jpeg",
      alt: "Agriculture Activity",
      title: "Agriculture Activity",
      description: "Students engaging in hands-on agriculture activities"
    },
    {
      src: "/images/Quran Memorization.jpeg",
      alt: "Quran Memorization",
      title: "Quran Memorization",
      description: "Students dedicated to memorizing the Holy Quran"
    },
    {
      src: "/images/Tajweed Class.jpeg",
      alt: "Tajweed Class",
      title: "Tajweed Class",
      description: "Students perfecting their Quranic recitation with Tajweed lessons"
    }
  ]

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index)
    setIsViewerOpen(true)
  }

  const handleCloseViewer = () => {
    setIsViewerOpen(false)
    setSelectedImageIndex(null)
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

      {/* Student Life Page Content */}
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
            Student <span className="text-teal-400">Life</span>
          </h1>
        </div>

        <div className="mb-8">
          <p className="text-slate-300 max-w-3xl text-lg">
            At TANZIL EDUCATION CENTRE, student life is a harmonious blend of academic excellence, spiritual growth, and
            character development. Our students experience a nurturing environment that fosters both intellectual and
            moral development in accordance with Islamic values.
          </p>
        </div>

        {/* Student Life Aspects */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">
            Aspects of <span className="text-teal-400">Student Life</span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-slate-800 border-slate-700 hover:border-teal-400 transition-colors">
              <CardHeader>
                <BookOpen className="h-12 w-12 text-teal-400 mb-4" />
                <CardTitle className="text-white">Academic Excellence</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 text-sm">
                  Our students engage in comprehensive learning through the Competence Based Education, Islamic
                  studies, and modern educational approaches that prepare them for future success.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700 hover:border-teal-400 transition-colors">
              <CardHeader>
                <Heart className="h-12 w-12 text-teal-400 mb-4" />
                <CardTitle className="text-white">Spiritual Development</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 text-sm">
                  Daily prayers, Quran memorization, and Islamic character building form the foundation of our students'
                  spiritual growth and moral development.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700 hover:border-teal-400 transition-colors">
              <CardHeader>
                <Users className="h-12 w-12 text-teal-400 mb-4" />
                <CardTitle className="text-white">Community & Brotherhood</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 text-sm">
                  Students develop strong bonds of friendship and brotherhood, learning to live harmoniously in a
                  diverse community while respecting Islamic values.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700 hover:border-teal-400 transition-colors">
              <CardHeader>
                <Trophy className="h-12 w-12 text-teal-400 mb-4" />
                <CardTitle className="text-white">Sports & Recreation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 text-sm">
                  Physical fitness and recreational activities are integral to student life, promoting health, teamwork,
                  and balanced development.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700 hover:border-teal-400 transition-colors">
              <CardHeader>
                <Utensils className="h-12 w-12 text-teal-400 mb-4" />
                <CardTitle className="text-white">Nutritious Meals</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 text-sm">
                  Students enjoy healthy, balanced meals prepared with care, ensuring proper nutrition for their
                  physical and mental development.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700 hover:border-teal-400 transition-colors">
              <CardHeader>
                <Home className="h-12 w-12 text-teal-400 mb-4" />
                <CardTitle className="text-white">Comfortable Boarding</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 text-sm">
                  Our boarding facilities provide a safe, comfortable home away from home where students can focus on
                  their studies and personal growth.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Student Activities Gallery */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">
            Student <span className="text-teal-400">Activities</span>
          </h2>
          <p className="text-slate-300 mb-6">
            Click on any image to view it in full screen and navigate through our student activities gallery.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {studentActivityImages.map((image, index) => (
              <div 
                key={index}
                className="relative group cursor-pointer"
                onClick={() => handleImageClick(index)}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-48 object-cover rounded-lg border border-slate-600 group-hover:border-teal-400 transition-colors"
                />
                <div className="absolute bottom-2 left-2 text-white text-sm font-medium bg-black bg-opacity-50 px-2 py-1 rounded">
                  {image.title}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Student Testimonials */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">
            Student <span className="text-teal-400">Testimonials</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <img
                    src="/images/Luqman Suleiman.jpeg"
                    alt="Luqman Suleiman"
                    className="w-12 h-12 rounded-full border-2 border-teal-400 object-cover"
                  />
                  <div>
                    <p className="text-slate-300 italic mb-3">
                      "At Tanzil Education Centre, I've not only excelled academically but also grown spiritually. The
                      teachers care about our character development as much as our studies."
                    </p>
                    <div>
                      <h4 className="text-white font-semibold">Luqman Suleiman</h4>
                      <p className="text-teal-400 text-sm">Grade 6 Student</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <img
                    src="/images/Abdulghawiy Mbarak.jpeg"
                    alt="Abdulghawiy Mbarak"
                    className="w-12 h-12 rounded-full border-2 border-teal-400 object-cover"
                  />
                  <div>
                    <p className="text-slate-300 italic mb-3">
                      "The brotherhood here is amazing. We support each other in memorizing the Quran and in our
                      studies. It feels like a big family."
                    </p>
                    <div>
                      <h4 className="text-white font-semibold">Abdulqawy Mbarak</h4>
                      <p className="text-teal-400 text-sm">Tahfidh Program Student</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <img
                    src="/images/Mallo Beko.jpeg"
                    alt="Mallo Beko"
                    className="w-12 h-12 rounded-full border-2 border-teal-400 object-cover"
                  />
                  <div>
                    <p className="text-slate-300 italic mb-3">
                      "I really enjoy the agricultural projects we do at school. Planting, taking care of crops, and learning about farming is fun and helps us understand the importance of agriculture in our lives."
                    </p>
                    <div>
                      <h4 className="text-white font-semibold">Mallo Beko</h4>
                      <p className="text-teal-400 text-sm">Grade 4 Student</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <img
                    src="/images/Yassir Ayub.jpeg"
                    alt="Yassir Ayub"
                    className="w-12 h-12 rounded-full border-2 border-teal-400 object-cover"
                  />
                  <div>
                    <p className="text-slate-300 italic mb-3">
                      "The teachers are like parents to us. They guide us not just in academics but in becoming better
                      Muslims and human beings."
                    </p>
                    <div>
                      <h4 className="text-white font-semibold">Yassir Ayub</h4>
                      <p className="text-teal-400 text-sm">Grade 4 Student</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center">
          <Card className="bg-gradient-to-r from-teal-600 to-teal-700 border-teal-500">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-white mb-4">Join Our Student Community</h2>
              <p className="text-teal-100 mb-6 max-w-2xl mx-auto">
                Experience the unique blend of academic excellence and spiritual growth that makes TANZIL EDUCATION
                CENTRE special. Apply today and become part of our family.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/application">
                  <Button size="lg" className="bg-white text-teal-700 hover:bg-slate-100">
                    Apply Now
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" className="bg-slate-800 text-white hover:bg-slate-700 border-2 border-white">
                    Contact Us
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Image Viewer */}
      <ImageViewer
        images={studentActivityImages}
        initialIndex={selectedImageIndex || 0}
        isOpen={isViewerOpen}
        onClose={handleCloseViewer}
      />

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
