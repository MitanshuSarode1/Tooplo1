const { createClient } = require("@supabase/supabase-js")
const fs = require("fs")
const path = require("path")

// Read .env.local manually
const envPath = path.join(__dirname, ".env.local")
const envContent = fs.readFileSync(envPath, "utf-8")
const env = {}
envContent.split("\n").forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/)
  if (match) {
    const key = match[1]
    let value = match[2] || ""
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1)
    }
    env[key] = value.trim()
  }
})

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function probe() {
  const columns = [
    "salary", "salary_range", "location", "job_location", 
    "description", "job_description", "details",
    "skills", "skills_required", "requirements", "tags",
    "experience", "role", "type", "active", "status"
  ]
  
  for (const col of columns) {
    const { error } = await supabase
      .from("jobs")
      .select(col)
      .limit(1)
      
    if (error) {
      // Just keep quiet if it fails
    } else {
      console.log(`[+] Column "${col}" is PRESENT!`)
    }
  }
}

probe()
