"use client"

import Navbar from "@/components/navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Users, GraduationCap, Clock, Calendar, Award, Scissors, Ruler } from "lucide-react"
import Link from "next/link"

export default function TailoringProgramPage() {
  return (
    <div className="min-h-screen relative">
      {/* Full Page Background Image */}
      <div 
        className="fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/Tailoring P.jpeg')" }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <Navbar />
        
        {/* Hero Section */}
        <div className="h-[40vh] w-full flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4 text-white drop-shadow-lg">
              <span className="text-teal-400">Tailoring</span> Program
            </h1>
            <p className="text-xl text-slate-200 max-w-2xl mx-auto drop-shadow-lg">
              Master the Art of Sewing and Design
            </p>
          </div>
        </div>

        {/* Program Details */}
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Left Column - Program Information */}
            <div className="space-y-8">
              <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-600">
                <CardContent className="p-8">
                  <h2 className="text-3xl font-bold mb-6 text-white">Program Overview</h2>
                  <p className="text-slate-200 mb-6">
                    Our tailoring program teaches essential sewing and design skills. Students learn both traditional 
                    and modern techniques, preparing them for a career in fashion and garment making while maintaining modesty in design.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Clock className="h-6 w-6 text-teal-400 mt-1" />
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-2">Duration</h3>
                        <p className="text-slate-200">2-year comprehensive program</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Calendar className="h-6 w-6 text-teal-400 mt-1" />
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-2">Schedule</h3>
                        <p className="text-slate-200">Flexible sessions - Morning or Afternoon</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Award className="h-6 w-6 text-teal-400 mt-1" />
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-2">Certification</h3>
                        <p className="text-slate-200">Professional tailoring certification</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-600">
                <CardContent className="p-8">
                  <h2 className="text-3xl font-bold mb-6 text-white">Course Modules</h2>
                  <ul className="space-y-4 text-slate-200">
                    <li className="flex items-center gap-2">
                      <Scissors className="h-5 w-5 text-teal-400" />
                      <span>Basic Sewing Techniques</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Ruler className="h-5 w-5 text-teal-400" />
                      <span>Pattern Making</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-teal-400" />
                      <span>Garment Construction</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-teal-400" />
                      <span>Design Principles</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Program Features */}
            <div className="space-y-8">
              <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-600">
                <CardContent className="p-8">
                  <h2 className="text-3xl font-bold mb-6 text-white">Program Features</h2>
                  <ul className="space-y-4 text-slate-200">
                    <li>• Professional sewing equipment</li>
                    <li>• Expert instructors</li>
                    <li>• Hands-on training</li>
                    <li>• Small class sizes</li>
                    <li>• Practical projects</li>
                    <li>• Business skills</li>
                    <li>• Industry exposure</li>
                    <li>• Career guidance</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-600">
                <CardContent className="p-8">
                  <h2 className="text-3xl font-bold mb-6 text-white">Admission Requirements</h2>
                  <ul className="space-y-4 text-slate-200">
                    <li>• Copy of Id or Birth certificate </li>
                    <li>• Two passport size pictures </li>
                    <li>• Admission fee</li>
                    <li>• Writing Materials</li>
                  </ul>
                </CardContent>
              </Card>

              <div className="text-center">
                <Button asChild className="bg-teal-500 hover:bg-teal-600 text-lg px-8 py-6">
                  <a href="/forms/TAILORING%20FORM%202025.pdf" download="TANZIL-Tailoring-Admission-Form-2025.pdf">
                    Download Application Form
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 