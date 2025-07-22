"use client"

import Navbar from "@/components/navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Users, GraduationCap, Clock, Calendar, Award } from "lucide-react"
import Link from "next/link"

export default function TahfidhProgramPage() {
  return (
    <div className="min-h-screen relative">
      {/* Full Page Background Image */}
      <div 
        className="fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/Tahfidh P.jpeg')" }}
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
              <span className="text-teal-400">Tahfidh</span> Program
            </h1>
            <p className="text-xl text-slate-200 max-w-2xl mx-auto drop-shadow-lg">
              Master the Holy Quran with proper tajweed and tarteel
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
                    Our Tahfidh program is designed to help students memorize the Holy Quran with proper tajweed and tarteel. 
                    The program combines traditional memorization methods with modern teaching techniques to ensure effective 
                    learning and retention.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Clock className="h-6 w-6 text-teal-400 mt-1" />
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-2">Duration</h3>
                        <p className="text-slate-200">Flexible scheduling options available</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Calendar className="h-6 w-6 text-teal-400 mt-1" />
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-2">Schedule</h3>
                        <h4 className="text-lg font-semibold text-teal-400 mb-4">Day-Schooler</h4>
                        <p className="text-slate-200">Monday to Thursday, 7:00 AM - 8:00PM</p>
                        <p className="text-slate-200">Saturday and Sunday, 7:00 AM - 8:00PM</p>
                        <h4 className="text-lg font-semibold text-teal-400 mb-4">Boarders</h4>
                        <p className="text-slate-200">Monday to Thursday, 4:00 AM - 8:00PM</p>
                        <p className="text-slate-200">Saturday and Sunday, 4:00 AM - 8:00PM</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Award className="h-6 w-6 text-teal-400 mt-1" />
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-2">Certification</h3>
                        <p className="text-slate-200">Progress certification upon completion</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-600">
                <CardContent className="p-8">
                  <h2 className="text-3xl font-bold mb-6 text-white">Learning Objectives</h2>
                  <ul className="space-y-4 text-slate-200">
                    <li className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-teal-400" />
                      <span>Complete Quran memorization with proper tajweed</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-teal-400" />
                      <span>Develop strong recitation skills</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-teal-400" />
                      <span>Understand the meanings and context of verses</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-teal-400" />
                      <span>Build confidence in public recitation</span>
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
                    <li>• Individual attention and guidance</li>
                    <li>• Regular revision and testing</li>
                    <li>• Proper tajweed and tarteel training</li>
                    <li>• Flexible scheduling options</li>
                    <li>• Progress certification</li>
                    <li>• Small group sessions</li>
                    <li>• One-on-one mentoring</li>
                    <li>• Regular assessments</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-600">
                <CardContent className="p-8">
                  <h2 className="text-3xl font-bold mb-6 text-white">Admission Requirements</h2>
                  <ul className="space-y-4 text-slate-200">
                    <li>• Admission Fee</li>
                    <li>• Ta'lim Uniform</li>
                    <li>• Birth Certififcate Copy</li>
                    <li>• Guardian's/Parent's ID Copy</li>
                    <li>• Filling and Returning the Form</li>
                  </ul>
                </CardContent>
              </Card>

              <div className="text-center">
                <Button asChild className="bg-teal-500 hover:bg-teal-600 text-lg px-8 py-6">
                  <a href="/forms/Tahfidh%20Admission%20Form.pdf" download="TANZIL-Tahfidh-Admission-Form.pdf">
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