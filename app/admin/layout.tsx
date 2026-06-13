import * as React from "react"
import Link from "next/link"
import { Shield, LogOut } from "lucide-react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Admin Navbar */}
      <nav className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            
            {/* Left: Admin Brand Logo */}
            <div className="flex items-center space-x-3">
              <Link href="/admin/dashboard" className="flex items-baseline space-x-[1px]">
                <span className="text-2xl font-extrabold text-white tracking-tight">t</span>
                <span className="text-2xl font-extrabold text-[#3b82f6] tracking-tight">o</span>
                <span className="text-2xl font-extrabold text-white tracking-tight">oplo</span>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 ml-2 uppercase tracking-widest flex items-center">
                  <Shield className="w-3 h-3 mr-1 text-[#3b82f6]" />
                  admin
                </span>
              </Link>
            </div>

            {/* Right: Sign Out Portal */}
            <div className="flex items-center space-x-4">
              <Link 
                href="/login"
                className="inline-flex items-center px-4 py-2 border border-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Link>
            </div>

          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
