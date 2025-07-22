"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function StaffProgram() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">Staff Development Programs</h1>
          <p className="text-xl text-slate-600 mb-8">
            Professional development and training programs for educational staff and teachers.
          </p>
          
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Program Features</h2>
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div>
                <h3 className="font-semibold text-slate-800 mb-2">Teaching Excellence</h3>
                <ul className="space-y-1 text-slate-600">
                  <li>• Modern teaching methodologies</li>
                  <li>• Classroom management techniques</li>
                  <li>• Student assessment strategies</li>
                  <li>• Curriculum development</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 mb-2">Professional Growth</h3>
                <ul className="space-y-1 text-slate-600">
                  <li>• Continuous professional development</li>
                  <li>• Technology integration in education</li>
                  <li>• Special needs education training</li>
                  <li>• Educational leadership skills</li>
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
 