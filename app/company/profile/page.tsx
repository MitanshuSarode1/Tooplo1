"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { 
  Building, 
  Globe, 
  Briefcase, 
  Users, 
  FileText, 
  Save, 
  ArrowLeft 
} from "lucide-react"
import Link from "next/link"

export default function CompanyProfilePage() {
  const router = useRouter()
  const supabase = createClient()

  const [userId, setUserId] = React.useState<string | null>(null)
  const [companyName, setCompanyName] = React.useState("")
  const [industry, setIndustry] = React.useState("")
  const [website, setWebsite] = React.useState("")
  const [logoUrl, setLogoUrl] = React.useState("")
  const [employeeCount, setEmployeeCount] = React.useState("")
  const [description, setDescription] = React.useState("")

  const [isLoading, setIsLoading] = React.useState(true)
  const [isSaving, setIsSaving] = React.useState(false)

  React.useEffect(() => {
    const fetchCompanyProfile = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
          router.push("/login")
          return
        }
        setUserId(user.id)

        // Fetch details from companies table
        const { data: company, error: companyError } = await supabase
          .from("companies")
          .select("*")
          .eq("id", user.id)
          .single()

        if (company) {
          setCompanyName(company.company_name || "")
          setIndustry(company.industry || "")
          setWebsite(company.website || "")
          setLogoUrl(company.logo_url || "")
          setEmployeeCount(company.employee_count || "")
          setDescription(company.description || "")
        } else {
          // Fallback to name from user email
          setCompanyName(user.email?.split("@")[0].toUpperCase() || "")
        }
      } catch (err: any) {
        toast.error("Failed to load company profile data.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCompanyProfile()
  }, [supabase, router])

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return

    const trimmedName = companyName.trim()
    if (!trimmedName) {
      toast.error("Company name is required.")
      return
    }

    setIsSaving(true)

    // Calculate Completion Score:
    // Base Company Name: 30%
    // Industry: +15%
    // Website: +15%
    // Employee Count: +15%
    // Description: +25%
    let percentage = 30
    if (industry.trim().length > 0) percentage += 15
    if (website.trim().length > 0) percentage += 15
    if (employeeCount.trim().length > 0) percentage += 15
    if (description.trim().length > 0) percentage += 25

    try {
      const { error } = await supabase
        .from("companies")
        .upsert({
          id: userId,
          company_name: trimmedName,
          industry: industry.trim() || null,
          website: website.trim() || null,
          logo_url: logoUrl.trim() || null,
          employee_count: employeeCount.trim() || null,
          description: description.trim() || null,
          completion_percentage: percentage
        })

      if (error) throw error

      toast.success("Company profile saved successfully!")
    } catch (err: any) {
      toast.error("Failed to save profile: " + err.message)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1B3FA0] border-t-transparent"></div>
        <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Loading Profile...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      
      {/* Back button */}
      <Link href="/company/dashboard" className="inline-flex items-center text-xs font-bold text-[#1B3FA0] hover:underline uppercase tracking-wide">
        <ArrowLeft className="w-4 h-4 mr-1.5" />
        Back to Dashboard
      </Link>

      <div className="bg-white rounded-2xl border border-slate-150 shadow-sm overflow-hidden">
        
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-[#1B3FA0] to-[#2563EB] px-6 py-8 text-white">
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">Company Profile Setup</h2>
          <p className="text-xs text-blue-100 font-semibold mt-1 uppercase tracking-wider">
            Establish your employer brand and attract top local verified talent.
          </p>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSaveChanges} className="p-6 sm:p-8 space-y-6">
          
          {/* Grid fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            
            {/* Company Name */}
            <div className="space-y-1.5">
              <label htmlFor="companyName" className="text-xs font-bold text-slate-700 tracking-wide flex items-center">
                <Building className="w-4 h-4 mr-1.5 text-slate-400" />
                Company Name
              </label>
              <Input
                id="companyName"
                type="text"
                placeholder="TechCorp Solutions"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
                className="h-11 rounded-lg border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-[#1B3FA0] focus:ring-[#1B3FA0] transition-all"
              />
            </div>

            {/* Industry */}
            <div className="space-y-1.5">
              <label htmlFor="industry" className="text-xs font-bold text-slate-700 tracking-wide flex items-center">
                <Briefcase className="w-4 h-4 mr-1.5 text-slate-400" />
                Industry
              </label>
              <Input
                id="industry"
                type="text"
                placeholder="Information Technology"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="h-11 rounded-lg border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-[#1B3FA0] focus:ring-[#1B3FA0] transition-all"
              />
            </div>

            {/* Website URL */}
            <div className="space-y-1.5">
              <label htmlFor="website" className="text-xs font-bold text-slate-700 tracking-wide flex items-center">
                <Globe className="w-4 h-4 mr-1.5 text-slate-400" />
                Website URL
              </label>
              <Input
                id="website"
                type="text"
                placeholder="www.techcorp.com"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="h-11 rounded-lg border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-[#1B3FA0] focus:ring-[#1B3FA0] transition-all"
              />
            </div>

            {/* Employee Count */}
            <div className="space-y-1.5">
              <label htmlFor="employeeCount" className="text-xs font-bold text-slate-700 tracking-wide flex items-center">
                <Users className="w-4 h-4 mr-1.5 text-slate-400" />
                Company Size (Employees)
              </label>
              <select
                id="employeeCount"
                value={employeeCount}
                onChange={(e) => setEmployeeCount(e.target.value)}
                className="flex w-full h-11 border border-slate-200 bg-slate-50 px-3 py-2 text-xs placeholder:text-slate-400 rounded-lg focus-visible:outline-none focus:border-[#1B3FA0] focus:ring-1 focus:ring-[#1B3FA0] disabled:cursor-not-allowed disabled:opacity-50 text-slate-900 font-semibold transition-all"
              >
                <option value="">Select Company Size</option>
                <option value="1-10">1-10 Employees</option>
                <option value="11-50">11-50 Employees</option>
                <option value="51-200">51-200 Employees</option>
                <option value="201-500">201-500 Employees</option>
                <option value="500+">500+ Employees</option>
              </select>
            </div>

            {/* Description */}
            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor="description" className="text-xs font-bold text-slate-700 tracking-wide flex items-center">
                <FileText className="w-4 h-4 mr-1.5 text-slate-400" />
                Company Description
              </label>
              <textarea
                id="description"
                placeholder="Write a brief overview of your organization, mission, and working culture..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="flex w-full border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs placeholder:text-slate-400 rounded-lg focus-visible:outline-none focus:border-[#1B3FA0] focus:ring-1 focus:ring-[#1B3FA0] disabled:cursor-not-allowed disabled:opacity-50 text-slate-900 font-semibold transition-all"
              />
            </div>

          </div>

          <hr className="border-slate-100" />

          {/* Submit Action */}
          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={isSaving}
              className="h-11 rounded-lg bg-[#1B3FA0] text-white hover:bg-[#163482] active:scale-[0.98] transition-all flex items-center px-6 text-sm font-semibold tracking-wide shadow-md shadow-blue-500/10"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>

        </form>

      </div>
    </div>
  )
}
