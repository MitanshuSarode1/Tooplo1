"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { 
  User, 
  Phone, 
  GraduationCap, 
  UploadCloud, 
  X, 
  Plus, 
  Save, 
  FileText, 
  ArrowLeft 
} from "lucide-react"
import Link from "next/link"

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()

  const [userId, setUserId] = React.useState<string | null>(null)
  const [name, setName] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [university, setUniversity] = React.useState("")
  const [skills, setSkills] = React.useState<string[]>([])
  const [resumeUrl, setResumeUrl] = React.useState("")
  const [newSkill, setNewSkill] = React.useState("")

  const [isLoading, setIsLoading] = React.useState(true)
  const [isSaving, setIsSaving] = React.useState(false)
  const [isUploading, setIsUploading] = React.useState(false)
  const [uploadProgress, setUploadProgress] = React.useState(0)

  // Fetch student profile data
  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
          router.push("/login")
          return
        }
        setUserId(user.id)

        // Fetch details from students table
        const { data: student, error: studentError } = await supabase
          .from("students")
          .select("*")
          .eq("id", user.id)
          .single()

        if (student) {
          setName(student.name || "")
          setPhone(student.phone || "")
          setUniversity(student.university || "")
          setSkills(student.skills || [])
          setResumeUrl(student.resume_url || "")
        } else {
          // If no student row exists yet, initialize with default name from email
          setName(user.email?.split("@")[0] || "")
        }
      } catch (err: any) {
        toast.error("Failed to load profile data.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [supabase, router])

  // Add Skill
  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = newSkill.trim()
    if (!trimmed) return
    if (skills.includes(trimmed)) {
      toast.error("Skill already added.")
      return
    }
    setSkills([...skills, trimmed])
    setNewSkill("")
  }

  // Remove Skill
  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove))
  }

  // Simulate PDF Resume Upload
  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are supported.")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be under 5MB.")
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsUploading(false)
          setResumeUrl(file.name)
          toast.success(`Resume "${file.name}" uploaded successfully!`)
          return 100
        }
        return prev + 10
      })
    }, 150)
  }

  // Save changes to Supabase
  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return

    const trimmedName = name.trim()
    if (!trimmedName) {
      toast.error("Full Name is required.")
      return
    }

    setIsSaving(true)

    // Calculate Completion Percentage:
    // Base Name/Email: 30%
    // Phone Number: +10%
    // University Name: +15%
    // Skills array not empty: +20%
    // Resume URL uploaded: +25%
    let percentage = 30
    if (phone.trim().length > 0) percentage += 10
    if (university.trim().length > 0) percentage += 15
    if (skills.length > 0) percentage += 20
    if (resumeUrl.trim().length > 0) percentage += 25

    try {
      const { error } = await supabase
        .from("students")
        .upsert({
          id: userId,
          name: trimmedName,
          phone: phone.trim() || null,
          university: university.trim() || null,
          skills: skills,
          resume_url: resumeUrl || null,
          completion_percentage: percentage
        })

      if (error) throw error

      toast.success("Profile saved successfully!")
    } catch (err: any) {
      toast.error("Failed to save changes: " + err.message)
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
      <Link href="/dashboard" className="inline-flex items-center text-xs font-bold text-[#1B3FA0] hover:underline uppercase tracking-wide">
        <ArrowLeft className="w-4 h-4 mr-1.5" />
        Back to Dashboard
      </Link>

      <div className="bg-white rounded-2xl border border-slate-150 shadow-sm overflow-hidden">
        
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-[#1B3FA0] to-[#2563EB] px-6 py-8 text-white">
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">Your Student Profile</h2>
          <p className="text-xs text-blue-100 font-semibold mt-1 uppercase tracking-wider">
            Keep your info updated to get accurate match recommendations
          </p>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSaveChanges} className="p-6 sm:p-8 space-y-6">
          
          {/* Grid fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            
            {/* Full Name */}
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-xs font-bold text-slate-700 tracking-wide flex items-center">
                <User className="w-4 h-4 mr-1.5 text-slate-400" />
                Full Name
              </label>
              <Input
                id="name"
                type="text"
                placeholder="Mitanshu Sarode"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-11 rounded-lg border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-[#1B3FA0] focus:ring-[#1B3FA0] transition-all"
              />
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label htmlFor="phone" className="text-xs font-bold text-slate-700 tracking-wide flex items-center">
                <Phone className="w-4 h-4 mr-1.5 text-slate-400" />
                Phone Number
              </label>
              <Input
                id="phone"
                type="tel"
                placeholder="+91 XXXXX XXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-11 rounded-lg border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-[#1B3FA0] focus:ring-[#1B3FA0] transition-all"
              />
            </div>

            {/* University */}
            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor="university" className="text-xs font-bold text-slate-700 tracking-wide flex items-center">
                <GraduationCap className="w-4 h-4 mr-1.5 text-slate-400" />
                University / Institution Name
              </label>
              <Input
                id="university"
                type="text"
                placeholder="RTMNU Nagpur University"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                className="h-11 rounded-lg border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-[#1B3FA0] focus:ring-[#1B3FA0] transition-all"
              />
            </div>

          </div>

          <hr className="border-slate-100" />

          {/* Skills Tag Manager */}
          <div className="space-y-3.5">
            <div>
              <h3 className="text-xs font-bold text-slate-700 tracking-wide uppercase">Your Skills</h3>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Add skills to increase your job recommendation match score</p>
            </div>

            {/* Render tags */}
            <div className="flex flex-wrap gap-2">
              {skills.length === 0 ? (
                <span className="text-xs text-slate-400 italic">No skills added yet.</span>
              ) : (
                skills.map((skill) => (
                  <span 
                    key={skill} 
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-[#1B3FA0] border border-blue-100/50"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="ml-1.5 text-[#1B3FA0] hover:text-[#163482] transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))
              )}
            </div>

            {/* Add skill input */}
            <div className="flex space-x-2 max-w-sm">
              <Input
                type="text"
                placeholder="Add skill (e.g. React, Node.js)"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                className="h-10 rounded-lg border-slate-200 bg-slate-50 focus:border-[#1B3FA0] focus:ring-[#1B3FA0]"
              />
              <Button
                onClick={handleAddSkill}
                className="h-10 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#1B3FA0] border border-blue-100/50 flex items-center px-3"
              >
                <Plus className="w-5 h-5 mr-1" />
                Add
              </Button>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Resume Upload Panel */}
          <div className="space-y-3.5">
            <div>
              <h3 className="text-xs font-bold text-slate-700 tracking-wide uppercase">Resume Document</h3>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Upload your updated resume in PDF format (Max 5MB)</p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              
              {/* Fake hidden input */}
              <label className="flex flex-col items-center justify-center w-full sm:w-[200px] h-[100px] border-2 border-dashed border-slate-200 hover:border-[#1B3FA0] rounded-xl cursor-pointer bg-slate-50/50 hover:bg-slate-50 transition-colors p-4">
                <div className="flex flex-col items-center justify-center text-center space-y-1.5">
                  <UploadCloud className="w-8 h-8 text-slate-400" />
                  <span className="text-[10px] font-bold text-[#1B3FA0] uppercase tracking-wide">Choose PDF</span>
                </div>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleResumeChange}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>

              {/* Status display */}
              <div className="flex-grow flex flex-col justify-center">
                {isUploading ? (
                  <div className="space-y-2 max-w-xs">
                    <p className="text-xs font-bold text-slate-500 flex items-center">
                      Uploading resume... {uploadProgress}%
                    </p>
                    <div className="w-full bg-slate-150 rounded-full h-1.5">
                      <div 
                        className="bg-[#2563EB] h-1.5 rounded-full transition-all duration-150" 
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                ) : resumeUrl ? (
                  <div className="flex items-center space-x-3 bg-emerald-50/40 border border-emerald-100 rounded-xl p-3.5 max-w-md">
                    <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-800 truncate">{resumeUrl}</p>
                      <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">Verified Document Active</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setResumeUrl("")}
                      className="ml-auto p-1 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No resume uploaded. Select a PDF file to begin.</p>
                )}
              </div>

            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Submit Action */}
          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={isSaving || isUploading}
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
