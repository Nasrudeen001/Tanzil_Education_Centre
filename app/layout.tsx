import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from "@/components/auth-provider";

export const metadata: Metadata = {
  title: 'Tanzil Education Centre',
  description: 'An integrated institution providing quality education through Competence Based Education, Tahfidh (Quran Memorization), Talim (Religious Education), and Computer Classes.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/Tanzil Logo.png" type="image/png" />
      </head>
      <body className="min-h-screen bg-slate-900 text-white antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
