import { randomUUID } from 'node:crypto'
import { env } from '../../config/env'

export interface PaymentProvider {
  initiatePayout(input: {
    amountMinorUnits: number
    currency: string
    payoutDetails: unknown
  }): Promise<{ providerReference: string; status: 'processing' | 'paid' | 'failed' }>
}

export interface BillingProvider {
  createPaymentLink(input: {
    amountMinorUnits: number
    currency: string
    customerEmail: string
    description: string
    reference: string
    redirectUrl?: string
  }): Promise<{ paymentLink: string; providerReference: string }>

  verifyTransaction(reference: string): Promise<{
    status: 'successful' | 'failed' | 'pending'
    amountMinorUnits: number
    currency: string
    providerReference: string
  }>
}

export class DevStubPaymentProvider implements PaymentProvider {
  async initiatePayout(input: {
    amountMinorUnits: number
    currency: string
    payoutDetails: unknown
  }): Promise<{ providerReference: string; status: 'processing' | 'paid' | 'failed' }> {
    const isValidDetails =
      input.payoutDetails !== null && typeof input.payoutDetails === 'object' && Object.keys(input.payoutDetails).length > 0

    if (!isValidDetails) {
      return { providerReference: `dev-stub-${randomUUID()}`, status: 'failed' }
    }
    return { providerReference: `dev-stub-${randomUUID()}`, status: 'paid' }
  }
}

export class DevStubBillingProvider implements BillingProvider {
  async createPaymentLink(input: {
    amountMinorUnits: number
    currency: string
    customerEmail: string
    description: string
    reference: string
  }): Promise<{ paymentLink: string; providerReference: string }> {
    return {
      paymentLink: `https://dev-stub.local/pay/${input.reference}`,
      providerReference: `dev-stub-${randomUUID()}`,
    }
  }

  async verifyTransaction(reference: string): Promise<{
    status: 'successful' | 'failed' | 'pending'
    amountMinorUnits: number
    currency: string
    providerReference: string
  }> {
    return {
      status: 'successful',
      amountMinorUnits: 0,
      currency: 'NGN',
      providerReference: `dev-stub-${reference}`,
    }
  }
}

const FLW_BASE = 'https://api.flutterwave.com/v3'

function flwHeaders() {
  if (!env.FLW_SECRET_KEY) throw new Error('FLW_SECRET_KEY is required for Flutterwave')
  return {
    Authorization: `Bearer ${env.FLW_SECRET_KEY}`,
    'Content-Type': 'application/json',
  }
}

export class FlutterwavePaymentProvider implements PaymentProvider {
  async initiatePayout(input: {
    amountMinorUnits: number
    currency: string
    payoutDetails: unknown
  }): Promise<{ providerReference: string; status: 'processing' | 'paid' | 'failed' }> {
    const details = input.payoutDetails as Record<string, string> | null
    if (!details?.accountNumber || !details?.bankName) {
      return { providerReference: '', status: 'failed' }
    }

    const res = await fetch(`${FLW_BASE}/transfers`, {
      method: 'POST',
      headers: flwHeaders(),
      body: JSON.stringify({
        account_bank: details.bankCode ?? details.bankName,
        account_number: details.accountNumber,
        amount: input.amountMinorUnits / 100,
        currency: input.currency,
        narration: `Oreset reviewer payout`,
        reference: `oreset-payout-${randomUUID()}`,
        debit_currency: input.currency,
      }),
    })

    const data = await res.json() as { status: string; data?: { id?: number; status?: string } }

    if (data.status === 'success') {
      return {
        providerReference: String(data.data?.id ?? ''),
        status: data.data?.status === 'SUCCESSFUL' ? 'paid' : 'processing',
      }
    }

    return { providerReference: '', status: 'failed' }
  }
}

export class FlutterwaveBillingProvider implements BillingProvider {
  async createPaymentLink(input: {
    amountMinorUnits: number
    currency: string
    customerEmail: string
    description: string
    reference: string
    redirectUrl?: string
  }): Promise<{ paymentLink: string; providerReference: string }> {
    const res = await fetch(`${FLW_BASE}/payments`, {
      method: 'POST',
      headers: flwHeaders(),
      body: JSON.stringify({
        tx_ref: input.reference,
        amount: input.amountMinorUnits / 100,
        currency: input.currency,
        redirect_url: input.redirectUrl,
        customer: { email: input.customerEmail },
        customizations: {
          title: 'Oreset Verification',
          description: input.description,
        },
      }),
    })

    const data = await res.json() as { status: string; data?: { link?: string } }

    return {
      paymentLink: data.data?.link ?? '',
      providerReference: input.reference,
    }
  }

  async verifyTransaction(reference: string): Promise<{
    status: 'successful' | 'failed' | 'pending'
    amountMinorUnits: number
    currency: string
    providerReference: string
  }> {
    const res = await fetch(`${FLW_BASE}/transactions/verify_by_reference?tx_ref=${reference}`, {
      headers: flwHeaders(),
    })

    const data = await res.json() as {
      status: string
      data?: { status?: string; amount?: number; currency?: string; flw_ref?: string }
    }

    const txStatus = data.data?.status?.toLowerCase()

    return {
      status: txStatus === 'successful' ? 'successful' : txStatus === 'failed' ? 'failed' : 'pending',
      amountMinorUnits: Math.round((data.data?.amount ?? 0) * 100),
      currency: data.data?.currency ?? 'NGN',
      providerReference: data.data?.flw_ref ?? '',
    }
  }
}
