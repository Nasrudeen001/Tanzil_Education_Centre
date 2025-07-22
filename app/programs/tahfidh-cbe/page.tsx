"use client"

import Navbar from "@/components/navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Users, GraduationCap, Clock, Calendar, Award, Briefcase } from "lucide-react"
import Link from "next/link"

export default function TahfidhCBEProgramPage() {
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
              <span className="text-teal-400">Tahfidh</span> with <span className="text-teal-400">CBE Tuition</span>
            </h1>
            <p className="text-xl text-slate-200 max-w-2xl mx-auto drop-shadow-lg">
              Integrating Quran memorization with Competency-Based Education for holistic student growth
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
                    The Tahfidh with CBE Tuition program offers students the unique opportunity to memorize the Holy Quran while pursuing academic excellence through the Competency-Based Education (CBE) curriculum. This integrated approach ensures spiritual, intellectual, and practical development in a nurturing Islamic environment.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Clock className="h-6 w-6 text-teal-400 mt-1" />
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-2">Duration</h3>
                        <p className="text-slate-200">Full academic year, with flexible scheduling for boarders and day scholars</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Calendar className="h-6 w-6 text-teal-400 mt-1" />
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-2">Schedule</h3>
                        <p className="text-slate-200">Quran memorization and CBE classes are balanced throughout the day, including dedicated time for prayers, revision, and academic support.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Award className="h-6 w-6 text-teal-400 mt-1" />
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-2">Certification</h3>
                        <p className="text-slate-200">Certificates awarded for both Quran memorization milestones and CBE academic achievements</p>
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
                      <span>Memorize the Holy Quran with proper tajweed and tarteel</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-teal-400" />
                      <span>Develop strong recitation and understanding of Quranic verses</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-teal-400" />
                      <span>Achieve academic excellence in CBE subjects</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-teal-400" />
                      <span>Build practical skills for real-world success</span>
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
                    <li>• Integrated Quran memorization and CBE tuition</li>
                    <li>• Individual attention and mentoring</li>
                    <li>• Regular assessments and progress tracking</li>
                    <li>• Small class sizes for personalized learning</li>
                    <li>• Modern teaching methods and resources</li>
                    <li>• Islamic values and character development</li>
                    <li>• Flexible boarding and day scholar options</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-600">
                <CardContent className="p-8">
                  <h2 className="text-3xl font-bold mb-6 text-white">Admission Requirements</h2>
                  <ul className="space-y-4 text-slate-200">
                    <li>• Admission Fee</li>
                    <li>• School Uniform</li>
                    <li>• Birth Certificate Copy</li>
                    <li>• Parent/Guardian ID Copy</li>
                    <li>• Completed Application Form</li>
                  </ul>
                </CardContent>
              </Card>

              <div className="text-center">
                <Button asChild className="bg-teal-500 hover:bg-teal-600 text-lg px-8 py-6">
                  <a href="/forms/Tahfidh%20Admission%20Form.pdf" download="TANZIL-Tahfidh-CBE-Admission-Form.pdf">
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