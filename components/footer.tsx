"use client"

import Link from "next/link"
import { Facebook, Twitter, Instagram, MessageCircle, Phone, Mail, MapPin, ChevronDown } from "lucide-react"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"

export default function Footer() {
  return (
    <footer className="bg-slate-900/90 backdrop-blur-sm text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-teal-400">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-slate-300 hover:text-teal-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-slate-300 hover:text-teal-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/programs" className="text-slate-300 hover:text-teal-400 transition-colors">
                  Programs
                </Link>
              </li>
              <li>
                <Link href="/explore" className="text-slate-300 hover:text-teal-400 transition-colors">
                  Explore
                </Link>
              </li>
              <li>
                <Link href="/application" className="text-slate-300 hover:text-teal-400 transition-colors">
                  Application
                </Link>
              </li>
              <li>
                <Link href="/board-of-trustees" className="text-slate-300 hover:text-teal-400 transition-colors">
                  Board of Trustees
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-slate-300 hover:text-teal-400 transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="text-slate-300 hover:text-teal-400 transition-colors flex items-center gap-1 focus:outline-none">
                      Portals <ChevronDown className="w-3 h-3" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
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
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-teal-400">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-2 text-slate-300">
                <Phone className="h-5 w-5 text-teal-400" />
                <span>+254 726 376 569</span>
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <Phone className="h-5 w-5 text-teal-400" />
                <span>+254 769 199 301</span>
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <Mail className="h-5 w-5 text-teal-400" />
                <span>markaztanzil@gmail.com</span>
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <Mail className="h-5 w-5 text-teal-400" />
                <span>tanzileducationcenter@gmail.com</span>
              </li>
              <li className="flex items-start gap-2 text-slate-300">
                <MapPin className="h-5 w-5 text-teal-400 mt-1" />
                <span>P.O. Box 83947 – 80100<br />Jitoni, Jomvu<br />Mombasa, Kenya</span>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-teal-400">Reach Us</h3>
            <div className="flex gap-4">
              <a
                href="https://web.facebook.com/profile.php?id=61555970028001"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-300 hover:text-teal-400 transition-colors"
              >
                <Facebook className="h-6 w-6" />
              </a>
              <a
                href="https://x.com/Markaz_Tanzil"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-300 hover:text-teal-400 transition-colors"
              >
                {/* X (Twitter) Icon */}
                <svg
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M17.53 3H21L14.19 10.91L22.24 21H16.16L11.38 14.78L5.97 21H2.19L9.39 12.66L1.76 3H8.01L12.36 8.67L17.53 3ZM16.41 19.13H18.23L7.7 4.77H5.74L16.41 19.13Z" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/tanzileducationcentre/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-300 hover:text-teal-400 transition-colors"
              >
                <Instagram className="h-6 w-6" />
              </a>
              <a
                href="https://www.tiktok.com/@tanzil_educationcentre"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-300 hover:text-teal-400 transition-colors"
              >
                <svg
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
              </a>
              <a
                href="https://wa.me/254726376569"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-300 hover:text-teal-400 transition-colors"
              >
                <MessageCircle className="h-6 w-6" />
              </a>
              <a
                href="https://maps.app.goo.gl/279pTBiSpUNaeMrw7"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-300 hover:text-teal-400 transition-colors"
                title="View location on Google Maps"
              >
                <MapPin className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-slate-700 mt-8 pt-8 text-center text-slate-400">
          <p>© {new Date().getFullYear()} Tanzil Education Centre. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
} 