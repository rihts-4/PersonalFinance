import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Basic validation
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      )
    }

    // In a real application, you would:
    // 1. Hash the password with bcrypt
    // 2. Check against your database
    // 3. Generate a JWT token
    // 4. Handle proper session management

    // For demo purposes, we'll simulate some responses
    if (email === 'test@example.com' && password === 'password123') {
      return NextResponse.json({
        success: true,
        user: { id: '1', email },
        token: 'demo-jwt-token-' + Date.now()
      })
    } else if (email === 'existing@example.com') {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      )
    } else {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
