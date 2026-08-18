export interface OtpProvider {
  send(phone: string, code: string): Promise<void>
}

// Phase 0 stub: logs the code server-side. Swapping in Termii or
// Africa's Talking later is a new class behind this same interface —
// nothing else in auth.service.ts changes.
export class DevConsoleOtpProvider implements OtpProvider {
  async send(phone: string, code: string): Promise<void> {
    console.log(`[dev-otp] Would send code ${code} to ${phone}`)
  }
}
