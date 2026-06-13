"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { 
  ArrowLeft,
  Sparkles,
  Briefcase,
  AlertCircle
} from "lucide-react"
import Link from "next/link"

const ROLE_SUGGESTIONS = [
  "Junior Software Engineer",
  "Associate Data Analyst",
  "Junior Frontend Developer",
  "Software Engineer",
  "Data Analyst",
  "Frontend Developer",
  "Backend Engineer",
  "Full Stack Developer"
]

export default function PostJobPage() {
  const router = useRouter()
  const supabase = createClient()

  const [jobTitle, setJobTitle] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isVerifying, setIsVerifying] = React.useState(true)

  React.useEffect(() => {
    const verifyUser = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
          router.push("/login")
          return
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single()

        if (!profile || profile.role !== "company") {
          router.push("/login")
          return
        }
      } catch (err) {
        toast.error("Auth check failed.")
        router.push("/login")
      } finally {
        setIsVerifying(false)
      }
    }
    verifyUser()
  }, [supabase, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!jobTitle.trim()) {
      toast.error("Please enter a valid job title.")
      return
    }

    setIsSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error("Session expired. Please log in.")
        router.push("/login")
        return
      }

      const { error } = await supabase
        .from("jobs")
        .insert({
          company: user.id, // inserts the company UUID as text
          title: jobTitle.trim()
        })

      if (error) throw error

      toast.success(`Job "${jobTitle}" posted successfully!`)
      router.push("/company/jobs")
    } catch (err: any) {
      toast.error("Failed to post job: " + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isVerifying) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1B3FA0] border-t-transparent"></div>
        <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Checking Auth...</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* Back to Jobs List */}
      <Link href="/company/jobs" className="inline-flex items-center text-xs font-bold text-[#1B3FA0] hover:underline uppercase tracking-wide">
        <ArrowLeft className="w-4 h-4 mr-1.5" />
        Back to Jobs List
      </Link>

      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-extrabold text-[#1A1A2E] tracking-tight">Post a New Job</h2>
        <p className="text-xs text-slate-400 font-semibold">Publish local Nagpur roles for verified candidates.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-150 p-6 sm:p-8 shadow-sm space-y-6">
        
        {/* Info Banner explaining Dynamic Matching */}
        <div className="bg-blue-50/50 rounded-xl border border-blue-100/40 p-4 flex gap-3.5">
          <Sparkles className="w-5 h-5 text-[#2563EB] flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-[#1B3FA0]">Dynamic AI Matching</h4>
            <p className="text-[10px] text-[#2563EB]/80 font-medium leading-relaxed">
              Tooplo automatically generates matching profiles (description, salary range, location, and key skills) based on keywords in your Job Title. This ensures standardized AI Match Scoring against verified candidate profiles.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Job Title Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Job Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Junior Software Engineer"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 bg-white text-xs placeholder:text-slate-400 rounded-xl focus:outline-none focus:border-[#1B3FA0] transition-colors"
            />
          </div>

          {/* Role Suggestions */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
              Quick Role Suggestions
            </span>
            <div className="flex flex-wrap gap-2">
              {ROLE_SUGGESTIONS.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setJobTitle(role)}
                  className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold transition-all ${
                    jobTitle === role
                      ? "bg-blue-50 text-[#1B3FA0] border-blue-200"
                      : "bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* Action button */}
          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting || !jobTitle.trim()}
              className="h-10 px-6 rounded-xl bg-[#1B3FA0] hover:bg-[#163482] text-white font-bold text-xs tracking-wide shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? "Publishing..." : "Publish Job Post"}
            </Button>
          </div>
        </form>

      </div>
    </div>
  )
}
