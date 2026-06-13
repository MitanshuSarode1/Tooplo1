"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Trash2, 
  Plus, 
  Search, 
  ArrowLeft,
  Users,
  ChevronRight
} from "lucide-react"
import Link from "next/link"

interface Job {
  id: string
  company: string
  title: string
  created_at: string
  // Derived fields
  location: string
  salary: string
  skillsRequired: string[]
  applicantCount: number
}

export default function CompanyJobsPage() {
  const router = useRouter()
  const supabase = createClient()

  const [jobs, setJobs] = React.useState<Job[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [deletingId, setDeletingId] = React.useState<string | null>(null)

  const fetchJobs = React.useCallback(async () => {
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

      // 3. Fetch all jobs for this company
      const { data: jobsData, error: jobsError } = await supabase
        .from("jobs")
        .select("id, company, title, created_at")
        .eq("company", user.id)
        .order("created_at", { ascending: false })

      if (jobsError) throw jobsError

      if (jobsData && jobsData.length > 0) {
        // 4. Fetch applications to count applicants per job
        const jobIds = jobsData.map(j => j.id)
        const { data: appsData, error: appsError } = await supabase
          .from("applications")
          .select("job_id")
          .in("job_id", jobIds)

        if (appsError) throw appsError

        // Group applications by job_id
        const appCounts = new Map<string, number>()
        appsData?.forEach(app => {
          if (app.job_id) {
            appCounts.set(app.job_id, (appCounts.get(app.job_id) || 0) + 1)
          }
        })

        // 5. Map derived details
        const mappedJobs: Job[] = jobsData.map(job => {
          const titleLower = job.title.toLowerCase()
          
          let location = "Nagpur (On-site)"
          let salary = "₹3,00,000 - ₹5,00,000 / year"
          let skillsRequired: string[] = ["JavaScript", "SQL"]

          if (titleLower.includes("engineer") || titleLower.includes("developer") || titleLower.includes("frontend") || titleLower.includes("software")) {
            location = titleLower.includes("frontend") || titleLower.includes("remote") ? "Remote" : "Nagpur (Hybrid)"
            salary = "₹4,50,000 - ₹7,00,000 / year"
            skillsRequired = ["React", "TypeScript", "Node.js", "Git"]
          } else if (titleLower.includes("analyst") || titleLower.includes("data") || titleLower.includes("finance")) {
            location = "Nagpur (On-site)"
            salary = "₹3,50,000 - ₹5,50,000 / year"
            skillsRequired = ["SQL", "Excel", "Python", "Data Analysis"]
          }

          return {
            id: job.id,
            company: job.company,
            title: job.title,
            created_at: job.created_at,
            location,
            salary,
            skillsRequired,
            applicantCount: appCounts.get(job.id) || 0
          }
        })

        setJobs(mappedJobs)
      } else {
        setJobs([])
      }
    } catch (err: any) {
      toast.error("Failed to load your jobs listings: " + err.message)
    } finally {
      setIsLoading(false)
    }
  }, [supabase, router])

  React.useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  const handleDeleteJob = async (jobId: string, jobTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete the job posting "${jobTitle}"? This will delete all student applications for this job.`)) {
      return
    }

    setDeletingId(jobId)
    try {
      const { error } = await supabase
        .from("jobs")
        .delete()
        .eq("id", jobId)

      if (error) throw error

      setJobs(prev => prev.filter(j => j.id !== jobId))
      toast.success(`Job "${jobTitle}" deleted successfully.`)
    } catch (err: any) {
      toast.error("Failed to delete job: " + err.message)
    } finally {
      setDeletingId(null)
    }
  }

  const filteredJobs = jobs.filter(j => 
    j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.skillsRequired.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1B3FA0] border-t-transparent"></div>
        <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Loading Jobs...</p>
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
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#1A1A2E] tracking-tight">Active Job Postings</h2>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">Manage your active opportunities and view application metrics.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search bar */}
          <div className="relative w-full sm:w-[220px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search title or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 bg-white text-xs placeholder:text-slate-400 rounded-xl focus:outline-none focus:border-[#1B3FA0] transition-colors"
            />
          </div>

          {/* Post New Job Button */}
          <Link href="/company/jobs/new">
            <Button className="w-full h-9 rounded-xl bg-[#1B3FA0] hover:bg-[#163482] text-white font-bold text-xs tracking-wide flex items-center justify-center px-4 shadow-sm">
              <Plus className="w-4 h-4 mr-1.5" />
              Post New Job
            </Button>
          </Link>
        </div>
      </div>

      {filteredJobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-150 text-center space-y-3 shadow-sm">
          <div className="p-3 bg-slate-50 rounded-full text-slate-400 border border-slate-100">
            <Briefcase className="w-8 h-8" />
          </div>
          <p className="font-bold text-slate-800 text-sm">No job postings found</p>
          <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
            Create your first job listing to start receiving student applications.
          </p>
          <Link href="/company/jobs/new" className="pt-2">
            <Button className="h-9 rounded-lg bg-[#1B3FA0] text-white hover:bg-[#163482] text-xs font-bold px-4">
              Post New Job
            </Button>
          </Link>
        </div>
      ) : (
        /* Jobs List */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredJobs.map((job) => (
            <div 
              key={job.id} 
              className="bg-white rounded-2xl border border-slate-150 p-6 flex flex-col justify-between hover:shadow-md hover:border-slate-200 transition-all gap-5"
            >
              <div className="space-y-3.5">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-base tracking-tight leading-snug">{job.title}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                      Posted {new Date(job.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                  
                  {/* Applicants Count Badge */}
                  <span className="flex-shrink-0 inline-flex items-center px-2 py-1 rounded bg-blue-50 text-[#1B3FA0] text-[10px] font-extrabold border border-blue-100/50">
                    <Users className="w-3.5 h-3.5 mr-1 text-[#2563EB]" />
                    {job.applicantCount} {job.applicantCount === 1 ? "Applicant" : "Applicants"}
                  </span>
                </div>

                {/* Metadata */}
                <div className="flex flex-wrap gap-4 text-[11px] text-slate-400 font-semibold">
                  <span className="flex items-center">
                    <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    {job.location}
                  </span>
                  <span className="flex items-center">
                    <DollarSign className="w-3.5 h-3.5 mr-0.5 text-slate-400" />
                    {job.salary}
                  </span>
                </div>

                {/* Skills Template info */}
                <div className="space-y-1">
                  <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Derived Match Skills</p>
                  <div className="flex flex-wrap gap-1">
                    {job.skillsRequired.map((skill) => (
                      <span 
                        key={skill} 
                        className="inline-block px-2 py-0.5 rounded text-[9px] font-bold bg-slate-50 text-slate-500 border border-slate-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-50 flex items-center justify-between gap-4">
                <Button
                  onClick={() => handleDeleteJob(job.id, job.title)}
                  disabled={deletingId === job.id}
                  className="h-8 px-3 rounded-lg bg-white border border-rose-100 hover:bg-rose-50 text-rose-600 hover:text-rose-700 font-bold text-xs flex items-center transition-colors shadow-sm"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                  Delete
                </Button>

                <Link href="/company/candidates">
                  <Button
                    className="h-8 px-3 rounded-lg bg-blue-50/50 hover:bg-blue-50 text-[#1B3FA0] border border-blue-100/50 font-bold text-xs tracking-wide flex items-center transition-all"
                  >
                    View Candidates
                    <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
