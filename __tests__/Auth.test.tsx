import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { useRouter } from 'next/navigation'
import LoginForm from '@/components/auth/LoginForm'
import SignupForm from '@/components/auth/SignupForm'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

// Mock fetch for API calls
global.fetch = jest.fn()

const mockPush = jest.fn()
const mockRouter = {
  push: mockPush,
  replace: jest.fn(),
  back: jest.fn(),
}

describe('Authentication Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(fetch as jest.Mock).mockClear()
  })

  describe('LoginForm Component', () => {
    it('renders login form with email and password fields', () => {
      render(<LoginForm />)
      
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    })

    it('displays validation errors for empty fields', async () => {
      const user = userEvent.setup()
      render(<LoginForm />)
      
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument()
        expect(screen.getByText(/password is required/i)).toBeInTheDocument()
      })
    })

    it('displays validation error for invalid email format', async () => {
      const user = userEvent.setup()
      render(<LoginForm />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      await user.type(emailInput, 'invalid-email')
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument()
      })
    })

    it('handles successful login with valid credentials', async () => {
      const user = userEvent.setup()
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          user: { id: '1', email: 'test@example.com' },
          token: 'mock-token'
        })
      })

      render(<LoginForm />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'password123'
          })
        })
      })

      await waitFor(() => {
        expect(screen.getByText(/login successful/i)).toBeInTheDocument()
        expect(mockPush).toHaveBeenCalledWith('/dashboard')
      })
    })

    it('displays error notification for invalid credentials', async () => {
      const user = userEvent.setup()
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
          message: 'Invalid email or password'
        })
      })

      render(<LoginForm />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'wrongpassword')
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument()
      })
      
      expect(mockPush).not.toHaveBeenCalled()
    })

    it('displays error notification for network failure', async () => {
      const user = userEvent.setup()
      ;(fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

      render(<LoginForm />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/network error occurred/i)).toBeInTheDocument()
      })
    })

    it('shows loading state during login process', async () => {
      const user = userEvent.setup()
      let resolvePromise: (value: any) => void
      const mockPromise = new Promise(resolve => {
        resolvePromise = resolve
      })
      ;(fetch as jest.Mock).mockReturnValueOnce(mockPromise)

      render(<LoginForm />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)
      
      expect(screen.getByText(/signing in/i)).toBeInTheDocument()
      expect(submitButton).toBeDisabled()
      
      // Resolve the promise
      resolvePromise!({
        ok: true,
        json: async () => ({ success: true })
      })
      
      await waitFor(() => {
        expect(screen.queryByText(/signing in/i)).not.toBeInTheDocument()
      })
    })
  })

  describe('SignupForm Component', () => {
    it('renders signup form with required fields', () => {
      render(<SignupForm />)
      
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
    })

    it('displays validation errors for empty fields', async () => {
      const user = userEvent.setup()
      render(<SignupForm />)
      
      const submitButton = screen.getByRole('button', { name: /create account/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument()
        expect(screen.getByText(/password is required/i)).toBeInTheDocument()
        expect(screen.getByText(/please confirm your password/i)).toBeInTheDocument()
      })
    })

    it('validates password confirmation match', async () => {
      const user = userEvent.setup()
      render(<SignupForm />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/^password$/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
      const submitButton = screen.getByRole('button', { name: /create account/i })
      
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.type(confirmPasswordInput, 'differentpassword')
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
      })
    })

    it('validates password strength requirements', async () => {
      const user = userEvent.setup()
      render(<SignupForm />)
      
      const passwordInput = screen.getByLabelText(/^password$/i)
      const submitButton = screen.getByRole('button', { name: /create account/i })
      
      await user.type(passwordInput, '123')
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument()
      })
    })

    it('handles successful signup', async () => {
      const user = userEvent.setup()
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          message: 'Account created successfully'
        })
      })

      render(<SignupForm />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/^password$/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
      const submitButton = screen.getByRole('button', { name: /create account/i })
      
      await user.type(emailInput, 'newuser@example.com')
      await user.type(passwordInput, 'password123')
      await user.type(confirmPasswordInput, 'password123')
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'newuser@example.com',
            password: 'password123'
          })
        })
      })

      await waitFor(() => {
        expect(screen.getByText(/account created successfully/i)).toBeInTheDocument()
        expect(mockPush).toHaveBeenCalledWith('/login')
      })
    })

    it('displays error for existing email', async () => {
      const user = userEvent.setup()
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
          message: 'Email already exists'
        })
      })

      render(<SignupForm />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/^password$/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
      const submitButton = screen.getByRole('button', { name: /create account/i })
      
      await user.type(emailInput, 'existing@example.com')
      await user.type(passwordInput, 'password123')
      await user.type(confirmPasswordInput, 'password123')
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/email already exists/i)).toBeInTheDocument()
      })
      
      expect(mockPush).not.toHaveBeenCalled()
    })
  })

  describe('Form Navigation and UX', () => {
    it('allows toggling between login and signup forms', async () => {
      const user = userEvent.setup()
      render(
        <div>
          <LoginForm />
          <SignupForm />
        </div>
      )
      
      // Check if toggle links exist
      const signupLink = screen.getByText(/don't have an account/i)
      const loginLink = screen.getByText(/already have an account/i)
      
      expect(signupLink).toBeInTheDocument()
      expect(loginLink).toBeInTheDocument()
    })

    it('clears form errors when switching between forms', async () => {
      const user = userEvent.setup()
      render(<LoginForm />)
      
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument()
      })
      
      // Click the clear form button (sign up link)
      const signupLink = screen.getByText(/sign up here/i)
      await user.click(signupLink)
      
      // Errors should be cleared when clearing the form
      await waitFor(() => {
        expect(screen.queryByText(/email is required/i)).not.toBeInTheDocument()
      })
    })

    it('preserves form data during validation', async () => {
      const user = userEvent.setup()
      render(<LoginForm />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, '123') // Too short
      
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)
      
      // Form should show error but preserve the entered email
      expect(emailInput).toHaveValue('test@example.com')
      expect(passwordInput).toHaveValue('123')
    })

    it('focuses on first error field after validation', async () => {
      const user = userEvent.setup()
      render(<LoginForm />)
      
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        const emailInput = screen.getByLabelText(/email/i)
        expect(emailInput).toHaveFocus()
      })
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA labels and roles', () => {
      render(<LoginForm />)
      
      const form = screen.getByRole('form')
      expect(form).toBeInTheDocument()
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      
      expect(emailInput).toHaveAttribute('type', 'email')
      expect(passwordInput).toHaveAttribute('type', 'password')
      expect(emailInput).toHaveAttribute('required')
      expect(passwordInput).toHaveAttribute('required')
    })

    it('announces form errors to screen readers', async () => {
      const user = userEvent.setup()
      render(<LoginForm />)
      
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        const errorMessage = screen.getByText(/email is required/i)
        expect(errorMessage).toHaveAttribute('role', 'alert')
      })
    })

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup()
      render(<LoginForm />)
      
      // Tab through form elements
      await user.tab()
      expect(screen.getByLabelText(/email/i)).toHaveFocus()
      
      await user.tab()
      expect(screen.getByLabelText(/password/i)).toHaveFocus()
      
      await user.tab()
      expect(screen.getByRole('button', { name: /sign in/i })).toHaveFocus()
    })
  })
})
