const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  console.log('Registering test user...')
  const email = `test_${Date.now()}@example.com`
  const password = 'password123'
  const { data: regData, error: regErr } = await supabase.auth.signUp({
    email,
    password
  })
  if (regErr) {
    console.error('Registration failed:', regErr.message)
    return
  }
  console.log('Registered:', regData.user.id)

  console.log('Logging in...')
  const { data: loginData, error: loginErr } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  if (loginErr) {
    console.error('Login failed:', loginErr.message)
    return
  }
  console.log('Login successful:', loginData.user.id)
}
test()
