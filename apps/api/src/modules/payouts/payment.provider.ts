import { randomUUID } from 'node:crypto'

export interface PaymentProvider {
  initiatePayout(input: {
    amountMinorUnits: number
    currency: string
    payoutDetails: unknown
  }): Promise<{ providerReference: string; status: 'processing' | 'paid' | 'failed' }>
}

// Mirrors DevConsoleOtpProvider exactly: simulates success deterministically,
// no real network call. A missing/malformed payoutDetails is a documented
// deterministic-failure path, so the fail branch is testable without any
// crafted network condition. Swapping in Paystack/Flutterwave later is a
// new class behind this same interface — no live account exists or can be
// provisioned in this session, so that class is left unimplemented with a
// comment marking exactly where it plugs in, same shape as
// R2StorageProvider in uploads.service.ts.
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

// Real classes plug in here later, same interface, no other file changes:
// export class PaystackPaymentProvider implements PaymentProvider { ... }
// export class FlutterwavePaymentProvider implements PaymentProvider { ... }
