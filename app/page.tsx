import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"

export const dynamic = "force-dynamic"

export default async function Home() {
  const supabase = await createClient()

  // Check if user session exists
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Query user role from profiles table
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role === "student") {
    redirect("/dashboard")
  } else if (profile?.role === "company") {
    redirect("/company/dashboard")
  } else if (profile?.role === "admin") {
    redirect("/admin/dashboard")
  } else {
    redirect("/login")
  }
}
