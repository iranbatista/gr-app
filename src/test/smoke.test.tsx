import { screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import { renderApp } from './render'

it('renders the app', () => {
  renderApp('/')
  expect(screen.getByText('GymRats')).toBeInTheDocument()
})
