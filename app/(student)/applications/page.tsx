"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Calendar, Briefcase, Sparkles, ArrowRight } from "lucide-react"
import Link from "next/link"

interface Application {
  id: string
  company_name: string
  job_title: string
  applied_date: string
  ai_match_score: number
  status: "Applied" | "Shortlisted" | "Interview" | "Rejected" | string
}

export default function ApplicationsPage() {
  const router = useRouter()
  const supabase = createClient()

  const [applications, setApplications] = React.useState<Application[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  const loadApplications = React.useCallback(async () => {
    try {
      // 1. Get Session User
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        router.push("/login")
        return
      }

      // 2. Role Guard
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

      if (!profile || profile.role !== "student") {
        router.push("/login")
        return
      }

      // 3. Fetch applications matching student_id
      const { data: appsData, error: appsError } = await supabase
        .from("applications")
        .select("id, company_name, job_title, applied_date, ai_match_score, status")
        .eq("student_id", user.id)
        .order("applied_date", { ascending: false })

      if (appsError) throw appsError
      setApplications(appsData || [])
    } catch (err: any) {
      toast.error("Failed to load your applications.")
    } finally {
      setIsLoading(false)
    }
  }, [supabase, router])

  React.useEffect(() => {
    loadApplications()
  }, [loadApplications])

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "Applied":
        return "bg-blue-50 text-[#2563EB] ring-1 ring-blue-100/50"
      case "Shortlisted":
        return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100/50"
      case "Interview":
        return "bg-purple-50 text-purple-700 ring-1 ring-purple-100/50"
      case "Rejected":
        return "bg-rose-50 text-rose-700 ring-1 ring-rose-100/50"
      default:
        return "bg-slate-50 text-slate-700 ring-1 ring-slate-100/50"
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1B3FA0] border-t-transparent"></div>
        <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Loading Applications...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">Your Applications</h2>
        <p className="text-xs text-slate-400 font-semibold mt-0.5">Track the status updates of your submitted job profiles in real-time.</p>
      </div>

      {applications.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-150 text-center space-y-4 shadow-sm">
          <div className="p-3 bg-slate-50 rounded-full text-slate-400 border border-slate-100">
            <Briefcase className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <p className="font-bold text-slate-800 text-sm">No applications submitted yet</p>
            <p className="text-xs text-slate-400 max-w-xs leading-relaxed mx-auto">
              You haven't applied to any job openings yet. Start exploring active jobs and submit your profile today!
            </p>
          </div>
          <Link href="/jobs">
            <Button className="h-10 px-5 rounded-lg bg-[#1B3FA0] hover:bg-[#163482] text-white font-bold text-xs tracking-wide flex items-center shadow-sm">
              Browse Available Jobs
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </Link>
        </div>
      ) : (
        /* Applications Table */
        <div className="bg-white rounded-2xl border border-slate-150 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-150 bg-slate-50/50 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                  <th className="p-4">Employer Details</th>
                  <th className="p-4">Applied Date</th>
                  <th className="p-4 text-center">AI Match Score</th>
                  <th className="p-4">Process Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="p-4">
                      <p className="text-[#1B3FA0] text-sm font-bold">{app.job_title}</p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mt-0.5">{app.company_name}</p>
                    </td>
                    <td className="p-4 text-slate-400 font-semibold">
                      <span className="flex items-center">
                        <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-400 flex-shrink-0" />
                        {new Date(app.applied_date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center justify-center px-2 py-0.5 rounded bg-blue-50 text-[#2563EB] text-[10px] font-extrabold border border-blue-100">
                        <Sparkles className="w-3.5 h-3.5 mr-1" />
                        {app.ai_match_score || 0}%
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getStatusBadgeStyle(app.status)}`}>
                        {app.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
