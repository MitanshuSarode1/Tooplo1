"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [loginRole, setLoginRole] = React.useState<"student" | "company" | "admin">("student")
  const [isLoading, setIsLoading] = React.useState(false)

  // Auto-detect role from URL parameters (e.g. /login?role=admin)
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      const roleParam = params.get("role")
      if (roleParam === "admin") {
        setLoginRole("admin")
      } else if (roleParam === "company") {
        setLoginRole("company")
      } else if (roleParam === "student") {
        setLoginRole("student")
      }
    }
  }, [])

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isLoading) return

    setIsLoading(true)

    try {
      // 1. Authenticate user via Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        toast.error(authError.message || "Invalid email or password.")
        setIsLoading(false)
        return
      }

      if (!authData?.user) {
        toast.error("Authentication failed. No user found.")
        setIsLoading(false)
        return
      }

      // 2. Fetch profile from 'profiles' table to check the role
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", authData.user.id)
        .single()

      if (profileError || !profileData) {
        toast.error("Failed to retrieve user profile.")
        await supabase.auth.signOut()
        setIsLoading(false)
        return
      }

      const dbRole = profileData.role

      // 3. Verify user matches their selected login portal selection
      if (loginRole === "admin" && dbRole !== "admin") {
        toast.error("Access Denied: Admin authorization required.")
        await supabase.auth.signOut()
        setIsLoading(false)
        return
      }

      if (loginRole !== "admin" && dbRole === "admin") {
        toast.error("Access Denied: Admin users must log in via the Admin selector.")
        await supabase.auth.signOut()
        setIsLoading(false)
        return
      }

      toast.success("Login successful. Redirecting...")

      if (dbRole === "student") {
        router.push("/dashboard")
      } else if (dbRole === "company") {
        router.push("/company/dashboard")
      } else if (dbRole === "admin") {
        router.push("/admin/dashboard")
      } else {
        toast.error(`Unknown user role: ${dbRole}`)
        setIsLoading(false)
      }
    } catch (err) {
      toast.error("An unexpected error occurred during login.")
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (err: any) {
      toast.error("Google authentication failed: " + err.message)
    }
  }

  const isAdminMode = loginRole === "admin"

  return (
    <div className={`flex min-h-screen transition-colors duration-300 font-sans ${
      isAdminMode ? "bg-slate-900 text-slate-100" : "bg-[#f8fafc] text-slate-900"
    }`}>
      {/* Left panel - Hero section (Hidden on mobile) */}
      <div className={`hidden lg:flex w-1/2 flex-col justify-between p-16 text-white transition-all duration-300 ${
        isAdminMode 
          ? "bg-gradient-to-tr from-slate-950 to-slate-800" 
          : "bg-gradient-to-tr from-[#164e9e] to-[#2563eb]"
      }`}>
        <div className="flex items-center space-x-[1px]">
          <span className="text-3xl font-extrabold tracking-tight text-white">t</span>
          <span className={`text-3xl font-extrabold tracking-tight ${isAdminMode ? "text-slate-400" : "text-blue-200"}`}>o</span>
          <span className="text-3xl font-extrabold tracking-tight text-white">oplo</span>
        </div>
        
        <div className="space-y-6">
          <h2 className="text-5xl font-extrabold tracking-tight leading-tight">
            {isAdminMode ? "Admin Portal." : "Hire Smart."}<br />
            {isAdminMode ? "Secure Access." : "Hire Verified."}
          </h2>
          <p className={`text-lg max-w-md font-medium ${isAdminMode ? "text-slate-400" : "text-blue-100"}`}>
            {isAdminMode 
              ? "Internal administrative dashboard for verified database operations."
              : "Nagpur's trust-first hiring partner for skilled and semi-skilled talent."
            }
          </p>
        </div>

        <div className={`text-sm font-medium ${isAdminMode ? "text-slate-600" : "text-blue-200"}`}>
          © {new Date().getFullYear()} Tooplo. All rights reserved.
        </div>
      </div>

      {/* Right panel - Login form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12">
        <div className={`w-full max-w-[420px] rounded-2xl border transition-all duration-300 p-8 sm:p-10 shadow-xl ${
          isAdminMode 
            ? "bg-slate-950 border-slate-800" 
            : "bg-white border-slate-100"
        }`}>
          
          {/* Logo & Header */}
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="flex items-baseline space-x-[1px]">
              <span className={`text-4xl font-extrabold tracking-tight ${isAdminMode ? "text-white" : "text-slate-800"}`}>t</span>
              <span className={`text-4xl font-extrabold tracking-tight ${isAdminMode ? "text-[#3b82f6]" : "text-[#1b59c4]"}`}>o</span>
              <span className={`text-4xl font-extrabold tracking-tight ${isAdminMode ? "text-white" : "text-slate-800"}`}>oplo</span>
              {isAdminMode && (
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                  admin
                </span>
              )}
            </div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-2">
              {isAdminMode ? "Authorized access only" : "Hire Smart. Hire Verified."}
            </p>
          </div>

          {/* Role selector cards */}
          <div className="space-y-1.5 mb-6">
            <span className={`text-xs font-bold tracking-wide ${isAdminMode ? "text-slate-400" : "text-slate-700"}`}>
              I want to sign in as a:
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setLoginRole("student")}
                className={`p-2.5 text-center border rounded-xl flex flex-col items-center justify-center transition-all ${
                  loginRole === "student"
                    ? "border-[#1b59c4] bg-blue-50/40 ring-1 ring-[#1b59c4] dark:border-[#3b82f6] dark:bg-blue-950/20 dark:ring-[#3b82f6]"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-transparent"
                }`}
              >
                <span className={`text-[11px] font-bold ${
                  loginRole === "student" 
                    ? "text-[#1b59c4] dark:text-blue-400" 
                    : "text-slate-600 dark:text-slate-400"
                }`}>
                  Student
                </span>
              </button>

              <button
                type="button"
                onClick={() => setLoginRole("company")}
                className={`p-2.5 text-center border rounded-xl flex flex-col items-center justify-center transition-all ${
                  loginRole === "company"
                    ? "border-[#1b59c4] bg-blue-50/40 ring-1 ring-[#1b59c4] dark:border-[#3b82f6] dark:bg-blue-950/20 dark:ring-[#3b82f6]"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-transparent"
                }`}
              >
                <span className={`text-[11px] font-bold ${
                  loginRole === "company" 
                    ? "text-[#1b59c4] dark:text-blue-400" 
                    : "text-slate-600 dark:text-slate-400"
                }`}>
                  Employer
                </span>
              </button>

              <button
                type="button"
                onClick={() => setLoginRole("admin")}
                className={`p-2.5 text-center border rounded-xl flex flex-col items-center justify-center transition-all ${
                  loginRole === "admin"
                    ? "border-[#3b82f6] bg-blue-950/20 ring-1 ring-[#3b82f6]"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-transparent"
                }`}
              >
                <span className={`text-[11px] font-bold ${
                  loginRole === "admin" 
                    ? "text-[#3b82f6]" 
                    : "text-slate-600 dark:text-slate-400"
                }`}>
                  Admin
                </span>
              </button>
            </div>
          </div>

          {/* Google Sign-in (Hidden for admin role) */}
          {!isAdminMode && (
            <>
              <button
                onClick={handleGoogleLogin}
                type="button"
                className="w-full h-11 flex items-center justify-center border border-slate-200 rounded-lg bg-white text-slate-700 hover:bg-slate-50 transition-colors text-sm font-semibold mb-5 shadow-sm"
              >
                <svg className="w-5 h-5 mr-2.5" viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </button>

              <div className="flex items-center my-4">
                <div className="flex-grow border-t border-slate-150"></div>
                <span className="px-3 text-xs text-slate-400 font-semibold uppercase tracking-wider">or sign in with email</span>
                <div className="flex-grow border-t border-slate-150"></div>
              </div>
            </>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className={`text-xs font-bold tracking-wide ${isAdminMode ? "text-slate-400" : "text-slate-700"}`}
              >
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder={isAdminMode ? "admin@tooplo.com" : "name@example.com"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className={`h-11 rounded-lg border-slate-200 text-sm transition-all ${
                  isAdminMode 
                    ? "border-slate-800 bg-slate-900 text-white placeholder:text-slate-600 focus:border-blue-500 focus:ring-blue-500" 
                    : "bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-[#1b59c4] focus:ring-[#1b59c4]"
                }`}
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className={`text-xs font-bold tracking-wide ${isAdminMode ? "text-slate-400" : "text-slate-700"}`}
              >
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className={`h-11 rounded-lg border-slate-200 text-sm transition-all ${
                  isAdminMode 
                    ? "border-slate-800 bg-slate-900 text-white placeholder:text-slate-600 focus:border-blue-500 focus:ring-blue-500" 
                    : "bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-[#1b59c4] focus:ring-[#1b59c4]"
                }`}
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className={`w-full h-11 rounded-lg text-sm font-semibold tracking-wide shadow-md transition-all duration-150 ${
                isAdminMode 
                  ? "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/20" 
                  : "bg-[#1b59c4] text-white hover:bg-[#15469c] shadow-blue-500/10"
              }`}
            >
              {isLoading ? "Signing In..." : (isAdminMode ? "Admin Access" : "Sign In")}
            </Button>
          </form>

          {/* Toggle Screen (Hidden for admin role) */}
          {!isAdminMode && (
            <div className="mt-6 text-center text-xs text-slate-500">
              Don't have an account?{" "}
              <Link href="/register" className="text-[#1b59c4] font-bold hover:underline">
                Sign Up
              </Link>
            </div>
          )}

          {/* Subtext */}
          <div className={`mt-8 text-center text-xs ${isAdminMode ? "text-slate-600" : "text-slate-400"}`}>
            {isAdminMode ? "Internal control panel" : "Nagpur's trust-first hiring partner"}
          </div>
        </div>
      </div>
    </div>
  )
}
