import * as React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import StatsCard from "./components/StatsCard"
import CandidatesTable, { Candidate } from "./components/CandidatesTable"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { 
  Briefcase, 
  FileText, 
  Clock, 
  Calendar, 
  Plus, 
  Users, 
  Settings, 
  ArrowRight,
  CheckCircle,
  AlertTriangle
} from "lucide-react"

export const dynamic = "force-dynamic"

export default async function EmployerDashboardPage() {
  const supabase = await createClient()

  // 1. Verify User Session
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect("/login")
  }

  // 2. Role Guard - Verify User is a Company (Employer)
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profileError || !profile || profile.role !== "company") {
    redirect("/login")
  }

  // 3. Fetch Company Profile Data
  const { data: company } = await supabase
    .from("companies")
    .select("company_name, is_verified, completion_percentage")
    .eq("id", user.id)
    .single()

  const companyName = company?.company_name || user.email?.split("@")[0] || "Employer"
  const isVerified = company?.is_verified ?? false
  const completionPercentage = company?.completion_percentage ?? 30

  // 4. Fetch Stats Data (using company_id = auth.uid())
  let activeJobsCount = 0
  let totalAppsCount = 0
  let pendingReviewsCount = 0
  let interviewsCount = 0

  try {
    const { count: jobsCount } = await supabase
      .from("jobs")
      .select("*", { count: "exact", head: true })
      .eq("company", user.id)
    if (jobsCount !== null) activeJobsCount = jobsCount
  } catch (err) {
    console.error("Error fetching jobs count:", err)
  }

  try {
    const { count: appsCount } = await supabase
      .from("applications")
      .select("*", { count: "exact", head: true })
      .eq("company_id", user.id)
    if (appsCount !== null) totalAppsCount = appsCount

    const { count: pendingCount } = await supabase
      .from("applications")
      .select("*", { count: "exact", head: true })
      .eq("company_id", user.id)
      .eq("status", "Applied")
    if (pendingCount !== null) pendingReviewsCount = pendingCount

    const { count: interviewCount } = await supabase
      .from("applications")
      .select("*", { count: "exact", head: true })
      .eq("company_id", user.id)
      .eq("status", "Interview")
    if (interviewCount !== null) interviewsCount = interviewCount
  } catch (err) {
    console.error("Error fetching applications stats:", err)
  }

  // 5. Fetch Recent Candidates (applications where company_id = auth.uid(), show last 5)
  let recentCandidates: Candidate[] = []
  try {
    const { data: appsData } = await supabase
      .from("applications")
      .select("id, student_id, job_title, applied_date, ai_match_score, status")
      .eq("company_id", user.id)
      .order("applied_date", { ascending: false })
      .limit(5)

    if (appsData && appsData.length > 0) {
      const studentIds = appsData.map((app) => app.student_id)
      
      const { data: studentsData } = await supabase
        .from("students")
        .select("id, name, skills")
        .in("id", studentIds)

      const studentsMap = new Map(
        studentsData?.map((s) => [s.id, s]) || []
      )

      recentCandidates = appsData.map((app) => {
        const student = studentsMap.get(app.student_id)
        return {
          id: app.id,
          candidate_name: student?.name || "Anonymous Candidate",
          job_title: app.job_title,
          applied_date: app.applied_date,
          skills: student?.skills || [],
          ai_match_score: Number(app.ai_match_score) || 0,
          status: app.status,
        }
      })
    }
  } catch (err) {
    console.error("Error fetching recent candidates:", err)
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* SECTION 1: WELCOME BANNER */}
      <div className="bg-white rounded-2xl border border-slate-150 p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-3.5">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A2E] tracking-tight">
              Welcome back, {companyName}
            </h1>
            
            {/* Verification Status Badge */}
            {isVerified ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-50/80 text-emerald-700 border border-emerald-100/50">
                <CheckCircle className="w-3.5 h-3.5 mr-1" />
                Verified
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-50/80 text-amber-700 border border-amber-100/50">
                <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                Pending Verification
              </span>
            )}
          </div>
          <p className="text-sm font-semibold text-slate-500 max-w-xl">
            Manage your local job postings, review qualified student candidates, and coordinate upcoming interviews from your central panel.
          </p>
        </div>

        {/* Profile Completion Card */}
        <div className="w-full lg:w-[320px] bg-slate-50 rounded-xl border border-slate-150 p-4 space-y-3.5">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-slate-500 uppercase tracking-wide">Profile Completion</span>
            <span className="text-[#1B3FA0]">{completionPercentage}%</span>
          </div>
          
          {/* Custom Responsive Progress Bar */}
          <div className="w-full bg-slate-200 rounded-full h-2.5">
            <div 
              className="bg-[#2563EB] h-2.5 rounded-full transition-all duration-500" 
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>

          {completionPercentage < 100 && (
            <Link href="/company/profile" className="block">
              <Button className="w-full h-9 rounded-lg bg-[#1B3FA0] text-white hover:bg-[#163482] text-xs font-bold tracking-wide">
                Complete Company Profile
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* SECTION 2: STATS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          title="Active Job Postings" 
          value={activeJobsCount} 
          description="Open listings" 
          icon={Briefcase} 
        />
        <StatsCard 
          title="Total Applications" 
          value={totalAppsCount} 
          description="Submissions received" 
          icon={FileText} 
        />
        <StatsCard 
          title="Pending Reviews" 
          value={pendingReviewsCount} 
          description="Requires screening" 
          icon={Clock} 
        />
        <StatsCard 
          title="Interviews Scheduled" 
          value={interviewsCount} 
          description="Upcoming sessions" 
          icon={Calendar} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* SECTION 3: RECENT CANDIDATES */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <h3 className="text-lg font-extrabold text-[#1A1A2E] tracking-tight">Recent Candidates</h3>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">Top student applicants matching your job requirements</p>
            </div>
            <Link href="/company/candidates" className="text-xs font-bold text-[#1B3FA0] hover:underline flex items-center">
              View all candidates
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          <CandidatesTable candidates={recentCandidates} />
        </div>

        {/* SECTION 4: QUICK ACTIONS */}
        <div className="space-y-4">
          <h3 className="text-lg font-extrabold text-[#1A1A2E] tracking-tight">Quick Actions</h3>
          
          <div className="bg-white rounded-2xl border border-slate-150 p-6 space-y-4 shadow-sm">
            <Link href="/company/jobs/new" className="block">
              <Button className="w-full h-12 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center justify-start px-4 text-slate-700 bg-white">
                <Plus className="w-5 h-5 mr-3 text-slate-400" />
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-800">Post New Job</p>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Create a listing for local students</p>
                </div>
              </Button>
            </Link>

            <Link href="/company/candidates" className="block">
              <Button className="w-full h-12 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center justify-start px-4 text-slate-700 bg-white">
                <Users className="w-5 h-5 mr-3 text-slate-400" />
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-800">View All Candidates</p>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Filter, search, and screen all resumes</p>
                </div>
              </Button>
            </Link>

            <Link href="/company/profile" className="block">
              <Button className="w-full h-12 rounded-xl bg-blue-50/50 hover:bg-blue-50 text-[#1B3FA0] border border-blue-100/50 transition-all flex items-center justify-start px-4">
                <Settings className="w-5 h-5 mr-3 text-[#1B3FA0]" />
                <div className="text-left">
                  <p className="text-xs font-bold text-[#1B3FA0]">Edit Company Profile</p>
                  <p className="text-[10px] text-blue-400/80 font-semibold mt-0.5">Update details, website and logo</p>
                </div>
              </Button>
            </Link>
          </div>
        </div>

      </div>

    </div>
  )
}
