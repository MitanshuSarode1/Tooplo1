"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { 
  Search, 
  MapPin, 
  DollarSign, 
  CheckCircle2, 
  Sparkles, 
  Briefcase, 
  ArrowRight,
  GraduationCap
} from "lucide-react"

interface Job {
  id: string
  company: string
  title: string
  created_at: string
  // Dynamically populated fields
  companyName: string
  description: string
  location: string
  salary: string
  skillsRequired: string[]
  matchScore: number
  hasApplied: boolean
}

export default function JobsPage() {
  const router = useRouter()
  const supabase = createClient()

  const [jobs, setJobs] = React.useState<Job[]>([])
  const [studentSkills, setStudentSkills] = React.useState<string[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [applyingId, setApplyingId] = React.useState<string | null>(null)

  const loadData = React.useCallback(async () => {
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

      // 3. Fetch Student Skills to calculate Match Score
      const { data: student } = await supabase
        .from("students")
        .select("skills")
        .eq("id", user.id)
        .single()

      const skillsList = student?.skills || []
      setStudentSkills(skillsList)

      // 4. Fetch all jobs
      const { data: jobsData, error: jobsError } = await supabase
        .from("jobs")
        .select("id, company, title, created_at")
        .order("created_at", { ascending: false })

      if (jobsError) throw jobsError

      // 5. Fetch existing student applications to mark already applied status
      const { data: appsData } = await supabase
        .from("applications")
        .select("job_id")
        .eq("student_id", user.id)

      const appliedJobIds = new Set(appsData?.map(app => app.job_id) || [])

      if (jobsData && jobsData.length > 0) {
        const companyIds = jobsData.map(j => j.company)

        // 6. Fetch company profiles for mapping
        const { data: companiesData } = await supabase
          .from("companies")
          .select("id, company_name")
          .in("id", companyIds)

        const companiesMap = new Map(companiesData?.map(c => [c.id, c.company_name]) || [])

        // 7. Map rich fields dynamically
        const richJobs: Job[] = jobsData.map(job => {
          const companyName = companiesMap.get(job.company) || "Tooplo Partner"
          const titleLower = job.title.toLowerCase()

          // Dynamic details based on job title
          let location = "Nagpur (On-site)"
          let salary = "₹3,00,000 - ₹5,00,000 / year"
          let description = "Great opportunity for Nagpur candidates to join a fast-growing team. Work closely with product and technology divisions to deliver scalable features."
          let skillsRequired: string[] = ["JavaScript", "SQL"]

          if (titleLower.includes("engineer") || titleLower.includes("developer") || titleLower.includes("frontend") || titleLower.includes("software")) {
            location = titleLower.includes("frontend") || titleLower.includes("remote") ? "Remote" : "Nagpur (Hybrid)"
            salary = "₹4,50,000 - ₹7,00,000 / year"
            description = "We are seeking a developer to construct clean, modular user interfaces and backend integrations. You will write clean code, execute units tests, and participate in code reviews."
            skillsRequired = ["React", "TypeScript", "Node.js", "Git"]
          } else if (titleLower.includes("analyst") || titleLower.includes("data") || titleLower.includes("finance")) {
            location = "Nagpur (On-site)"
            salary = "₹3,50,000 - ₹5,50,000 / year"
            description = "Responsible for building data pipelines, analyzing user metrics, and presenting business logic audits. Must be analytical and proficient with spreadsheets."
            skillsRequired = ["SQL", "Excel", "Python", "Data Analysis"]
          }

          // Calculate AI Match Score based on skills overlap
          const matchedSkills = skillsRequired.filter(s => 
            skillsList.some((ss: string) => ss.toLowerCase() === s.toLowerCase())
          )
          
          let matchScore = 60 // Base match
          if (skillsRequired.length > 0) {
            const ratio = matchedSkills.length / skillsRequired.length
            matchScore = Math.round(60 + (ratio * 35)) // Maps to 60-95%
          }

          return {
            id: job.id,
            company: job.company,
            title: job.title,
            created_at: job.created_at,
            companyName,
            location,
            salary,
            description,
            skillsRequired,
            matchScore,
            hasApplied: appliedJobIds.has(job.id)
          }
        })

        setJobs(richJobs)
      } else {
        setJobs([])
      }

    } catch (err: any) {
      toast.error("Failed to load jobs list.")
    } finally {
      setIsLoading(false)
    }
  }, [supabase, router])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  // Submit Application
  const handleApply = async (job: Job) => {
    setApplyingId(job.id)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error("Session expired. Please log in.")
        return
      }

      // Insert into applications table
      const { error } = await supabase
        .from("applications")
        .insert({
          student_id: user.id,
          job_id: job.id,
          company_id: job.company,
          company_name: job.companyName,
          job_title: job.title,
          ai_match_score: job.matchScore,
          status: "Applied"
        })

      if (error) throw error

      toast.success(`Applied to "${job.title}" successfully!`)
      
      // Update UI state
      setJobs(prev => prev.map(j => j.id === job.id ? { ...j, hasApplied: true } : j))
    } catch (err: any) {
      toast.error("Failed to submit application: " + err.message)
    } finally {
      setApplyingId(null)
    }
  }

  const filteredJobs = jobs.filter(j => 
    j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">Browse Verified Jobs</h2>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">Explore local openings in Nagpur matched to your verified skills.</p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-[280px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search title, company, or skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 bg-white text-xs placeholder:text-slate-400 rounded-xl focus:outline-none focus:border-[#1B3FA0] transition-colors"
          />
        </div>
      </div>

      {filteredJobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-150 text-center space-y-3 shadow-sm">
          <div className="p-3 bg-slate-50 rounded-full text-slate-400 border border-slate-100">
            <Briefcase className="w-8 h-8" />
          </div>
          <p className="font-bold text-slate-800 text-sm">No jobs available right now</p>
          <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
            Active jobs will appear here once employers create postings. Please check back later!
          </p>
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
                {/* Header */}
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-base tracking-tight leading-snug">{job.title}</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">{job.companyName}</p>
                  </div>
                  
                  {/* AI Match Score */}
                  <span className="flex-shrink-0 inline-flex items-center px-2 py-1 rounded bg-blue-50 text-[#1B3FA0] text-[10px] font-extrabold border border-blue-100/50">
                    <Sparkles className="w-3 h-3 mr-1 text-[#2563EB]" />
                    {job.matchScore}% Match
                  </span>
                </div>

                <p className="text-xs text-slate-500 font-semibold leading-relaxed line-clamp-3">
                  {job.description}
                </p>

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

                {/* Required Skills */}
                <div className="space-y-1">
                  <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Required Skills</p>
                  <div className="flex flex-wrap gap-1">
                    {job.skillsRequired.map((skill) => {
                      const isMatched = studentSkills.some(ss => ss.toLowerCase() === skill.toLowerCase())
                      return (
                        <span 
                          key={skill} 
                          className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold border transition-colors ${
                            isMatched 
                              ? "bg-blue-50/50 text-[#1B3FA0] border-blue-100" 
                              : "bg-slate-50 text-slate-500 border-slate-200"
                          }`}
                        >
                          {skill}
                        </span>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2 border-t border-slate-50 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-semibold">
                  Posted {new Date(job.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>

                {job.hasApplied ? (
                  <Button 
                    disabled 
                    className="h-9 px-4 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold text-xs flex items-center"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-600" />
                    Applied
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleApply(job)}
                    disabled={applyingId === job.id}
                    className="h-9 px-4 rounded-lg bg-[#1B3FA0] hover:bg-[#163482] text-white font-bold text-xs tracking-wide flex items-center shadow-sm"
                  >
                    {applyingId === job.id ? "Applying..." : "Apply Now"}
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
