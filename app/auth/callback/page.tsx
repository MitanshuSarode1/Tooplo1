"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { toast } from "sonner"

export default function AuthCallbackPage() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const processAuthCallback = async () => {
      try {
        // Fetch session to check if user successfully logged in
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) throw sessionError
        
        if (!session) {
          toast.error("No active authentication session found.")
          router.push("/login")
          return
        }

        const user = session.user

        // Query the profile role
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single()

        if (profileError || !profile) {
          // If no profile exists (e.g. first-time Google sign-up), redirect them to register or dashboard to select a role.
          // By default, we redirect to register so they select a role, or we can auto-create a student profile.
          // For now, redirect to a role selection setup or standard dashboard.
          toast.success("Signed in with Google! Please complete your profile.")
          router.push("/register")
          return
        }

        toast.success("Successfully authenticated!")
        const role = profile.role
        
        if (role === "student") {
          router.push("/dashboard")
        } else if (role === "company") {
          router.push("/company/dashboard")
        } else if (role === "admin") {
          router.push("/admin/dashboard")
        } else {
          router.push("/login")
        }
      } catch (err: any) {
        toast.error("Authentication callback error: " + (err.message || err))
        router.push("/login")
      }
    }

    processAuthCallback()
  }, [router, supabase])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 text-slate-900 font-sans">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1b59c4] border-t-transparent"></div>
        <p className="text-sm font-semibold tracking-wide text-slate-500 uppercase">Completing authentication...</p>
      </div>
    </div>
  )
}
