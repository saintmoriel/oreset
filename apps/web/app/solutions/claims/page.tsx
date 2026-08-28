'use client'

import { SolutionPageLayout, type SolutionPageData } from '@/components/solution-page-layout'

const data: SolutionPageData = {
  vertical: 'Claims & payouts',
  headline: 'A language error shouldn’t decide who gets paid.',
  subheadline:
    'Insurance claims described in Pidgin, Yoruba, or Hausa get auto-denied when AI misreads intent as incompleteness. Oreset verifies that the decision matched what was actually said.',
  problem: {
    title: 'When the AI hears "I no fit work" and reads refusal instead of disability',
    description:
      'Claims processing AI is trained on English-first data. When a claimant describes their situation in Nigerian Pidgin or another African language, the system parses unfamiliar syntax as missing information — and denies the claim automatically.',
    consequences: [
      {
        scenario: 'Pidgin description parsed as incomplete',
        impact:
          'A valid claim is auto-rejected because "I no fit work since that time" doesn’t match the expected English-language injury template.',
      },
      {
        scenario: 'Code-switched explanation flagged as inconsistent',
        impact:
          'A claimant mixing Hausa and English across form fields triggers fraud-detection heuristics designed for monolingual inputs.',
      },
      {
        scenario: 'Voice note transcription collapses meaning',
        impact:
          'An ASR system transcribes a Yoruba voice note into garbled English, losing the causal detail that proves the claim is valid.',
      },
    ],
  },
  howItWorks: {
    steps: [
      {
        label: 'Submit a real case',
        detail: 'Send us the claim as-is — voice note, form text, or transcription. We take it in the language it arrived.',
      },
      {
        label: 'Route to a matched reviewer',
        detail: 'A certified reviewer who speaks the claimant’s language and understands the insurance domain receives the case.',
      },
      {
        label: 'Check understanding',
        detail: 'Did the AI correctly interpret what the claimant said? The reviewer scores comprehension independently of outcome.',
      },
      {
        label: 'Check the decision',
        detail: 'Given what was actually said, was the deny/approve decision correct? Severity-scored and traced.',
      },
    ],
  },
  exampleCase: {
    title: 'Motor accident claim — Nigerian Pidgin',
    input:
      '"I no fit work since that motor jam me for road. My hand no dey do anything again." — Submitted via voice note, transcribed by insurer’s ASR.',
    failure:
      'ASR transcribed as "I no fit work... hand nothing again." Claims AI parsed this as an incomplete submission (missing injury detail, no medical reference) and auto-denied.',
    caught:
      'Reviewer confirmed: claimant described a motor accident causing loss of hand function. The statement contains a clear injury, clear causation, and clear functional impact. Understanding score: Failed. The AI missed the meaning entirely.',
    severity:
      'Critical (Score 1/5) — Valid claim denied. Claimant left without payout due to language misinterpretation, not insufficient evidence.',
  },
  evidence: [
    {
      stat: '64 languages',
      detail: 'AfroBench (ACL 2025) tested LLMs across 64 African languages and found "large gaps in performance" vs. English on every task.',
      source: 'Ogundepo et al., AfroBench, ACL 2025 Findings',
    },
    {
      stat: '74.85%',
      detail: 'Of health expenditure in Nigeria is private/out-of-pocket. When claims are wrongly denied, there is no safety net.',
      source: 'WHO / World Bank national health accounts',
    },
    {
      stat: 'Below-par',
      detail: 'Commercial LLMs produce "below-par performance" on African languages, especially in comprehension tasks involving informal speech.',
      source: 'Ojo & Ogueji, AfricanNLP Workshop, ICLR 2023',
    },
  ],
}

export default function ClaimsPage() {
  return <SolutionPageLayout data={data} />
}
