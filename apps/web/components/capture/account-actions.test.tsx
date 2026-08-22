import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AccountActions } from './account-actions'
import { getDataExport, deleteAccount } from '@/lib/api/endpoints/me'
import { ApiError } from '@/lib/api/client'

const push = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}))

vi.mock('@/lib/api/endpoints/me', () => ({
  getDataExport: vi.fn(),
  deleteAccount: vi.fn(),
}))

beforeEach(() => {
  push.mockReset()
  vi.mocked(getDataExport).mockReset()
  vi.mocked(deleteAccount).mockReset()
  URL.createObjectURL = vi.fn(() => 'blob:mock')
  URL.revokeObjectURL = vi.fn()
})

describe('AccountActions', () => {
  it('requires a two-step confirm before calling delete', async () => {
    const user = userEvent.setup()
    render(<AccountActions />)

    await user.click(screen.getByRole('button', { name: /delete my account/i }))
    expect(deleteAccount).not.toHaveBeenCalled()
    expect(screen.getByText(/can't be undone/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /confirm delete/i }))
    await waitFor(() => expect(deleteAccount).toHaveBeenCalledOnce())
  })

  it('navigates to /capture after a successful delete', async () => {
    vi.mocked(deleteAccount).mockResolvedValue({ ok: true })
    const user = userEvent.setup()
    render(<AccountActions />)

    await user.click(screen.getByRole('button', { name: /delete my account/i }))
    await user.click(screen.getByRole('button', { name: /confirm delete/i }))

    await waitFor(() => expect(push).toHaveBeenCalledWith('/capture'))
  })

  it('shows an error and does not navigate when delete fails', async () => {
    vi.mocked(deleteAccount).mockRejectedValue(new ApiError(500, 'internal_error', 'Something broke.'))
    const user = userEvent.setup()
    render(<AccountActions />)

    await user.click(screen.getByRole('button', { name: /delete my account/i }))
    await user.click(screen.getByRole('button', { name: /confirm delete/i }))

    expect(await screen.findByText('Something broke.')).toBeInTheDocument()
    expect(push).not.toHaveBeenCalled()
  })

  it('exports data by fetching the bundle and triggering a download', async () => {
    vi.mocked(getDataExport).mockResolvedValue({ profile: { id: '1' } })
    const user = userEvent.setup()
    render(<AccountActions />)

    await user.click(screen.getByRole('button', { name: /download my data/i }))

    await waitFor(() => expect(getDataExport).toHaveBeenCalledOnce())
    expect(URL.createObjectURL).toHaveBeenCalledOnce()
  })
})
