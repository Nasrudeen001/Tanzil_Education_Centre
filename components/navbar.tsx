"use client"

import Link from "next/link"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"
import { useState } from "react"
import { Menu, X } from "lucide-react"

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  return (
    <nav className="bg-slate-800 border-b border-slate-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <img src="/images/Tanzil Logo.jpeg" alt="Tanzil Logo" className="h-10 w-10 rounded-full" />
              <div className="flex flex-col">
                <span className="font-bold text-white whitespace-nowrap text-[clamp(1rem,4vw,1.5rem)]">TANZIL EDUCATION CENTRE</span>
                <span className="text-sm text-teal-400 font-medium">Knowledge and Values</span>
              </div>
            </Link>
          </div>

          {/* Hamburger for mobile */}
          <button
            className="md:hidden text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-teal-400"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>

          {/* Navigation Links (Desktop) */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-slate-300 hover:text-white">
              Home
            </Link>
            <Link href="/about" className="text-slate-300 hover:text-white">
              About
            </Link>
            <Link href="/programs" className="text-slate-300 hover:text-white">
              Programs
            </Link>
            <Link href="/explore" className="text-slate-300 hover:text-white">
              Explore
            </Link>
            <Link href="/application" className="text-slate-300 hover:text-white">
              Application
            </Link>
            <Link href="/board-of-trustees" className="text-slate-300 hover:text-white">
              Board of Trustees
            </Link>
            <Link href="/contact" className="text-slate-300 hover:text-white">
              Contact
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-teal-400 hover:text-teal-300 font-medium flex items-center gap-1 focus:outline-none">
                  Portal <ChevronDown className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => window.location.href = "/portal/login?portal=admin"}>
                  Admin Portal
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.location.href = "/portal/login?portal=staff"}>
                  Staff Portal
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.location.href = "/portal/login?portal=student"}>
                  Student Portal
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute left-0 right-0 bg-slate-800 border-b border-slate-700 z-50 shadow-lg animate-fade-in">
            <div className="flex flex-col space-y-2 py-4 px-6">
              <Link href="/" className="text-slate-300 hover:text-white py-2" onClick={() => setMobileMenuOpen(false)}>
                Home
              </Link>
              <Link href="/about" className="text-slate-300 hover:text-white py-2" onClick={() => setMobileMenuOpen(false)}>
                About
              </Link>
              <Link href="/programs" className="text-slate-300 hover:text-white py-2" onClick={() => setMobileMenuOpen(false)}>
                Programs
              </Link>
              <Link href="/explore" className="text-slate-300 hover:text-white py-2" onClick={() => setMobileMenuOpen(false)}>
                Explore
              </Link>
              <Link href="/application" className="text-slate-300 hover:text-white py-2" onClick={() => setMobileMenuOpen(false)}>
                Application
              </Link>
              <Link href="/board-of-trustees" className="text-slate-300 hover:text-white py-2" onClick={() => setMobileMenuOpen(false)}>
                Board of Trustees
              </Link>
              <Link href="/contact" className="text-slate-300 hover:text-white py-2" onClick={() => setMobileMenuOpen(false)}>
                Contact
              </Link>
              <div className="pt-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="w-full text-teal-400 hover:text-teal-300 font-medium flex items-center gap-1 focus:outline-none py-2">
                      Portal <ChevronDown className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={() => { setMobileMenuOpen(false); window.location.href = "/portal/login?portal=admin"; }}>
                      Admin Portal
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setMobileMenuOpen(false); window.location.href = "/portal/login?portal=staff"; }}>
                      Staff Portal
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setMobileMenuOpen(false); window.location.href = "/portal/login?portal=student"; }}>
                      Student Portal
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
} 