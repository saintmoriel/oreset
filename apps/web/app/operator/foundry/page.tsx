import { redirect } from 'next/navigation'

// Foundry (the legacy audio-quality certification quiz) is retired. Testers
// are approved by a lead, then complete agreements and calibration.
export default function FoundryPage() {
  redirect('/operator/pending')
}
