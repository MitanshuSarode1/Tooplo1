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

async function fetchSchema() {
  const url = `${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`
  const apikey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  try {
    const response = await fetch(url, {
      headers: {
        "apikey": apikey,
        "Authorization": `Bearer ${apikey}`,
        "Accept": "application/openapi+json"
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`)
    }

    const schema = await response.json()
    const jobsDefinition = schema.definitions?.jobs

    if (jobsDefinition) {
      console.log("SUCCESS! Found 'jobs' table definition:")
      console.log(JSON.stringify(jobsDefinition.properties, null, 2))
    } else {
      console.log("Could not find 'jobs' definition in schema. Available tables:", Object.keys(schema.definitions || {}))
    }
  } catch (err) {
    console.error("Failed to fetch schema:", err)
  }
}

fetchSchema()
