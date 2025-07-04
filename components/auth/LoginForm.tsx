'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

interface LoginFormData {
  email: string
  password: string
}

interface LoginFormErrors {
  email?: string
  password?: string
  general?: string
}

export default function LoginForm() {
  const router = useRouter()
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState<LoginFormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [notification, setNotification] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  const validateForm = (): boolean => {
    const newErrors: LoginFormErrors = {}

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      // Focus on first error field
      setTimeout(() => {
        const firstErrorField = document.querySelector('[aria-invalid="true"]') as HTMLElement
        firstErrorField?.focus()
      }, 0)
      return
    }

    setIsLoading(true)
    setNotification(null)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setNotification({
          type: 'success',
          message: 'Login successful!'
        })
        // Store token if needed
        if (data.token) {
          localStorage.setItem('authToken', data.token)
        }
        router.push('/dashboard')
      } else {
        setNotification({
          type: 'error',
          message: data.message || 'Invalid email or password'
        })
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'A network error occurred. Please try again.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (errors[name as keyof LoginFormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const clearForm = () => {
    setFormData({ email: '', password: '' })
    setErrors({})
    setNotification(null)
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>
          Enter your email and password to access your account
        </CardDescription>
      </CardHeader>
      
      <form role="form" onSubmit={handleSubmit} noValidate>
        <CardContent className="space-y-4">
          {notification && (
            <div
              role="alert"
              className={`p-3 rounded-md text-sm ${
                notification.type === 'success'
                  ? 'bg-green-100 text-green-800 border border-green-200'
                  : 'bg-red-100 text-red-800 border border-red-200'
              }`}
            >
              {notification.message}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your email"
            />
            {errors.email && (
              <p id="email-error" role="alert" className="text-sm text-red-600">
                {errors.email}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleInputChange}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your password"
            />
            {errors.password && (
              <p id="password-error" role="alert" className="text-sm text-red-600">
                {errors.password}
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500'
            } text-white`}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>

          <div className="text-center text-sm">
            <span className="text-gray-600">Don't have an account? </span>
            <button
              type="button"
              onClick={clearForm}
              className="text-blue-600 hover:underline"
            >
              Sign up here
            </button>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}
