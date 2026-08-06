import { login, register } from '@/actions/auth'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const email = url.searchParams.get('email') || 'test_action@example.com'
  const password = url.searchParams.get('password') || 'password123'
  const action = url.searchParams.get('action') || 'register'

  const formData = new FormData()
  formData.append('email', email)
  formData.append('password', password)
  formData.append('name', 'Test User Action')

  try {
    let result;
    if (action === 'register') {
      result = await register(formData)
    } else {
      result = await login(formData)
    }
    return NextResponse.json({ result })
  } catch (error: any) {
    return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 })
  }
}
