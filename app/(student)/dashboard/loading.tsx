import * as React from "react"

export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      
      {/* SECTION 1: WELCOME BANNER SKELETON */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-3 flex-1">
          <div className="h-8 bg-slate-200 rounded-lg w-1/3"></div>
          <div className="h-4 bg-slate-150 rounded-lg w-1/2"></div>
        </div>
        <div className="w-full md:w-[320px] bg-slate-50 rounded-xl border border-slate-100 p-4 space-y-3.5">
          <div className="flex justify-between items-center">
            <div className="h-3 bg-slate-200 rounded w-1/4"></div>
            <div className="h-3 bg-slate-200 rounded w-1/12"></div>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2"></div>
          <div className="h-9 bg-slate-250 rounded-lg w-full"></div>
        </div>
      </div>

      {/* SECTION 2: STATS ROW SKELETON */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-100 p-6 flex items-center justify-between shadow-sm">
            <div className="space-y-2.5 flex-1">
              <div className="h-3 bg-slate-200 rounded w-1/2"></div>
              <div className="h-7 bg-slate-300 rounded w-1/3"></div>
              <div className="h-3 bg-slate-150 rounded w-3/4"></div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-slate-100"></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side Skeletons */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* SECTION 3: AI MATCHED JOBS SKELETON */}
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div className="space-y-2 flex-1">
                <div className="h-5 bg-slate-200 rounded w-1/4"></div>
                <div className="h-3 bg-slate-150 rounded w-1/3"></div>
              </div>
              <div className="h-3 bg-slate-200 rounded w-1/12"></div>
            </div>

            <div className="flex space-x-4 overflow-x-auto pb-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex-shrink-0 w-[280px] sm:w-[300px] bg-white rounded-xl border border-slate-100 p-5 flex flex-col justify-between shadow-sm space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="w-10 h-10 rounded-lg bg-slate-150"></div>
                      <div className="w-20 h-6 rounded-full bg-slate-150"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                      <div className="h-3 bg-slate-150 rounded w-1/3"></div>
                    </div>
                  </div>
                  <div className="border-t border-slate-100 pt-4 space-y-2">
                    <div className="h-3 bg-slate-150 rounded w-1/2"></div>
                    <div className="h-3 bg-slate-150 rounded w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 4: RECENT APPLICATIONS SKELETON */}
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div className="space-y-2 flex-1">
                <div className="h-5 bg-slate-200 rounded w-1/4"></div>
                <div className="h-3 bg-slate-150 rounded w-1/3"></div>
              </div>
              <div className="h-3 bg-slate-200 rounded w-1/12"></div>
            </div>

            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden p-4 space-y-3">
              <div className="h-10 bg-slate-50 rounded-lg w-full"></div>
              <div className="h-10 bg-slate-100 rounded-lg w-full"></div>
              <div className="h-10 bg-slate-50 rounded-lg w-full"></div>
              <div className="h-10 bg-slate-100 rounded-lg w-full"></div>
              <div className="h-10 bg-slate-50 rounded-lg w-full"></div>
            </div>
          </div>

        </div>

        {/* Right Side Skeletons */}
        <div className="space-y-4">
          <div className="h-5 bg-slate-200 rounded w-1/3"></div>
          
          <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4 shadow-sm">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-100 rounded-xl w-full"></div>
            ))}
          </div>
        </div>

      </div>

    </div>
  )
}
