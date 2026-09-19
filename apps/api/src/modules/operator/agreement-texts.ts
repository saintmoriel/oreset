import { createHash } from 'node:crypto'
import { AGREEMENT_TYPES, AGREEMENT_TYPE_LABELS, type AgreementType } from '@oreset/shared'

// The texts testers accept inside the platform. Plain-language versions of
// the Tester Agreement and its Schedules A to D (Desktop\Oreset Documents\
// LEGAL-TESTER-AGREEMENT-AND-UNDERTAKINGS.md). Changing any text here MUST
// bump its version: everyone then re-accepts before their next assignment.
// Copy rule: no em or en dashes.

export type AgreementDocument = {
  type: AgreementType
  label: string
  version: string
  summary: string
  text: string
}

export const AGREEMENT_DOCUMENTS: Record<AgreementType, AgreementDocument> = {
  tester_agreement: {
    type: 'tester_agreement',
    label: AGREEMENT_TYPE_LABELS.tester_agreement,
    version: '2.0',
    summary: 'You are an independent contractor testing AI systems for Oreset clients through the platform. How you are assigned work, paid, and how either side can end it.',
    text: [
      'ORESET TESTER AGREEMENT, version 2.0',
      '',
      '1. You are an independent contractor, not an employee, agent or partner of Oreset. You are responsible for your own taxes, equipment and insurance. Nothing here promises you any minimum amount of work, and being assigned to one engagement is not a promise of another.',
      '2. Everything in your application is true. A material falsehood discovered at any time lets Oreset end this Agreement immediately and withhold unpaid amounts for the affected work.',
      '3. You will complete onboarding before client work: these five acceptances, identity verification, and calibration. You may be asked to recalibrate.',
      '4. For each engagement you are assigned, you will read and acknowledge its Rules of Engagement before your first scenario, work only within them, work each scenario to the published standard, record your decision, evidence and reproduction steps honestly, and escalate when unsure. Proof of concept only, never damage.',
      '5. You will do the work personally. You will not delegate, subcontract, or let anyone else use your account or work under your name.',
      '6. Oreset lead auditors decide whether a finding is verified, its severity, and whether a scenario was worked to standard. You may dispute once through the platform; the decision after review is final.',
      '7. You are paid per scenario worked to standard, per verified finding by severity, and per retest, at the rates shown when an engagement is assigned. Rates may change between engagements, never during one. Nothing is paid for false positives, duplicates, or scenarios not worked to standard. Payment is monthly to a bank account in your own verified name. Oreset may withhold payment for work affected by a suspected breach while it investigates. You are responsible for your own taxes; withholding tax is deducted where the law requires.',
      '8. Everything you create doing this work (findings, evidence, reproduction steps, scenario ideas, notes) belongs to Oreset from the moment it is created, and Oreset may license it to the client. You keep your general skills and experience and may say, in general terms and without identifying any client or finding, that you have done AI red team work through Oreset.',
      '9. You will tell Oreset before starting an engagement if the client is your employer, a competitor of your employer, a company you have a financial interest in, or one where you have a personal relationship with staff. Concealing a conflict is a material breach.',
      '10. You may end this Agreement at any time by written notice and will be paid for verified work. Oreset may suspend your access immediately on reasonable suspicion of a breach or security risk, may end this Agreement on 14 days notice for any reason, and may end it immediately for material breach, including any breach of the Confidentiality, Data Handling or Identity and Account undertakings, a false application, a concealed conflict, or fabricated findings.',
      '11. You will indemnify Oreset against losses caused by your deliberate or grossly negligent breach of the Rules of Engagement or of these undertakings. Oreset is not liable to you beyond amounts properly due for verified work, and is not responsible for client decisions or the availability of client systems or the platform.',
      '12. This Agreement is governed by the laws of the Federal Republic of Nigeria. Oreset may vary it for future engagements by notice through the platform; continuing to accept assignments after notice is acceptance.',
      '',
      'By accepting, you confirm you have read this Agreement and agree to it. Oreset records your name, tester code, the version accepted, the date and time, and the IP address.',
    ].join('\n'),
  },
  nda: {
    type: 'nda',
    label: AGREEMENT_TYPE_LABELS.nda,
    version: '2.0',
    summary: 'Everything you learn about clients, their systems, their customers, other testers and Oreset methods stays confidential, indefinitely.',
    text: [
      'SCHEDULE A. CONFIDENTIALITY, version 2.0',
      '',
      '1. Confidential information is everything you learn through Oreset that is not public: who our clients are; the design, prompts, tools, policies, weaknesses and behaviour of their AI systems; anything about their customers; Oreset scenarios, rubrics, methods, taxonomy, tooling, rates and plans; the identities and work of other testers; and the content and outcome of your own engagements.',
      '2. You will use confidential information only to do your assigned work, keep it inside the platform, and not disclose it to anyone: not family, colleagues, employers, other testers not on the same engagement, or the client directly. You will not post about it anywhere in any form, including anonymised stories that could be recognised.',
      '3. These obligations last indefinitely. A weakness in a client system stays dangerous knowledge for years. They survive the end of your Agreement without limit.',
      '4. Exceptions: information that becomes public without your breach, and information you are legally compelled to disclose, provided you tell Oreset first where lawful and disclose only what is required.',
      '5. Breach means immediate termination, forfeiture of unpaid amounts for the affected engagement, and legal action including injunctions and damages. Oreset will notify the affected client where required.',
    ].join('\n'),
  },
  code_of_conduct: {
    type: 'code_of_conduct',
    label: AGREEMENT_TYPE_LABELS.code_of_conduct,
    version: '2.0',
    summary: 'Stay inside the Rules of Engagement, prove without damaging, report honestly, keep your account personal, respect people, disclose conflicts.',
    text: [
      'SCHEDULE B. CODE OF CONDUCT, version 2.0',
      '',
      'You will:',
      '1. Stay inside the Rules of Engagement for each client, exactly as written. When unsure, stop and ask the lead auditor.',
      '2. Use only the access provided through the Oreset workspace and the test accounts provided. Never test a client system from personal accounts or outside the platform unless the Rules of Engagement expressly say so.',
      '3. Report every finding honestly, with real evidence. Never exaggerate severity, fabricate reproduction, or resubmit another tester\'s finding.',
      '4. Demonstrate a weakness only to the minimum extent that proves it. Proof of concept, never damage.',
      '5. Report immediately, and never copy or keep, any real customer data, credentials or out-of-scope access you encounter.',
      '6. Keep your account personal, and keep your contact, identity and bank details current.',
      '7. Treat Oreset staff, clients and other testers with respect. Disputes go through the platform, not through pressure or public complaint.',
      '8. Disclose conflicts of interest before starting an engagement.',
      '',
      'You will not:',
      '9. Exploit a finding beyond proof, move into systems not named in the Rules of Engagement, degrade availability, or attack infrastructure, third parties or people.',
      '10. Disclose a finding to anyone outside Oreset, including the client.',
      '11. Use Oreset scenarios, client information or techniques learned here in bug bounties, for other clients, or in publications or talks without written consent.',
      '12. Collude with other testers to inflate or duplicate findings, or work while impaired.',
      '',
      'Violations range from a written warning to immediate removal and legal action, as set out in the Tester Standard.',
    ].join('\n'),
  },
  data_handling: {
    type: 'data_handling',
    label: AGREEMENT_TYPE_LABELS.data_handling,
    version: '2.0',
    summary: 'Client material stays inside the workspace; evidence is uploaded then deleted locally; real personal data is reported, never kept; your devices are locked and encrypted.',
    text: [
      'SCHEDULE C. DATA HANDLING UNDERTAKING, version 2.0',
      '',
      '1. Client material (prompts, responses, screenshots, transcripts, documents) is viewed and handled inside the Oreset workspace only. No local copies, no personal cloud storage, no messaging apps, no AI tools outside the platform.',
      '2. Evidence you capture is uploaded to the finding and then deleted from your device. You will not keep a personal archive.',
      '3. If you encounter personal data of a client\'s customers or any real person: stop that line of testing; do not copy, screenshot or retain it; record only the category of data (for example "real customer name and balance visible"); notify the lead auditor immediately.',
      '4. Your devices used for Oreset work have a screen lock, full-disk encryption and current updates, and are not shared with others while signed in. Oreset may ask you to confirm this.',
      '5. Lost or stolen device, or any suspected compromise of your account or device: tell Oreset within one hour.',
      '6. When an engagement ends, and when your Agreement ends, you delete any residual material and confirm in writing when asked.',
      '7. Oreset processes your personal data, including identity data, as described in its Privacy Notice. You have rights under the Nigeria Data Protection Act 2023, which you can exercise at privacy@oreset.africa.',
    ].join('\n'),
  },
  identity_account: {
    type: 'identity_account',
    label: AGREEMENT_TYPE_LABELS.identity_account,
    version: '2.0',
    summary: 'Your account is yours alone. Sharing it, or letting anyone else work under your name, ends the relationship.',
    text: [
      'SCHEDULE D. IDENTITY AND ACCOUNT UNDERTAKING, version 2.0',
      '',
      '1. Your Oreset account is personal to you, the person whose identity Oreset verified. Only you will sign in to it and only you will perform work under it.',
      '2. You will not share your password, session, one-time codes, devices while signed in, or any access with anyone. You will not let anyone else complete, assist with, or "help" your scenarios under your name. You will not sell, lend or transfer your account.',
      '3. You will use two-factor authentication when offered and keep your recovery methods current and private.',
      '4. Oreset monitors sign-in location, device and activity patterns for security. Unusual patterns may pause your queue and prompt questions. Answering honestly resolves most flags (travel, a new laptop). Refusing to answer is treated as a breach.',
      '5. Sharing your account, or allowing anyone else to work under your name, is a material breach: your access is suspended immediately, all sessions are ended, affected clients are informed, unpaid amounts for the affected period are withheld, and your Agreement will be terminated after review. Oreset may pursue legal remedies.',
      '6. You will tell Oreset within one hour if you believe anyone else has accessed your account.',
    ].join('\n'),
  },
}

export const AGREEMENT_ORDER: readonly AgreementType[] = AGREEMENT_TYPES

export function hashAgreementText(text: string) {
  return createHash('sha256').update(text).digest('hex')
}
