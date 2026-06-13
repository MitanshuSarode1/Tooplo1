import * as React from "react"
import { Calendar, Users } from "lucide-react"

export interface Candidate {
  id: string
  candidate_name: string
  job_title: string
  applied_date: string
  skills: string[]
  ai_match_score: number
  status: "Applied" | "Shortlisted" | "Interview" | "Rejected" | string
}

interface CandidatesTableProps {
  candidates: Candidate[]
}

export default function CandidatesTable({ candidates }: CandidatesTableProps) {
  const getStatusStyle = (status: string) => {
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

  if (!candidates || candidates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl border border-slate-150 text-center space-y-3 shadow-sm">
        <div className="p-3 bg-slate-50 rounded-full text-slate-400 border border-slate-100">
          <Users className="w-6 h-6" />
        </div>
        <p className="font-bold text-slate-800 text-sm">No applications yet</p>
        <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
          When candidates apply to your job postings, they will appear here with their matching details.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-150 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-150 bg-slate-50/50 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
              <th className="p-4">Candidate Name</th>
              <th className="p-4">Job Title</th>
              <th className="p-4">Applied Date</th>
              <th className="p-4">Skills</th>
              <th className="p-4 text-center">AI Match Score</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
            {candidates.map((candidate) => (
              <tr key={candidate.id} className="hover:bg-slate-50/40 transition-colors">
                <td className="p-4 text-slate-800 font-bold">{candidate.candidate_name}</td>
                <td className="p-4 text-[#1B3FA0]">{candidate.job_title}</td>
                <td className="p-4 text-slate-400 font-semibold">
                  <span className="flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-400 flex-shrink-0" />
                    {new Date(candidate.applied_date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-1 max-w-[200px]">
                    {candidate.skills.length === 0 ? (
                      <span className="text-[10px] text-slate-400 italic font-normal">No skills listed</span>
                    ) : (
                      candidate.skills.slice(0, 3).map((skill) => (
                        <span 
                          key={skill} 
                          className="inline-block px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[9px] font-bold"
                        >
                          {skill}
                        </span>
                      ))
                    )}
                    {candidate.skills.length > 3 && (
                      <span className="text-[9px] text-slate-400 font-bold self-center">
                        +{candidate.skills.length - 3} more
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-4 text-center">
                  <span className="inline-flex items-center justify-center px-2 py-0.5 rounded bg-blue-50 text-[#2563EB] text-[10px] font-extrabold border border-blue-100">
                    {candidate.ai_match_score}%
                  </span>
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getStatusStyle(candidate.status)}`}>
                    {candidate.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
