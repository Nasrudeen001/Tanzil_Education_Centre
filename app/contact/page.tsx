"use client"

import Navbar from "@/components/navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Phone, Mail, MapPin, Clock } from "lucide-react"
import Link from "next/link"

export default function ContactPage() {
  return (
    <div className="min-h-screen relative">
      {/* Full Page Background Image */}
      <div 
        className="fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/Program3.jpeg')" }}
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
              Contact <span className="text-teal-400">Us</span>
            </h1>
            <p className="text-xl text-slate-200 max-w-2xl mx-auto drop-shadow-lg">
              Get in touch with us for any inquiries or to schedule a visit
            </p>
          </div>
        </div>

        {/* Contact Information */}
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Left Column - Contact Details */}
            <div className="space-y-8">
              <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-600">
                <CardContent className="p-8">
                  <h2 className="text-3xl font-bold mb-6 text-white">Contact Information</h2>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <Phone className="h-6 w-6 text-teal-400 mt-1" />
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-1">Phone</h3>
                        <p className="text-slate-200">+254 726 376 569</p>
                        <p className="text-slate-200">+254 769 199 301</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <Mail className="h-6 w-6 text-teal-400 mt-1" />
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-1">Email</h3>
                        <p className="text-slate-200">markaztanzil@gmail.com</p>
                        <p className="text-slate-200">tanzileducationcenter@gmail.com</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <MapPin className="h-6 w-6 text-teal-400 mt-1" />
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-1">Address</h3>
                        <p className="text-slate-200">
                          P.O. Box 83947 – 80100<br />
                          Jitoni, Jomvu<br />
                          Mombasa, Kenya
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <Clock className="h-6 w-6 text-teal-400 mt-1" />
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-1">Working Hours</h3>
                        <p className="text-slate-200">
                          Monday - Friday: 8:00 AM - 4:00 PM<br />
                          Saturday: 9:00 AM - 1:00 PM
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Contact Form */}
            <div className="space-y-8">
              <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-600">
                <CardContent className="p-8">
                  <h2 className="text-3xl font-bold mb-6 text-white">Send us a Message</h2>
                  <form className="space-y-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-slate-200 mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-slate-200 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                        placeholder="Your email"
                      />
                    </div>
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-slate-200 mb-2">
                        Message
                      </label>
                      <textarea
                        id="message"
                        rows={4}
                        className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                        placeholder="Your message"
                      ></textarea>
                    </div>
                    <Button className="w-full bg-teal-500 hover:bg-teal-600">
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 