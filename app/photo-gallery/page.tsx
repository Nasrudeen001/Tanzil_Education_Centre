"use client"

import { useState } from "react"
import { ImageIcon, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import ImageViewer from "@/components/image-viewer"

interface ImageItem {
  src: string
  alt: string
  title: string
  description: string
}

export default function PhotoGallery() {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)
  const [isViewerOpen, setIsViewerOpen] = useState(false)

  const images: ImageItem[] = [
    {
      src: "/images/Reception Visiting area.jpeg",
      alt: "Reception Seats",
      title: "Reception Seats",
      description: "A Comfortable welcoming seats for our Visitors"
    },
    {
      src: "/images/Tahfidh Students.jpeg",
      alt: "Tahfidh Students",
      title: "Tahfidh Students",
      description: "Our Tahfidh Students Dedicated in Memorization of the Holy Quran"
    },
    {
      src: "/images/Staffroom.jpeg",
      alt: "Staffroom",
      title: "Staffroom",
      description: "Our well-equipped Staffroom"
    },
    {
      src: "/images/Computer Laboratory.jpg",
      alt: "Computer Laboratory",
      title: "Computer Laboratory",
      description: "Modern computer facilities for digital literacy"
    },
    {
      src: "/images/Prayer Hall.jpeg",
      alt: "Prayer Hall",
      title: "Prayer Hall",
      description: "Our dedicated space for worship and prayer"
    },
    {
      src: "/images/Dormitory.jpeg",
      alt: "Student Dormitory",
      title: "Student Dormitory",
      description: "Well Facilitated and Secured Dormitory for students"
    },
    {
      src: "/images/Activity Hall.jpeg",
      alt: "Activity Hall",
      title: "Activity Hall",
      description: "Where students enjoy carrying out various Activities"
    },
    {
      src: "/images/PP1 Class Decorated with Charts.jpeg",
      alt: "Pre-Primary Class",
      title: "Pre-Primary Class",
      description: "Beautifully Decorated Pre-Primary Class"
    },
    {
      src: "/images/Taalim Class.jpeg",
      alt: "Taalim Classes",
      title: "Taalim Class",
      description: "Spacious Class for Taalim Lessons"
    },
    {
      src: "/images/Tailoring Class.jpeg",
      alt: "Tailoring Class",
      title: "Tailoring Class",
      description: "Facilities Ready for learning in our Tailoring Class"
    },
    {
      src: "/images/Play group Chart 1.jpeg",
      alt: "Decorative Arts",
      title: "Decorated Wall",
      description: "A well decorated wall with arts for the Play Group Class"
    },
    {
      src: "/images/Outdoor view.jpeg",
      alt: "Outdoor View",
      title: "Outdoor View",
      description: "Our beautiful outdoor learning environment view"
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

      {/* Photo Gallery Page Content */}
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
            Photo <span className="text-teal-400">Gallery</span>
          </h1>
        </div>

        <div className="mb-8">
          <p className="text-slate-300 max-w-3xl">
            Explore our Institution facilities, classrooms, and learning environments through our comprehensive photo
            collection. Get a visual tour of TANZIL EDUCATION CENTRE and see what makes our institution special.
            Click on any image to view it in full screen.
          </p>
        </div>

        {/* Photo Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {images.map((image, index) => (
            <div 
              key={index}
              className="relative group cursor-pointer"
              onClick={() => handleImageClick(index)}
            >
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-64 object-cover rounded-lg border border-slate-600 group-hover:border-teal-400 transition-colors"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                <ImageIcon className="h-8 w-8 text-white" />
              </div>
              <div className="mt-2">
                <h3 className="text-white font-medium">{image.title}</h3>
                <p className="text-slate-400 text-sm">{image.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Image Viewer */}
      <ImageViewer
        images={images}
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
