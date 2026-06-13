"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AdminLoginPageRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/login?role=admin")
  }, [router])

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100 items-center justify-center p-6 font-sans">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        <p className="text-sm font-semibold tracking-wide text-slate-500 uppercase">Routing to secure panel...</p>
      </div>
    </div>
  )
}
