"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Bell, User, LogOut, Menu, X } from "lucide-react"
import { toast } from "sonner"

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  
  const [dropdownOpen, setDropdownOpen] = React.useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const [userEmail, setUserEmail] = React.useState<string | null>(null)
  
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserEmail(user.email || null)
      }
    }
    fetchUser()
  }, [supabase])

  // Close dropdown when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      toast.success("Signed out successfully.")
      router.push("/login")
    } catch (err: any) {
      toast.error("Failed to sign out: " + err.message)
    }
  }

  const navLinks = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Jobs", href: "/jobs" },
    { name: "Applications", href: "/applications" },
    { name: "Profile", href: "/profile" },
  ]

  const initial = userEmail ? userEmail.charAt(0).toUpperCase() : "U"

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-150 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* Left: Brand Logo */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-baseline space-x-[1px]">
              <span className="text-2xl font-extrabold text-[#1B3FA0] tracking-tight">t</span>
              <span className="text-2xl font-extrabold text-[#2563EB] tracking-tight">o</span>
              <span className="text-2xl font-extrabold text-[#1B3FA0] tracking-tight">oplo</span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              {navLinks.map((link) => {
                const isActive = pathname === link.href
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-semibold tracking-wide transition-colors ${
                      isActive
                        ? "border-[#1B3FA0] text-[#1B3FA0]"
                        : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    {link.name}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Right: Actions & User Menu */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            
            {/* Notification Bell */}
            <button
              type="button"
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-500 hover:bg-slate-50 relative transition-colors focus:outline-none"
            >
              <Bell className="w-6 h-6" />
              <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
            </button>

            {/* Avatar Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1B3FA0] transition-transform active:scale-95"
              >
                <span className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-blue-50 text-[#1B3FA0] font-extrabold border border-blue-100 uppercase">
                  {initial}
                </span>
              </button>

              {dropdownOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-xl shadow-lg py-1 bg-white border border-slate-100 ring-1 ring-black ring-opacity-5 focus:outline-none divide-y divide-slate-50">
                  <div className="px-4 py-2 text-xs font-bold text-slate-500 truncate uppercase">
                    {userEmail || "user@tooplo.com"}
                  </div>
                  <div className="py-1">
                    <Link
                      href="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <User className="w-4 h-4 mr-2 text-slate-400" />
                      View Profile
                    </Link>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4 mr-2 text-rose-500" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-slate-500 hover:bg-slate-50 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white">
          <div className="pt-2 pb-3 space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block pl-3 pr-4 py-2.5 border-l-4 text-base font-semibold transition-colors ${
                    isActive
                      ? "bg-blue-50/50 border-[#1B3FA0] text-[#1B3FA0]"
                      : "border-transparent text-slate-500 hover:bg-slate-50 hover:border-slate-300"
                  }`}
                >
                  {link.name}
                </Link>
              )
            })}
          </div>
          <div className="pt-4 pb-3 border-t border-slate-100">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-blue-50 text-[#1B3FA0] font-extrabold border border-blue-100 uppercase">
                  {initial}
                </span>
              </div>
              <div className="ml-3">
                <div className="text-sm font-bold text-slate-800 truncate uppercase">
                  {userEmail || "user@tooplo.com"}
                </div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 text-base font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
              >
                View Profile
              </Link>
              <button
                onClick={handleSignOut}
                className="w-full text-left block px-4 py-2 text-base font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
