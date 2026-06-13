import * as React from "react"
import { MapPin, DollarSign, Brain } from "lucide-react"

interface JobMatchCardProps {
  companyName: string
  jobTitle: string
  location: string
  salaryRange: string
  matchScore: number
}

export default function JobMatchCard({
  companyName,
  jobTitle,
  location,
  salaryRange,
  matchScore,
}: JobMatchCardProps) {
  return (
    <div className="flex-shrink-0 w-[280px] sm:w-[300px] bg-white rounded-xl border border-slate-150 shadow-sm p-5 flex flex-col justify-between transition-all hover:shadow-md hover:border-slate-200">
      <div className="space-y-3">
        <div className="flex justify-between items-start">
          <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100 font-extrabold text-slate-600">
            {companyName.charAt(0)}
          </div>
          <span className="inline-flex items-center text-xs font-bold text-[#2563EB] bg-blue-50/50 px-2.5 py-1 rounded-full ring-1 ring-blue-100/50">
            <Brain className="w-3.5 h-3.5 mr-1 text-[#2563EB]" />
            {matchScore}% Match
          </span>
        </div>

        <div>
          <h4 className="font-bold text-slate-800 text-sm leading-tight hover:text-[#1B3FA0] transition-colors">
            {jobTitle}
          </h4>
          <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-wider">{companyName}</p>
        </div>
      </div>

      <div className="border-t border-slate-100 mt-4 pt-4 flex flex-col space-y-2">
        <div className="flex items-center text-xs text-slate-500 font-semibold">
          <MapPin className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
          {location}
        </div>
        <div className="flex items-center text-xs text-slate-500 font-semibold">
          <DollarSign className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
          {salaryRange}
        </div>
      </div>
    </div>
  )
}
