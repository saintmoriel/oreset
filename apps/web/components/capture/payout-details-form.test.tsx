import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PayoutDetailsForm } from './payout-details-form'
import { setPayoutDetails } from '@/lib/api/endpoints/payouts'
import { ApiError } from '@/lib/api/client'

vi.mock('@/lib/api/endpoints/payouts', () => ({
  setPayoutDetails: vi.fn(),
}))

describe('PayoutDetailsForm', () => {
  beforeEach(() => {
    vi.mocked(setPayoutDetails).mockReset()
  })

  it('shows "on file" immediately when hasDetailsOnFile is true, no form', () => {
    render(<PayoutDetailsForm hasDetailsOnFile />)
    expect(screen.getByText(/payout details on file/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /save/i })).not.toBeInTheDocument()
  })

  it('submits the form and switches to "on file" on success', async () => {
    vi.mocked(setPayoutDetails).mockResolvedValue({ ok: true })
    const user = userEvent.setup()
    render(<PayoutDetailsForm hasDetailsOnFile={false} />)

    const [provider, accountNumber] = screen.getAllByRole('textbox')
    await user.type(provider, 'MTN')
    await user.type(accountNumber, '08012345678')
    await user.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() => expect(screen.getByText(/payout details on file/i)).toBeInTheDocument())
    expect(setPayoutDetails).toHaveBeenCalledWith({
      type: 'mobile_money',
      provider: 'MTN',
      accountNumber: '08012345678',
    })
  })

  it('shows the API error message and keeps the form on failure', async () => {
    vi.mocked(setPayoutDetails).mockRejectedValue(new ApiError(400, 'bad', 'That payout detail is invalid.'))
    const user = userEvent.setup()
    render(<PayoutDetailsForm hasDetailsOnFile={false} />)

    const [provider, accountNumber] = screen.getAllByRole('textbox')
    await user.type(provider, 'MTN')
    await user.type(accountNumber, '08012345678')
    await user.click(screen.getByRole('button', { name: /save/i }))

    expect(await screen.findByText('That payout detail is invalid.')).toBeInTheDocument()
    expect(screen.queryByText(/payout details on file/i)).not.toBeInTheDocument()
  })
})
