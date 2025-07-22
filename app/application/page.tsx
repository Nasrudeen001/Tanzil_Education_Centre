"use client"

import Navbar from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Download, FileText, GraduationCap, Calculator } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ApplicationPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Navbar />
      <section className="py-16 bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">
              Join <span className="text-teal-400">TANZIL EDUCATION CENTRE</span>
            </h3>
            <p className="text-slate-300 max-w-2xl mx-auto">
              Take the first step towards quality Islamic education. Download our application forms and become part of
              our learning community.
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Tahfidh Admission Form */}
              <Card className="bg-slate-700 border-slate-600">
                <CardHeader className="text-center">
                  <FileText className="h-16 w-16 text-teal-400 mx-auto mb-4" />
                  <CardTitle className="text-white text-2xl">Tahfidh Admission Form</CardTitle>
                  <CardDescription className="text-slate-300">
                    For students joining our Qur'an Memorization program
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center space-y-6">
                  <div className="bg-slate-800 p-4 rounded-lg">
                    <h4 className="text-lg font-semibold text-teal-400 mb-2">Program Details:</h4>
                    <ul className="text-left text-slate-300 space-y-1 text-sm">
                      <li>• Comprehensive Qur'an memorization</li>
                      <li>• Qualified Huffaz teachers</li>
                      <li>• Boarding facilities available</li>
                      <li>• Structured memorization methodology</li>
                    </ul>
                  </div>
                  <Button className="bg-teal-600 hover:bg-teal-700 w-full" size="lg" asChild>
                    <a href="/forms/Tahfidh%20Admission%20Form.pdf" download="TANZIL-Tahfidh-Admission-Form.pdf">
                      <Download className="mr-2 h-5 w-5" />
                      Download Tahfidh Form
                    </a>
                  </Button>
                </CardContent>
              </Card>
              {/* Ta'lim Admission Form */}
              <Card className="bg-slate-700 border-slate-600">
                <CardHeader className="text-center">
                  <FileText className="h-16 w-16 text-teal-400 mx-auto mb-4" />
                  <CardTitle className="text-white text-2xl">Ta'lim Admission Form</CardTitle>
                  <CardDescription className="text-slate-300">
                    For students joining our Religious Education program
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center space-y-6">
                  <div className="bg-slate-800 p-4 rounded-lg">
                    <h4 className="text-lg font-semibold text-teal-400 mb-2">Program Details:</h4>
                    <ul className="text-left text-slate-300 space-y-1 text-sm">
                      <li>• Islamic studies curriculum</li>
                      <li>• Arabic language instruction</li>
                      <li>• Fiqh, Hadith, and Islamic history</li>
                      <li>• Character development</li>
                    </ul>
                  </div>
                  <Button className="bg-teal-600 hover:bg-teal-700 w-full" size="lg" asChild>
                    <a href="/forms/Ta'lim%20Admission%20Form.pdf" download="TANZIL-Talim-Admission-Form.pdf">
                      <Download className="mr-2 h-5 w-5" />
                      Download Ta'lim Form
                    </a>
                  </Button>
                </CardContent>
              </Card>
              {/* Integrated Admission Form */}
              <Card className="bg-slate-700 border-slate-600">
                <CardHeader className="text-center">
                  <GraduationCap className="h-16 w-16 text-teal-400 mx-auto mb-4" />
                  <CardTitle className="text-white text-2xl">Integrated Admission Form</CardTitle>
                  <CardDescription className="text-slate-300">
                    For students joining our Competence Based Education program
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center space-y-6">
                  <div className="bg-slate-800 p-4 rounded-lg">
                    <h4 className="text-lg font-semibold text-teal-400 mb-2">Program Details:</h4>
                    <ul className="text-left text-slate-300 space-y-1 text-sm">
                      <li>• Competence Based Education (CBE)</li>
                      <li>• Aligned with Kenyan education standards</li>
                      <li>• Practical skills development</li>
                      <li>• Critical thinking and problem-solving</li>
                      <li>• Digital literacy integration</li>
                      <li>• Continuous assessment approach</li>
                      <li>• Holistic learner development</li>
                    </ul>
                  </div>
                  <div className="bg-slate-800 p-4 rounded-lg">
                    <h4 className="text-lg font-semibold text-teal-400 mb-2">Grade Levels:</h4>
                    <ul className="text-left text-slate-300 space-y-1 text-sm">
                      <li>• Pre-Primary 1 (PP1)</li>
                      <li>• Grade 1 - Grade 3 (Lower Primary)</li>
                      <li>• Grade 4 - Grade 6 (Upper Primary)</li>
                      <li>• Integrated with Islamic values</li>
                    </ul>
                  </div>
                  <Button className="bg-teal-600 hover:bg-teal-700 w-full" size="lg" asChild>
                    <a href="/forms/Integrated%20Admission%20Form.pdf" download="TANZIL-Integrated-Admission-Form.pdf">
                      <Download className="mr-2 h-5 w-5" />
                      Download Integrated Form
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
            {/* Technical Courses Form */}
            <Card className="bg-slate-700 border-slate-600 mt-8">
              <CardHeader className="text-center">
                <FileText className="h-16 w-16 text-teal-400 mx-auto mb-4" />
                <CardTitle className="text-white text-2xl">Technical Courses Form</CardTitle>
                <CardDescription className="text-slate-300">
                  For students interested in our technical skills development programs
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-slate-800 p-4 rounded-lg">
                    <h4 className="text-lg font-semibold text-teal-400 mb-2">Computer Classes:</h4>
                    <ul className="text-left text-slate-300 space-y-1 text-sm">
                      <li>• Basic Computer Skills</li>
                      <li>• Microsoft Office Suite</li>
                      <li>• Internet & Email Usage</li>
                      <li>• Digital Literacy</li>
                    </ul>
                    <Button className="bg-teal-600 hover:bg-teal-700 w-full mt-4" size="lg" asChild>
                      <a href="/forms/Computer%20Classes%20Form.pdf" download="TANZIL-Computer-Classes-Form.pdf">
                        <Download className="mr-2 h-5 w-5" />
                        Download Computer Classes Form
                      </a>
                    </Button>
                  </div>
                  <div className="bg-slate-800 p-4 rounded-lg">
                    <h4 className="text-lg font-semibold text-teal-400 mb-2">Tailoring Course:</h4>
                    <ul className="text-left text-slate-300 space-y-1 text-sm">
                      <li>• Basic Sewing Skills</li>
                      <li>• Pattern Making</li>
                      <li>• Garment Construction</li>
                      <li>• Professional Tailoring</li>
                    </ul>
                    <Button className="bg-teal-600 hover:bg-teal-700 w-full mt-4" size="lg" asChild>
                      <a href="/forms/Tailoring%20Course%20Form.pdf" download="TANZIL-Tailoring-Course-Form.pdf">
                        <Download className="mr-2 h-5 w-5" />
                        Download Tailoring Form
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Application Requirements */}
            <Card className="bg-slate-700 border-slate-600 mt-8">
              <CardHeader className="text-center">
                <CardTitle className="text-white text-2xl">Application Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-semibold text-teal-400 mb-4">General Requirements:</h4>
                    <ul className="text-left text-slate-300 space-y-2">
                      <li>• Completed application form</li>
                      <li>• Birth certificate copy</li>
                      <li>• Previous academic records</li>
                      <li>• Passport-size photographs (2-4 copies)</li>
                      <li>• Parent/Guardian identification</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-teal-400 mb-4">Boarding Requirements:</h4>
                    <ul className="text-left text-slate-300 space-y-2">
                      <h2 className="text-lg font-semibold text-teal-400 mb-4">Integrated</h2>
                      <li>• Boys: Shirt (white), Trousers (beige), Socks (brown with dark brown strips)</li>
                      <li>• Girls: Blouse (white), Dress (beige), Trouser (white), Hijab (white with beige ribbon), Socks (White)</li>
                      <li>• Sweater (beige with a logo)</li>
                      <h2 className="text-lg font-semibold text-teal-400 mb-4">Taalim</h2>
                      <li>• Boys: Kanzu (grey), White cap (Kofia)</li>
                      <li>• Girls: Dress (grey), Trousers (white), Hijab (white with grey ribbon)</li>
                      <h2 className="text-lg font-semibold text-teal-400 mb-4">Tahfidh</h2>
                      <li>• Pujabi (grey), Trousers (grey), White cap (Kofia)</li>
                    </ul>
                  </div>
                </div>
                <div className="text-sm text-slate-400 mt-6 text-center">
                  <p>For assistance with the application process, please contact our admissions office.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
} 