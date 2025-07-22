"use client"

import Navbar from "@/components/navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Users, GraduationCap, Clock, Calendar, Award, Briefcase } from "lucide-react"
import Link from "next/link"

export default function CBEProgramPage() {
  return (
    <div className="min-h-screen relative">
      {/* Full Page Background Image */}
      <div 
        className="fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/CBE P.jpeg')" }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <Navbar />
        <div className="bg-teal-400 text-black py-2 px-4 text-center font-semibold text-lg animate-marquee rounded shadow mb-4 max-w-xl mx-auto">
          Boarding offered to students from 7 to 15 years
        </div>
        
        {/* Hero Section */}
        <div className="h-[40vh] w-full flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4 text-white drop-shadow-lg">
              <span className="text-teal-400">Integrated Education</span> Program
            </h1>
            <p className="text-xl text-slate-200 max-w-2xl mx-auto drop-shadow-lg">
              Competency-Based Education for Real-World Success
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
                    Our Competency-Based Education (CBE) program focuses on developing practical skills and knowledge 
                    that prepare students for real-world challenges. The program emphasizes hands-on learning and 
                    industry-relevant competencies while learning and maintaining Islamic values and principles.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Clock className="h-6 w-6 text-teal-400 mt-1" />
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-2">Duration</h3>
                        <p className="text-slate-200">Flexible program length based on competency mastery</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Calendar className="h-6 w-6 text-teal-400 mt-1" />
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-2">Schedule</h3>
                        <p className="text-slate-200">Flexible scheduling with practical sessions</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Award className="h-6 w-6 text-teal-400 mt-1" />
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-2">Certification</h3>
                        <p className="text-slate-200">Competency-based certification</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-600">
                <CardContent className="p-8">
                  <h2 className="text-3xl font-bold mb-6 text-white">Core Competencies</h2>
                  <ul className="space-y-4 text-slate-200">
                    <li className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-teal-400" />
                      <span>Integrated CBE with Islamic Knowledge</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-teal-400" />
                      <span>Teamwork and Collaboration</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-teal-400" />
                      <span>Skills Development</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-teal-400" />
                      <span>Practical Problem Solving</span>
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
                    <li>• Modern teaching methods</li>
                    <li>• Practical skill focus</li>
                    <li>• Career guidance</li>
                    <li>• Projects</li>
                    <li>• Islamic values integration</li>
                    <li>• Hands-on projects</li>
                    <li>• Academic Trips</li>
                    <li>• Flexible learning pace</li>
                    <li>• School-library Visits</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-600">
                <CardContent className="p-8">
                  <h2 className="text-3xl font-bold mb-6 text-white">Admission Requirements</h2>
                  <ul className="space-y-4 text-slate-200">
                    <li>• Copy of birth certificate</li>
                    <li>• passport size photos </li>
                    <li>• Diary (Available at school) </li>
                    <li>• Assessment  book (Available at school) </li>
                  </ul>
                </CardContent>
              </Card>

              <div className="text-center">
                <Button asChild className="bg-teal-500 hover:bg-teal-600 text-lg px-8 py-6">
                  <a href="/forms/Integrated%20Admission%20Form.pdf" download="TANZIL-Integrated-Admission-Form.pdf">
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