"use client"

import Navbar from "@/components/navbar"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Award, Laptop, GraduationCap, Scissors } from "lucide-react"

const programs = [
  {
    title: "Ta'lim Program",
    icon: <BookOpen className="h-10 w-10 text-teal-400" />,
    description: "Islamic studies with academic excellence for holistic development.",
    link: "/programs/taalim"
  },
  {
    title: "Tahfidh Program",
    icon: <Award className="h-10 w-10 text-blue-400" />,
    description: "Memorization of the Holy Quran with proper tajweed and tarteel.",
    link: "/programs/tahfidh"
  },
  {
    title: "Computer Classes",
    icon: <Laptop className="h-10 w-10 text-purple-400" />,
    description: "Essential digital skills and computer literacy for the modern world.",
    link: "/programs/computer"
  },
  {
    title: "Integrated Education",
    icon: <GraduationCap className="h-10 w-10 text-yellow-400" />,
    description: "Integrated Islamic Studies with CBE programs, providing Practical, skill-based learning for career and life readiness.",
    link: "/programs/cbe"
  },
  {
    title: "Tailoring Course",
    icon: <Scissors className="h-10 w-10 text-pink-400" />,
    description: "Hands-on Fashion Design and Dress Making skills for self-reliance and entrepreneurship.",
    link: "/programs/tailoring"
  },
  {
    title: "Tahfidh with CBE Tuition",
    icon: <Award className="h-10 w-10 text-teal-400" />,
    description: "A unique blend of Quran memorization and Competency-Based Education (CBE) academic tuition.",
    link: "/programs/tahfidh-cbe"
  }
]

export default function ProgramsPage() {
  return (
    <div className="min-h-screen relative">
      {/* Full Page Background Image */}
      <div 
        className="fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/Program 0.jpeg')" }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-60"></div>
      </div>
      {/* Content */}
      <div className="relative z-10">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">Tanzil Education Centre</h1>
            <h2 className="text-2xl font-semibold text-teal-400 mb-6 drop-shadow-lg">Our Programs</h2>
            <p className="text-lg text-slate-200 max-w-2xl mx-auto drop-shadow-lg">Explore the diverse programs we offer to nurture academic, spiritual, and practical skills.</p>
          </div>
          <div className="space-y-16">
            {programs.map((program, idx) => (
              <div key={program.title} className={`flex flex-col md:flex-row items-center md:items-stretch ${idx % 2 === 1 ? 'md:flex-row-reverse' : ''} gap-8`}>
                <div className="flex-shrink-0 flex items-center justify-center md:w-1/3">
                  <div className="p-6 bg-slate-900/80 rounded-full border-4 border-slate-700 shadow-lg">
                    {program.icon}
                  </div>
                </div>
                <Card className="flex-1 bg-slate-900/80 backdrop-blur-sm border-slate-600 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-2xl text-white mb-2">{program.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-200 mb-6 text-lg">{program.description}</p>
                    <Button asChild className="bg-teal-500 hover:bg-teal-600 text-lg px-8 py-4">
                      <Link href={program.link}>
                        View Details
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
          <div className="text-center mt-16">
            <Link href="/" className="text-teal-400 hover:text-teal-300 underline text-lg">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 