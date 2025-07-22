"use client"

import Navbar from "@/components/navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Target, Eye, ListChecks, Star } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen relative">
      {/* Full Page Background Image */}
      <div 
        className="fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/Back.jpeg')" }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <Navbar />
        
        {/* Hero Section */}
        <div className="h-[50vh] w-full flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4 text-white drop-shadow-lg">
              About <span className="text-teal-400">TANZIL EDUCATION CENTRE</span>
            </h1>
            <p className="text-xl text-slate-200 max-w-2xl mx-auto drop-shadow-lg">
              Nurturing Excellence, Embracing Values, Building Future Leaders
            </p>
          </div>
        </div>

        {/* Mission, Vision, and Objectives Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            {/* Mission - Right Side */}
            <div className="flex flex-col md:flex-row items-center gap-8 mb-16">
              <div className="md:w-1/2 order-2 md:order-1">
                <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-600 hover:border-teal-400 transition-all duration-300">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <Target className="h-12 w-12 text-teal-400" />
                      <h2 className="text-3xl font-bold text-white">Our Mission</h2>
                    </div>
                    <p className="text-slate-200 text-lg leading-relaxed">
                      Providing All-inclusive Knowledge, Intellectual skills and Islamic Ethics under Islamic Educational Environment.
                    </p>
                  </CardContent>
                </Card>
              </div>
              <div className="md:w-1/2 order-1 md:order-2">
                <div className="aspect-video bg-slate-900/40 rounded-lg backdrop-blur-sm flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-4 border-teal-400 shadow-lg">
                      <img 
                        src="/images/Tanzil Logo.jpeg" 
                        alt="Tanzil Logo" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="text-4xl font-bold text-white drop-shadow-lg">MISSION</h3>
                  </div>
                </div>
              </div>
            </div>

            {/* Vision - Left Side */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-8 mb-16">
              <div className="md:w-1/2">
                <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-600 hover:border-teal-400 transition-all duration-300">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <Eye className="h-12 w-12 text-teal-400" />
                      <h2 className="text-3xl font-bold text-white">Our Vision</h2>
                    </div>
                    <p className="text-slate-200 text-lg leading-relaxed">
                    To be the leading institution in offering Holistic Islamic Education Integrated with high moral Values.
                    </p>
                  </CardContent>
                </Card>
              </div>
              <div className="md:w-1/2">
                <div className="aspect-video bg-slate-900/40 rounded-lg backdrop-blur-sm flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-4 border-teal-400 shadow-lg">
                      <img 
                        src="/images/Tanzil Logo.jpeg" 
                        alt="Tanzil Logo" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="text-4xl font-bold text-white drop-shadow-lg">VISION</h3>
                  </div>
                </div>
              </div>
            </div>

            {/* Objectives - Right Side */}
            <div className="flex flex-col md:flex-row items-center gap-8 mb-16">
              <div className="md:w-1/2 order-2 md:order-1">
                <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-600 hover:border-teal-400 transition-all duration-300">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <ListChecks className="h-12 w-12 text-teal-400" />
                      <h2 className="text-3xl font-bold text-white">Our Objectives</h2>
                    </div>
                    <p className="text-slate-200 text-lg leading-relaxed">
                    The general objective of this centre is to provide an ideal Islamic teaching environment that offers 
                    holistic integrated education with a strong foundation of Qur’an memorization and Islamic ethics.
                    </p>
                  </CardContent>
                </Card>
              </div>
              <div className="md:w-1/2 order-1 md:order-2">
                <div className="aspect-video bg-slate-900/40 rounded-lg backdrop-blur-sm flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-4 border-teal-400 shadow-lg">
                      <img 
                        src="/images/Tanzil Logo.jpeg" 
                        alt="Tanzil Logo" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="text-4xl font-bold text-white drop-shadow-lg">OBJECTIVES</h3>
                  </div>
                </div>
              </div>
            </div>

            {/* Core Values - Left Side */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-8">
              <div className="md:w-1/2">
                <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-600 hover:border-teal-400 transition-all duration-300">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <Star className="h-12 w-12 text-teal-400" />
                      <h2 className="text-3xl font-bold text-white">Our Core Values</h2>
                    </div>
                    <ul className="text-left text-slate-300 space-y-2">
                      <h2 className="text-lg font-semibold text-teal-400 mb-4">T-TRUST</h2>
                      <p>We trust in Allah</p>
                      <h2 className="text-lg font-semibold text-teal-400 mb-4">A-ACHIEVEMENT</h2>
                      <p>We Strive to achieve Student's Potential</p>
                      <h2 className="text-lg font-semibold text-teal-400 mb-4">N-NOBILITY</h2>
                      <p>Noble Character is our Focus</p>
                      <h2 className="text-lg font-semibold text-teal-400 mb-4">Z-ZEAL</h2>
                      <p>Our zeal for Academic Excellence is high</p>
                      <h2 className="text-lg font-semibold text-teal-400 mb-4">I-ISLAM</h2>
                      <p>Islamic faith is our Foundaton</p>
                      <h2 className="text-lg font-semibold text-teal-400 mb-4">L-LEARNING</h2>
                      <p>Learning is our Obligation and Responsibility</p>
                    </ul>
                  </CardContent>
                </Card>
              </div>
              <div className="md:w-1/2">
                <div className="aspect-video bg-slate-900/40 rounded-lg backdrop-blur-sm flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-4 border-teal-400 shadow-lg">
                      <img 
                        src="/images/Tanzil Logo.jpeg" 
                        alt="Tanzil Logo" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="text-4xl font-bold text-white drop-shadow-lg">CORE VALUES</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
} 