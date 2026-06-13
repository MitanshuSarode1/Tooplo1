"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { 
  ShieldAlert, 
  Users, 
  Building2, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Link as LinkIcon, 
  GraduationCap, 
  Settings2,
  FileDown
} from "lucide-react"

interface Student {
  id: string
  name: string
  phone: string | null
  university: string | null
  skills: string[]
  resume_url: string | null
  completion_percentage: number
}

interface Company {
  id: string
  company_name: string
  industry: string | null
  website: string | null
  logo_url: string | null
  description: string | null
  is_verified: boolean
  employee_count: string | null
  completion_percentage: number
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const supabase = createClient()

  const [students, setStudents] = React.useState<Student[]>([])
  const [companies, setCompanies] = React.useState<Company[]>([])
  const [appsCount, setAppsCount] = React.useState(0)
  const [isLoading, setIsLoading] = React.useState(true)
  const [activeTab, setActiveTab] = React.useState<"companies" | "students">("companies")
  const [isActioning, setIsActioning] = React.useState<string | null>(null)

  const fetchData = React.useCallback(async () => {
    try {
      // 1. Verify User is Authenticated & is Admin
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        router.push("/login")
        return
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

      if (profileError || !profile || profile.role !== "admin") {
        toast.error("Unauthorized: Admin portal access only.")
        router.push("/login")
        return
      }

      // 2. Fetch Students
      const { data: studentsData } = await supabase
        .from("students")
        .select("*")
        .order("name", { ascending: true })
      setStudents(studentsData || [])

      // 3. Fetch Companies
      const { data: companiesData } = await supabase
        .from("companies")
        .select("*")
        .order("company_name", { ascending: true })
      setCompanies(companiesData || [])

      // 4. Fetch Applications count
      const { count } = await supabase
        .from("applications")
        .select("*", { count: "exact", head: true })
      setAppsCount(count || 0)

    } catch (err: any) {
      toast.error("Failed to load administration data.")
    } finally {
      setIsLoading(false)
    }
  }, [supabase, router])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  // Toggle company verification
  const handleToggleVerification = async (companyId: string, currentStatus: boolean) => {
    setIsActioning(companyId)
    const newStatus = !currentStatus

    try {
      // Update companies table
      const { error: compError } = await supabase
        .from("companies")
        .update({ is_verified: newStatus })
        .eq("id", companyId)

      if (compError) throw compError

      // Update profiles table too
      const { error: profError } = await supabase
        .from("profiles")
        .update({ is_verified: newStatus })
        .eq("id", companyId)

      if (profError) {
        // Log profile error but proceed as company record is updated
        console.warn("Could not sync profile table verification:", profError.message)
      }

      // Local state update
      setCompanies(prev => prev.map(c => c.id === companyId ? { ...c, is_verified: newStatus } : c))
      toast.success(newStatus ? "Company verified successfully!" : "Verification revoked successfully.")
    } catch (err: any) {
      toast.error("Failed to update verification: " + err.message)
    } finally {
      setIsActioning(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">Loading Admin Database...</p>
      </div>
    )
  }

  const verifiedCount = companies.filter(c => c.is_verified).length
  const pendingCount = companies.filter(c => !c.is_verified).length

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* SECTION 1: HEADER & PIPELINE SUMMARY */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center text-white">
            <ShieldAlert className="w-6 h-6 mr-2.5 text-blue-500" />
            Administrative Portal
          </h1>
          <p className="text-xs font-semibold text-slate-400">
            Internal console for verified recruitment tracking, company checks, and audit trails.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-850">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>SYSTEM ONLINE</span>
        </div>
      </div>

      {/* SECTION 2: METRICS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Candidates</p>
            <h4 className="text-2xl font-extrabold text-white tracking-tight">{students.length}</h4>
            <p className="text-[10px] text-slate-400 font-semibold">Registered students</p>
          </div>
          <div className="p-3 bg-slate-800 text-blue-400 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Total Companies */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Employers Registered</p>
            <h4 className="text-2xl font-extrabold text-white tracking-tight">{companies.length}</h4>
            <p className="text-[10px] text-slate-400 font-semibold">{verifiedCount} verified / {pendingCount} pending</p>
          </div>
          <div className="p-3 bg-slate-800 text-emerald-400 rounded-xl">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        {/* Total Applications */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Applications Filed</p>
            <h4 className="text-2xl font-extrabold text-white tracking-tight">{appsCount}</h4>
            <p className="text-[10px] text-slate-400 font-semibold">Database total submissions</p>
          </div>
          <div className="p-3 bg-slate-800 text-purple-400 rounded-xl">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        {/* Verification Pipe */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pending Checks</p>
            <h4 className="text-2xl font-extrabold text-amber-500 tracking-tight">{pendingCount}</h4>
            <p className="text-[10px] text-slate-400 font-semibold">Requires validation reviews</p>
          </div>
          <div className="p-3 bg-slate-800 text-amber-400 rounded-xl">
            <Settings2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* SECTION 3: DIRECTORY LISTINGS */}
      <div className="space-y-4">
        {/* Tabs navigation */}
        <div className="flex border-b border-slate-800 space-x-6 text-sm font-bold">
          <button
            onClick={() => setActiveTab("companies")}
            className={`pb-3 border-b-2 tracking-wide transition-colors ${
              activeTab === "companies" 
                ? "border-blue-500 text-blue-400" 
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Employer Verification ({companies.length})
          </button>
          <button
            onClick={() => setActiveTab("students")}
            className={`pb-3 border-b-2 tracking-wide transition-colors ${
              activeTab === "students" 
                ? "border-blue-500 text-blue-400" 
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Students Directory ({students.length})
          </button>
        </div>

        {activeTab === "companies" ? (
          /* COMPANIES LIST */
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-md overflow-hidden">
            {companies.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs italic">
                No employers registered in the database yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="p-4">Company Details</th>
                      <th className="p-4">Industry / Size</th>
                      <th className="p-4">Website</th>
                      <th className="p-4 text-center">Completion %</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 text-slate-300 font-semibold">
                    {companies.map((comp) => (
                      <tr key={comp.id} className="hover:bg-slate-850/40 transition-colors">
                        <td className="p-4">
                          <p className="text-white font-bold text-sm">{comp.company_name}</p>
                          <p className="text-[10px] text-slate-400 font-medium max-w-[240px] truncate mt-0.5">{comp.description || "No description provided."}</p>
                        </td>
                        <td className="p-4">
                          <p>{comp.industry || "Not listed"}</p>
                          <p className="text-[10px] text-slate-400 font-normal mt-0.5">{comp.employee_count || "Size unknown"} employees</p>
                        </td>
                        <td className="p-4">
                          {comp.website ? (
                            <a 
                              href={comp.website.startsWith("http") ? comp.website : `https://${comp.website}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:underline inline-flex items-center"
                            >
                              <LinkIcon className="w-3.5 h-3.5 mr-1" />
                              Website
                            </a>
                          ) : (
                            <span className="text-slate-500 italic">No link</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <span className="inline-block px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-bold border border-slate-750">
                            {comp.completion_percentage}%
                          </span>
                        </td>
                        <td className="p-4">
                          {comp.is_verified ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              <XCircle className="w-3 h-3 mr-1" />
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <Button
                            onClick={() => handleToggleVerification(comp.id, comp.is_verified)}
                            disabled={isActioning === comp.id}
                            className={`h-8 rounded-lg text-[10px] font-bold tracking-wide uppercase px-3 ${
                              comp.is_verified 
                                ? "bg-slate-800 hover:bg-rose-950/20 text-rose-400 border border-slate-700 hover:border-rose-900/40" 
                                : "bg-blue-600 hover:bg-blue-700 text-white"
                            }`}
                          >
                            {isActioning === comp.id ? "Updating..." : (comp.is_verified ? "Revoke" : "Verify")}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          /* STUDENTS LIST */
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-md overflow-hidden">
            {students.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs italic">
                No students registered in the database yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="p-4">Student Name</th>
                      <th className="p-4">Contact Info</th>
                      <th className="p-4">University</th>
                      <th className="p-4">Verified Skills</th>
                      <th className="p-4 text-center">Completeness</th>
                      <th className="p-4 text-right">Resume</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 text-slate-300 font-semibold">
                    {students.map((stud) => (
                      <tr key={stud.id} className="hover:bg-slate-850/40 transition-colors">
                        <td className="p-4">
                          <p className="text-white font-bold text-sm">{stud.name}</p>
                        </td>
                        <td className="p-4">
                          <p className="text-slate-400 font-medium">{stud.phone || "No phone listed"}</p>
                        </td>
                        <td className="p-4">
                          <span className="flex items-center text-slate-300">
                            <GraduationCap className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                            {stud.university || "Not provided"}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1 max-w-[220px]">
                            {stud.skills.length === 0 ? (
                              <span className="text-[10px] text-slate-500 italic">No skills listed</span>
                            ) : (
                              stud.skills.map((skill) => (
                                <span 
                                  key={skill} 
                                  className="inline-block px-1.5 py-0.5 rounded bg-slate-850 text-slate-400 text-[9px] font-bold border border-slate-800"
                                >
                                  {skill}
                                </span>
                              ))
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <span className="inline-block px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-bold border border-slate-750">
                            {stud.completion_percentage}%
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          {stud.resume_url ? (
                            <Button
                              onClick={() => toast.success(`Viewing resume: ${stud.resume_url}`)}
                              className="h-8 rounded-lg bg-slate-800 hover:bg-slate-755 border border-slate-700 text-slate-300 text-[10px] font-bold px-3 uppercase tracking-wider inline-flex items-center"
                            >
                              <FileDown className="w-3.5 h-3.5 mr-1 text-slate-400" />
                              PDF
                            </Button>
                          ) : (
                            <span className="text-slate-600 italic text-[10px]">Not uploaded</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
