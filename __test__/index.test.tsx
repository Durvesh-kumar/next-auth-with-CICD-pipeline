import { expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import Home from '@/app/(dashboard)/page'
 
test('Home', () => {
  render(<Home />)
  expect(screen.getByRole('heading', { level: 1, name: 'Home' })).toBeDefined()
})