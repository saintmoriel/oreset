import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DatasetAssemblyClient } from './dataset-assembly-client'
import { getUnassembledSubmissions, addDatasetItems, sealDataset } from '@/lib/api/endpoints/datasets'
import type { DatasetWithRelations, UnassembledSubmission } from '@/lib/api/endpoints/datasets'

const refresh = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh }),
}))

vi.mock('@/lib/api/endpoints/datasets', () => ({
  getUnassembledSubmissions: vi.fn(),
  addDatasetItems: vi.fn(),
  removeDatasetItem: vi.fn(),
  sealDataset: vi.fn(),
  handoffDataset: vi.fn(),
}))

const baseDataset: DatasetWithRelations = {
  id: 'ds1',
  title: 'Test Dataset',
  campaignId: 'camp1',
  buyerId: null,
  licenseTerms: 'Non-exclusive.',
  status: 'draft',
  provenanceHash: null,
  sealedAt: null,
  deliveredAt: null,
  createdBy: 'admin1',
  createdAt: '2026-01-01T00:00:00.000Z',
  campaign: {
    id: 'camp1',
    title: 'Test Campaign',
    status: 'live',
    mediaType: 'audio',
    language: null,
    domain: null,
    payRateMinorUnits: null,
    currency: 'NGN',
    materials: null,
    cohort: null,
    createdBy: null,
    launchedAt: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    batches: [],
  },
  buyer: null,
  items: [],
}

const poolItem: UnassembledSubmission = {
  id: 'sub1',
  mediaType: 'audio',
  mimeType: 'audio/webm',
  fileSizeBytes: 4000,
  durationSeconds: '6',
  createdAt: '2026-01-01T00:00:00.000Z',
  batch: { id: 'batch1', title: 'Test Batch' },
  contributor: { id: 'contrib1', displayName: 'Dev Contributor' },
}

beforeEach(() => {
  refresh.mockReset()
  vi.mocked(getUnassembledSubmissions).mockReset()
  vi.mocked(addDatasetItems).mockReset()
  vi.mocked(sealDataset).mockReset()
})

describe('DatasetAssemblyClient — draft view', () => {
  it('disables Seal dataset with zero items', async () => {
    vi.mocked(getUnassembledSubmissions).mockResolvedValue({ submissions: [] })
    render(<DatasetAssemblyClient dataset={baseDataset} buyers={[]} />)

    const sealButton = await screen.findByRole('button', { name: /seal dataset/i })
    expect(sealButton).toBeDisabled()
    expect(screen.getByText(/add at least one item before sealing/i)).toBeInTheDocument()
  })

  it('enables Add-to-dataset only once an item is checked, and calls the API with the selected id', async () => {
    vi.mocked(getUnassembledSubmissions).mockResolvedValue({ submissions: [poolItem] })
    vi.mocked(addDatasetItems).mockResolvedValue({ added: 1 })
    const user = userEvent.setup()
    render(<DatasetAssemblyClient dataset={baseDataset} buyers={[]} />)

    const addButton = await screen.findByRole('button', { name: /add.*to dataset/i })
    expect(addButton).toBeDisabled()

    await user.click(screen.getByRole('checkbox'))
    expect(addButton).toBeEnabled()

    await user.click(addButton)
    await waitFor(() => expect(addDatasetItems).toHaveBeenCalledWith('ds1', ['sub1']))
    expect(refresh).toHaveBeenCalledOnce()
  })

  it('enables Seal dataset once the dataset already has an item', async () => {
    vi.mocked(getUnassembledSubmissions).mockResolvedValue({ submissions: [] })
    const datasetWithItem: DatasetWithRelations = {
      ...baseDataset,
      items: [
        {
          id: 'item1',
          submissionId: 'sub1',
          submission: {
            id: 'sub1',
            mediaType: 'audio',
            mimeType: 'audio/webm',
            fileSizeBytes: 4000,
            durationSeconds: '6',
            createdAt: '2026-01-01T00:00:00.000Z',
          },
        },
      ],
    }
    render(<DatasetAssemblyClient dataset={datasetWithItem} buyers={[]} />)

    const sealButton = await screen.findByRole('button', { name: /seal dataset/i })
    expect(sealButton).toBeEnabled()
  })
})
