'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

interface SignupFormData {
  email: string
  password: string
  confirmPassword: string
}

interface SignupFormErrors {
  email?: string
  password?: string
  confirmPassword?: string
  general?: string
}

export default function SignupForm() {
  const router = useRouter()
  const [formData, setFormData] = useState<SignupFormData>({
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState<SignupFormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [notification, setNotification] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  const validateForm = (): boolean => {
    const newErrors: SignupFormErrors = {}

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
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
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setNotification({
          type: 'success',
          message: data.message || 'Account created successfully!'
        })
        // Redirect to login page after successful signup
        router.push('/login')
      } else {
        setNotification({
          type: 'error',
          message: data.message || 'Failed to create account'
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
    if (errors[name as keyof SignupFormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const clearForm = () => {
    setFormData({ email: '', password: '', confirmPassword: '' })
    setErrors({})
    setNotification(null)
  }

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, text: '' }
    if (password.length < 6) return { strength: 1, text: 'Weak' }
    if (password.length < 10) return { strength: 2, text: 'Medium' }
    return { strength: 3, text: 'Strong' }
  }

  const passwordStrength = getPasswordStrength(formData.password)

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Create Account</CardTitle>
        <CardDescription>
          Enter your details to create a new account
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
            <label htmlFor="signup-email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="signup-email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'signup-email-error' : undefined}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your email"
            />
            {errors.email && (
              <p id="signup-email-error" role="alert" className="text-sm text-red-600">
                {errors.email}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="signup-password" className="text-sm font-medium">
              Password
            </label>
            <input
              id="signup-password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleInputChange}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'signup-password-error' : undefined}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your password"
            />
            {formData.password && (
              <div className="mt-1">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-1">
                    <div
                      className={`h-1 rounded-full transition-all ${
                        passwordStrength.strength === 1 ? 'bg-red-500 w-1/3' :
                        passwordStrength.strength === 2 ? 'bg-yellow-500 w-2/3' :
                        passwordStrength.strength === 3 ? 'bg-green-500 w-full' :
                        'bg-gray-300 w-0'
                      }`}
                    />
                  </div>
                  <span className="text-xs text-gray-600">{passwordStrength.text}</span>
                </div>
              </div>
            )}
            {errors.password && (
              <p id="signup-password-error" role="alert" className="text-sm text-red-600">
                {errors.password}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="confirm-password" className="text-sm font-medium">
              Confirm Password
            </label>
            <input
              id="confirm-password"
              name="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={handleInputChange}
              aria-invalid={!!errors.confirmPassword}
              aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Confirm your password"
            />
            {errors.confirmPassword && (
              <p id="confirm-password-error" role="alert" className="text-sm text-red-600">
                {errors.confirmPassword}
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
                : 'bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-500'
            } text-white`}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>

          <div className="text-center text-sm">
            <span className="text-gray-600">Already have an account? </span>
            <button
              type="button"
              onClick={clearForm}
              className="text-blue-600 hover:underline"
            >
              Sign in here
            </button>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}
