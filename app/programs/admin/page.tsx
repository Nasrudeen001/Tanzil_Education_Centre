"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AdminProgram() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">Administrative Programs</h1>
          <p className="text-xl text-slate-600 mb-8">
            Comprehensive administrative training and management programs for educational institutions.
          </p>
          
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Program Features</h2>
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div>
                <h3 className="font-semibold text-slate-800 mb-2">School Management</h3>
                <ul className="space-y-1 text-slate-600">
                  <li>• Strategic planning and policy development</li>
                  <li>• Financial management and budgeting</li>
                  <li>• Human resource management</li>
                  <li>• Quality assurance and accreditation</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 mb-2">Leadership Development</h3>
                <ul className="space-y-1 text-slate-600">
                  <li>• Educational leadership principles</li>
                  <li>• Change management strategies</li>
                  <li>• Team building and motivation</li>
                  <li>• Communication and conflict resolution</li>
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