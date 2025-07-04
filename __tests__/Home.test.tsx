import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Home from '../app/page'

describe('Home', () => {
  it('renders the Next.js logo', () => {
    render(<Home />)
    const logo = screen.getByAltText('Next.js logo')
    expect(logo).toBeInTheDocument()
  })

  it('renders the get started text', () => {
    render(<Home />)
    const getStartedText = screen.getByText(/Get started by editing/i)
    expect(getStartedText).toBeInTheDocument()
  })

  it('renders the deploy now link', () => {
    render(<Home />)
    const deployLink = screen.getByRole('link', { name: /deploy now/i })
    expect(deployLink).toBeInTheDocument()
    expect(deployLink).toHaveAttribute('href', expect.stringContaining('vercel.com'))
  })
})