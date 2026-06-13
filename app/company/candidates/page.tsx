"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { 
  Users, 
  Calendar, 
  Search, 
  Check, 
  ChevronRight, 
  UserCheck, 
  ArrowLeft,
  GraduationCap
} from "lucide-react"
import Link from "next/link"

interface CandidateApplication {
  id: string
  student_id: string
  candidate_name: string
  job_title: string
  applied_date: string
  skills: string[]
  ai_match_score: number
  status: "Applied" | "Shortlisted" | "Interview" | "Rejected" | string
}

export default function CompanyCandidatesPage() {
  const router = useRouter()
  const supabase = createClient()

  const [applications, setApplications] = React.useState<CandidateApplication[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [updatingId, setUpdatingId] = React.useState<string | null>(null)

  const fetchCandidates = React.useCallback(async () => {
    try {
      // 1. Get authenticated user
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

      if (!profile || profile.role !== "company") {
        router.push("/login")
        return
      }

      // 3. Fetch applications matching company_id
      const { data: appsData, error: appsError } = await supabase
        .from("applications")
        .select("id, student_id, job_title, applied_date, ai_match_score, status")
        .eq("company_id", user.id)
        .order("applied_date", { ascending: false })

      if (appsError) throw appsError

      if (appsData && appsData.length > 0) {
        const studentIds = appsData.map((app) => app.student_id)
        
        // Fetch matching student profiles
        const { data: studentsData } = await supabase
          .from("students")
          .select("id, name, skills")
          .in("id", studentIds)

        const studentsMap = new Map(
          studentsData?.map((s) => [s.id, s]) || []
        )

        const mappedApps = appsData.map((app) => {
          const student = studentsMap.get(app.student_id)
          return {
            id: app.id,
            student_id: app.student_id,
            candidate_name: student?.name || "Anonymous Candidate",
            job_title: app.job_title,
            applied_date: app.applied_date,
            skills: student?.skills || [],
            ai_match_score: Number(app.ai_match_score) || 0,
            status: app.status,
          }
        })
        setApplications(mappedApps)
      } else {
        setApplications([])
      }
    } catch (err: any) {
      toast.error("Failed to load candidate applications.")
    } finally {
      setIsLoading(false)
    }
  }, [supabase, router])

  React.useEffect(() => {
    fetchCandidates()
  }, [fetchCandidates])

  // Update Application Status in Database
  const handleUpdateStatus = async (appId: string, newStatus: string) => {
    setUpdatingId(appId)
    try {
      const { error } = await supabase
        .from("applications")
        .update({ status: newStatus })
        .eq("id", appId)

      if (error) throw error

      setApplications(prev => prev.map(app => app.id === appId ? { ...app, status: newStatus } : app))
      toast.success(`Application status updated to ${newStatus}!`)
    } catch (err: any) {
      toast.error("Failed to update status: " + err.message)
    } finally {
      setUpdatingId(null)
    }
  }

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

  const filteredCandidates = applications.filter(c => 
    c.candidate_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1B3FA0] border-t-transparent"></div>
        <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Loading Candidates...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      
      {/* Back to Dashboard */}
      <Link href="/company/dashboard" className="inline-flex items-center text-xs font-bold text-[#1B3FA0] hover:underline uppercase tracking-wide">
        <ArrowLeft className="w-4 h-4 mr-1.5" />
        Back to Dashboard
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#1A1A2E] tracking-tight">Candidates Directory</h2>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">Filter, review resume cards, and manage applicant pipelines.</p>
        </div>

        {/* Search bar */}
        <div className="relative w-full sm:w-[280px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search name, job, or skill..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 bg-white text-xs placeholder:text-slate-400 rounded-xl focus:outline-none focus:border-[#1B3FA0] transition-colors"
          />
        </div>
      </div>

      {filteredCandidates.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-150 text-center space-y-3 shadow-sm">
          <div className="p-3 bg-slate-50 rounded-full text-slate-400 border border-slate-100">
            <Users className="w-8 h-8" />
          </div>
          <p className="font-bold text-slate-800 text-sm">No candidate matches found</p>
          <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
            Try adjusting your search criteria, or wait for student applications to be submitted.
          </p>
        </div>
      ) : (
        /* Candidates Pipeline List */
        <div className="grid grid-cols-1 gap-6">
          {filteredCandidates.map((candidate) => (
            <div 
              key={candidate.id} 
              className="bg-white rounded-2xl border border-slate-150 shadow-sm overflow-hidden flex flex-col md:flex-row justify-between p-6 gap-6 hover:shadow-md hover:border-slate-200 transition-all"
            >
              {/* Left Side: Candidate details */}
              <div className="space-y-4 flex-grow">
                <div className="flex flex-wrap items-baseline gap-2">
                  <h3 className="text-lg font-bold text-slate-800">{candidate.candidate_name}</h3>
                  <span className="inline-flex items-center text-xs text-slate-400 font-semibold uppercase tracking-wider">
                    applied for
                  </span>
                  <span className="text-xs font-bold text-[#1B3FA0] uppercase tracking-wider bg-blue-50 border border-blue-100/30 px-2 py-0.5 rounded">
                    {candidate.job_title}
                  </span>
                </div>

                <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-500">
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1.5 text-slate-400" />
                    Applied {new Date(candidate.applied_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                  <span className="flex items-center text-[#2563EB] bg-blue-50/50 px-2 py-0.5 rounded border border-blue-100/30">
                    <UserCheck className="w-3.5 h-3.5 mr-1" />
                    AI Match: {candidate.ai_match_score}%
                  </span>
                </div>

                {/* Skills section */}
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Candidate Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {candidate.skills.length === 0 ? (
                      <span className="text-xs text-slate-400 italic">No skills listed</span>
                    ) : (
                      candidate.skills.map((skill) => (
                        <span 
                          key={skill} 
                          className="inline-block px-2.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold border border-slate-150/55"
                        >
                          {skill}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Right Side: Status Management */}
              <div className="flex flex-col justify-between items-start md:items-end min-w-[200px] border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 gap-4">
                <div className="space-y-1 md:text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pipeline Status</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold mt-1 ${getStatusBadgeStyle(candidate.status)}`}>
                    {candidate.status}
                  </span>
                </div>

                {/* Transition Actions */}
                <div className="space-y-1.5 w-full">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Move Status To</p>
                  <div className="flex flex-wrap gap-1.5">
                    {candidate.status !== "Shortlisted" && (
                      <Button
                        onClick={() => handleUpdateStatus(candidate.id, "Shortlisted")}
                        disabled={updatingId === candidate.id}
                        className="h-7 rounded-lg text-[10px] font-bold px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-100/50"
                      >
                        Shortlist
                      </Button>
                    )}
                    {candidate.status !== "Interview" && (
                      <Button
                        onClick={() => handleUpdateStatus(candidate.id, "Interview")}
                        disabled={updatingId === candidate.id}
                        className="h-7 rounded-lg text-[10px] font-bold px-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-100/50"
                      >
                        Interview
                      </Button>
                    )}
                    {candidate.status !== "Rejected" && (
                      <Button
                        onClick={() => handleUpdateStatus(candidate.id, "Rejected")}
                        disabled={updatingId === candidate.id}
                        className="h-7 rounded-lg text-[10px] font-bold px-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-100/50"
                      >
                        Reject
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
