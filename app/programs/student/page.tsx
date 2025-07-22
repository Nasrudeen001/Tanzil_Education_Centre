"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function StudentProgram() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">Student Programs</h1>
          <p className="text-xl text-slate-600 mb-8">
            Comprehensive educational programs designed to nurture and develop students' potential.
          </p>
          
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Program Features</h2>
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div>
                <h3 className="font-semibold text-slate-800 mb-2">Academic Excellence</h3>
                <ul className="space-y-1 text-slate-600">
                  <li>• Comprehensive curriculum</li>
                  <li>• Individualized learning plans</li>
                  <li>• Academic support and tutoring</li>
                  <li>• Progress tracking and assessment</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 mb-2">Holistic Development</h3>
                <ul className="space-y-1 text-slate-600">
                  <li>• Character building and values</li>
                  <li>• Extracurricular activities</li>
                  <li>• Leadership development</li>
                  <li>• Career guidance and counseling</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button className="bg-slate-800 hover:bg-slate-700 text-white">
                Contact Us
              </Button>
            </Link>
            <Link href="/programs">
              <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50">
                View All Programs
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 