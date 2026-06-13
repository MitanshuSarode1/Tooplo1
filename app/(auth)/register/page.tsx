"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import Link from "next/link"

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [role, setRole] = React.useState<"student" | "company">("student")
  const [isLoading, setIsLoading] = React.useState(false)

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isLoading) return

    setIsLoading(true)

    try {
      // 1. Sign up the user in Supabase Auth
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      })

      if (signUpError) {
        toast.error(signUpError.message || "Failed to create account.")
        setIsLoading(false)
        return
      }

      if (!signUpData?.user) {
        toast.error("Registration failed. Please try again.")
        setIsLoading(false)
        return
      }

      // 2. Create the profile record in the public profiles table
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: signUpData.user.id,
          email: signUpData.user.email || email,
          role: role,
          is_verified: false,
        })

      if (profileError) {
        toast.error("Failed to initialize user profile: " + profileError.message)
        setIsLoading(false)
        return
      }

      toast.success("Account created! Please check your email for a verification link.")
      router.push("/login")
    } catch (err) {
      toast.error("An unexpected error occurred during registration.")
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

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-900 font-sans">
      {/* Left panel - Hero section (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between bg-gradient-to-tr from-[#164e9e] to-[#2563eb] p-16 text-white">
        <div className="flex items-center space-x-[1px]">
          <span className="text-3xl font-extrabold tracking-tight text-white">t</span>
          <span className="text-3xl font-extrabold tracking-tight text-blue-200">o</span>
          <span className="text-3xl font-extrabold tracking-tight text-white">oplo</span>
        </div>
        
        <div className="space-y-6">
          <h2 className="text-5xl font-extrabold tracking-tight leading-tight">
            Join Tooplo.<br />Get Verified.
          </h2>
          <p className="text-lg text-blue-100 max-w-md font-medium">
            Nagpur's trust-first hiring partner connecting verified students with top local employers.
          </p>
        </div>

        <div className="text-sm text-blue-200 font-medium">
          © {new Date().getFullYear()} Tooplo. All rights reserved.
        </div>
      </div>

      {/* Right panel - Registration form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-[440px] bg-white rounded-2xl border border-slate-100 shadow-xl p-8 sm:p-10">
          
          {/* Logo & Header */}
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="flex items-baseline space-x-[1px]">
              <span className="text-4xl font-extrabold text-slate-800 tracking-tight">t</span>
              <span className="text-4xl font-extrabold text-[#1b59c4] tracking-tight">o</span>
              <span className="text-4xl font-extrabold text-slate-800 tracking-tight">oplo</span>
            </div>
            <h3 className="text-lg font-bold text-slate-800 mt-3">Create your account</h3>
            <p className="text-xs text-slate-400 mt-1">Start hiring or getting hired today.</p>
          </div>

          {/* Google Sign-up */}
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
            <span className="px-3 text-xs text-slate-400 font-semibold uppercase tracking-wider">or sign up with email</span>
            <div className="flex-grow border-t border-slate-150"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-5">
            {/* Role Cards */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-700 tracking-wide">I want to join as a:</span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("student")}
                  className={`p-3 text-left border rounded-xl flex flex-col justify-between transition-all ${
                    role === "student"
                      ? "border-[#1b59c4] bg-blue-50/40 ring-1 ring-[#1b59c4]"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <span className={`text-xs font-bold ${role === "student" ? "text-[#1b59c4]" : "text-slate-700"}`}>
                    Student / Candidate
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1 leading-tight">Apply for local verified jobs</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole("company")}
                  className={`p-3 text-left border rounded-xl flex flex-col justify-between transition-all ${
                    role === "company"
                      ? "border-[#1b59c4] bg-blue-50/40 ring-1 ring-[#1b59c4]"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <span className={`text-xs font-bold ${role === "company" ? "text-[#1b59c4]" : "text-slate-700"}`}>
                    Employer / Partner
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1 leading-tight">Hire pre-screened talent</span>
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="text-xs font-bold text-slate-700 tracking-wide"
              >
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="h-11 rounded-lg border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-[#1b59c4] focus:ring-[#1b59c4] transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="text-xs font-bold text-slate-700 tracking-wide"
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
                className="h-11 rounded-lg border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-[#1b59c4] focus:ring-[#1b59c4] transition-all"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 rounded-lg bg-[#1b59c4] text-white hover:bg-[#15469c] active:scale-[0.98] transition-all duration-150 text-sm font-semibold tracking-wide shadow-md shadow-blue-500/10"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          {/* Toggle Screen */}
          <div className="mt-6 text-center text-xs text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="text-[#1b59c4] font-bold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
