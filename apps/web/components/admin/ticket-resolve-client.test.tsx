import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TicketResolveClient } from './ticket-resolve-client'
import { resolveTicket } from '@/lib/api/endpoints/tickets'
import type { Ticket } from '@/lib/api/endpoints/tickets'

const fakeTicket: Ticket = {
  id: 't1',
  operatorReviewDecisionId: 'd1',
  clientName: 'Test Client',
  externalRef: 'txn_1',
  errTag: 'ERR-02',
  severity: 'SEV-1',
  notes: null,
  status: 'resolved',
  resolvedBy: 'admin1',
  resolvedAt: '2026-01-01T00:00:00.000Z',
  resolutionNotes: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  resolvedByUser: null,
}

const refresh = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh }),
}))

vi.mock('@/lib/api/endpoints/tickets', () => ({
  resolveTicket: vi.fn(),
}))

beforeEach(() => {
  refresh.mockReset()
  vi.mocked(resolveTicket).mockReset()
})

describe('TicketResolveClient', () => {
  it('sends the typed resolution notes and refreshes on success', async () => {
    vi.mocked(resolveTicket).mockResolvedValue({ ticket: fakeTicket })
    const user = userEvent.setup()
    render(<TicketResolveClient ticketId="t1" />)

    await user.click(screen.getByRole('button', { name: /^resolve$/i }))
    await user.type(screen.getByPlaceholderText(/resolution notes/i), 'Fixed by client team')
    await user.click(screen.getByRole('button', { name: /confirm/i }))

    await waitFor(() => expect(resolveTicket).toHaveBeenCalledWith('t1', 'Fixed by client team'))
    expect(refresh).toHaveBeenCalledOnce()
  })

  it('sends undefined notes when left blank', async () => {
    vi.mocked(resolveTicket).mockResolvedValue({ ticket: fakeTicket })
    const user = userEvent.setup()
    render(<TicketResolveClient ticketId="t1" />)

    await user.click(screen.getByRole('button', { name: /^resolve$/i }))
    await user.click(screen.getByRole('button', { name: /confirm/i }))

    await waitFor(() => expect(resolveTicket).toHaveBeenCalledWith('t1', undefined))
  })
})
