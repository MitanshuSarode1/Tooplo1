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

async function inspect() {
  try {
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .limit(1)

    if (error) {
      console.error("Database query error:", error)
      return
    }

    console.log("SUCCESS! Row data:", data)
    if (data && data.length > 0) {
      console.log("Columns:", Object.keys(data[0]))
    } else {
      console.log("Jobs table is empty. Attempting to force an error to reveal columns...")
      const { error: hintError } = await supabase
        .from("jobs")
        .select("non_existent_column_for_linting")
      console.log("Hint Error Output message:", hintError?.message)
    }
  } catch (err) {
    console.error("Execution error:", err)
  }
}

inspect()
