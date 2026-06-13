import * as React from "react"
import { Calendar, Briefcase } from "lucide-react"

interface Application {
  id: string
  company_name: string
  job_title: string
  applied_date: string
  status: "Applied" | "Shortlisted" | "Interview" | "Rejected" | string
}

interface ApplicationsTableProps {
  applications: Application[]
}

export default function ApplicationsTable({ applications }: ApplicationsTableProps) {
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Applied":
        return "bg-blue-50 text-[#1B3FA0] ring-1 ring-blue-100/50"
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

  if (!applications || applications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-xl border border-slate-150 text-center space-y-3 shadow-sm">
        <div className="p-3 bg-slate-50 rounded-full text-slate-400 border border-slate-100">
          <Briefcase className="w-6 h-6" />
        </div>
        <p className="font-bold text-slate-800 text-sm">No applications yet</p>
        <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
          Your active applications will appear here. Start browsing jobs to make your first application!
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-slate-150 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-150 bg-slate-50/50 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
              <th className="p-4">Company</th>
              <th className="p-4">Job Title</th>
              <th className="p-4">Applied Date</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
            {applications.map((app) => (
              <tr key={app.id} className="hover:bg-slate-50/40 transition-colors">
                <td className="p-4 text-slate-800 font-bold">{app.company_name}</td>
                <td className="p-4 text-[#1B3FA0]">{app.job_title}</td>
                <td className="p-4 text-slate-400 font-semibold">
                  <span className="flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                    {new Date(app.applied_date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getStatusStyle(app.status)}`}>
                    {app.status}
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
