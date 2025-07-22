"use client"

import Navbar from "@/components/navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Users, GraduationCap, Clock, Calendar, Award, Brain } from "lucide-react"
import Link from "next/link"

export default function TaalimProgramPage() {
  return (
    <div className="min-h-screen relative">
      {/* Full Page Background Image */}
      <div 
        className="fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/Ta%27lim%20P.jpeg')" }}
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
              <span className="text-teal-400">Ta'lim</span> Program
            </h1>
            <p className="text-xl text-slate-200 max-w-2xl mx-auto drop-shadow-lg">
              Learning Islamic studies with academic excellence
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
                    Our Ta'lim program provides a comprehensive Islamic studies with academic excellence. 
                    Students develop a strong foundation in religious education, preparing them for success 
                    in this world and the hereafter.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Clock className="h-6 w-6 text-teal-400 mt-1" />
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-2">Duration</h3>
                        <p className="text-slate-200">Full academic year program</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Calendar className="h-6 w-6 text-teal-400 mt-1" />
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-2">Schedule</h3>
                        <p className="text-slate-200">Monday to Wednesday, 4:30 PM - 6:00 PM</p>
                        <p className="text-slate-200">Saturday, 7:30 AM - 4:00 PM</p>
                        <p className="text-slate-200">Sunday, 7:30 AM - 12:30 PM</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Award className="h-6 w-6 text-teal-400 mt-1" />
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-2">Certification</h3>
                        <p className="text-slate-200">Academic certification upon completion</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-600">
                <CardContent className="p-8">
                  <h2 className="text-3xl font-bold mb-6 text-white">Curriculum</h2>
                  <ul className="space-y-4 text-slate-200">
                    <li className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-teal-400" />
                      <span>Quran - Memorization and Recitation</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-teal-400" />
                      <span>Fiqhi - Jurisprudence</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-teal-400" />
                      <span>Tawheed - Islamic Creed</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-teal-400" />
                      <span>Arabic Language, Tajweed, Tafseer, Biography of the Holy Prophet</span>
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
                    <li>• Comprehensive Islamic studies</li>
                    <li>• Academic excellence </li>
                    <li>• Character development</li>
                    <li>• Modern teaching methods</li>
                    <li>• Regular assessments</li>
                    <li>• Small class sizes</li>
                    <li>• Individual attention</li>
                    <li>• School-ibrary Visits</li>
                    <li>• Parent-teacher meetings</li>
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
                  <a href="/forms/Ta'lim%20Admission%20Form.pdf" download="TANZIL-Talim-Admission-Form.pdf">
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