import * as React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import StatsCard from "./components/StatsCard"
import JobMatchCard from "./components/JobMatchCard"
import ApplicationsTable from "./components/ApplicationsTable"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { 
  Send, 
  CheckCircle, 
  Calendar, 
  Eye, 
  ArrowRight, 
  FileUp, 
  Edit3, 
  Search 
} from "lucide-react"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const supabase = await createClient()

  // 1. Verify User Session
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect("/login")
  }

  // 2. Role Guard - Verify User is a Student
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profileError || !profile || profile.role !== "student") {
    redirect("/login")
  }

  // 3. Fetch Student Specific Profile Data
  const { data: student } = await supabase
    .from("students")
    .select("name, completion_percentage")
    .eq("id", user.id)
    .single()

  const studentName = student?.name || user.email?.split("@")[0] || "Student"
  const completionPercentage = student?.completion_percentage ?? 30

  // 4. Fetch User Job Applications
  const { data: applications } = await supabase
    .from("applications")
    .select("*")
    .eq("student_id", user.id)
    .order("applied_date", { ascending: false })

  const dbApplications = applications || []
  const appliedCount = dbApplications.length
  const shortlistedCount = dbApplications.filter(a => a.status === "Shortlisted").length
  const interviewCount = dbApplications.filter(a => a.status === "Interview").length
  const recentApplications = dbApplications.slice(0, 5)

  // Mock Matched Jobs
  const mockJobs = [
    {
      companyName: "TechCorp Systems",
      jobTitle: "Junior Software Engineer",
      location: "Nagpur (Hybrid)",
      salaryRange: "₹4,00,000 - ₹6,00,000 / year",
      matchScore: 94
    },
    {
      companyName: "Innovate Solutions",
      jobTitle: "Associate Data Analyst",
      location: "Nagpur (On-site)",
      salaryRange: "₹3,50,000 - ₹5,00,000 / year",
      matchScore: 88
    },
    {
      companyName: "PixelCraft Agency",
      jobTitle: "Junior Frontend Developer",
      location: "Remote",
      salaryRange: "₹4,50,000 - ₹7,00,000 / year",
      matchScore: 85
    },
    {
      companyName: "CoreFinance Group",
      jobTitle: "Operations Intern",
      location: "Nagpur (On-site)",
      salaryRange: "₹2,40,000 - ₹3,60,000 / year",
      matchScore: 82
    }
  ]

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* SECTION 1: WELCOME BANNER */}
      <div className="bg-white rounded-2xl border border-slate-150 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
            Good morning, {studentName}
          </h1>
          <p className="text-sm font-semibold text-slate-500 max-w-md">
            Welcome back to Tooplo. Your path to a verified local job is tracking perfectly.
          </p>
        </div>

        {/* Profile Completion Card */}
        <div className="w-full md:w-[320px] bg-slate-50 rounded-xl border border-slate-100 p-4 space-y-3.5">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-slate-500 uppercase tracking-wide">Profile Completion</span>
            <span className="text-[#1B3FA0]">{completionPercentage}%</span>
          </div>
          
          {/* Custom Responsive Progress Bar */}
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-[#2563EB] h-2 rounded-full transition-all duration-500" 
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>

          {completionPercentage < 80 && (
            <Link href="/profile" className="block">
              <Button className="w-full h-9 rounded-lg bg-[#1B3FA0] text-white hover:bg-[#163482] text-xs font-bold tracking-wide">
                Complete your profile
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* SECTION 2: STATS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          title="Jobs Applied" 
          value={appliedCount} 
          description="Total submissions" 
          icon={Send} 
        />
        <StatsCard 
          title="Shortlisted" 
          value={shortlistedCount} 
          description="Under employer review" 
          icon={CheckCircle} 
        />
        <StatsCard 
          title="Interviews" 
          value={interviewCount} 
          description="Meetings scheduled" 
          icon={Calendar} 
        />
        <StatsCard 
          title="Profile Views" 
          value={0} 
          description="In the past 30 days" 
          icon={Eye} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Matched Jobs & Applications Table */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* SECTION 3: AI MATCHED JOBS */}
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <h3 className="text-lg font-extrabold text-slate-800 tracking-tight">Jobs matched for you</h3>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">Based on your skills and verified status</p>
              </div>
              <Link href="/jobs" className="text-xs font-bold text-[#1B3FA0] hover:underline flex items-center">
                View all jobs
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>

            {/* Horizontal Scroll Containers */}
            <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-200">
              {mockJobs.map((job, idx) => (
                <JobMatchCard 
                  key={idx}
                  companyName={job.companyName}
                  jobTitle={job.jobTitle}
                  location={job.location}
                  salaryRange={job.salaryRange}
                  matchScore={job.matchScore}
                />
              ))}
            </div>
          </div>

          {/* SECTION 4: RECENT APPLICATIONS */}
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <h3 className="text-lg font-extrabold text-slate-800 tracking-tight">Recent Applications</h3>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">Track status updates in real-time</p>
              </div>
              <Link href="/applications" className="text-xs font-bold text-[#1B3FA0] hover:underline">
                View all
              </Link>
            </div>

            <ApplicationsTable applications={recentApplications} />
          </div>

        </div>

        {/* Right Side: QUICK ACTIONS */}
        <div className="space-y-4">
          <h3 className="text-lg font-extrabold text-slate-800 tracking-tight">Quick Actions</h3>
          
          <div className="bg-white rounded-2xl border border-slate-150 p-6 space-y-4 shadow-sm">
            <Link href="/profile" className="block">
              <Button className="w-full h-12 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center justify-start px-4 text-slate-700 bg-white">
                <FileUp className="w-5 h-5 mr-3 text-slate-400" />
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-800">Upload / Update Resume</p>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">PDF format, max 5MB</p>
                </div>
              </Button>
            </Link>

            <Link href="/profile" className="block">
              <Button className="w-full h-12 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center justify-start px-4 text-slate-700 bg-white">
                <Edit3 className="w-5 h-5 mr-3 text-slate-400" />
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-800">Edit Skills & University</p>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">Add details to improve match rate</p>
                </div>
              </Button>
            </Link>

            <Link href="/jobs" className="block">
              <Button className="w-full h-12 rounded-xl bg-blue-50/50 hover:bg-blue-50 text-[#1B3FA0] border border-blue-100/50 transition-all flex items-center justify-start px-4">
                <Search className="w-5 h-5 mr-3 text-[#1B3FA0]" />
                <div className="text-left">
                  <p className="text-xs font-bold text-[#1B3FA0]">Browse All Jobs</p>
                  <p className="text-[10px] text-blue-400/80 font-medium mt-0.5">Find more verified opportunities</p>
                </div>
              </Button>
            </Link>
          </div>
        </div>

      </div>

    </div>
  )
}
