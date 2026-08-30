'use client'

import { SolutionPageLayout, type SolutionPageData } from '@/components/solution-page-layout'

const data: SolutionPageData = {
  vertical: 'Government & public services',
  headline: "A citizen shouldn't lose access because the system doesn't speak their language.",
  subheadline:
    "Government AI systems like chatbots, eligibility screeners, and complaint routers increasingly gate access to public services. When they can't understand the citizen, the citizen loses.",
  problem: {
    title: 'When the chatbot routes a complaint to the wrong agency because it misread the language',
    description:
      'African governments are digitizing service delivery with AI-powered interfaces. But with 2,144 languages across the continent and most NLP models trained on fewer than 20, citizens communicating in their primary language are systematically misrouted, misclassified, or ignored.',
    consequences: [
      {
        scenario: 'Eligibility question misinterpreted',
        impact:
          'A citizen applying for social benefits in Igbo describes household composition. The AI parses extended family references as multiple households, disqualifying them.',
      },
      {
        scenario: 'Complaint misrouted entirely',
        impact:
          "A Hausa-speaking citizen reports a water outage. The chatbot classifies the complaint as \"billing dispute\" because it can't parse the local term for infrastructure failure.",
      },
      {
        scenario: 'Identity verification rejected',
        impact:
          'A name with tonal diacritics or a patronymic structure is flagged as "inconsistent" against ID documents by an AI matching system trained on Western naming conventions.',
      },
    ],
  },
  howItWorks: {
    steps: [
      {
        label: 'Submit the interaction',
        detail: 'Send us the citizen\'s input and the system\'s decision: routing, classification, eligibility, or denial.',
      },
      {
        label: 'Matched reviewer assigned',
        detail: "A certified reviewer who speaks the citizen's language and understands the service domain reviews the case.",
      },
      {
        label: 'Verify understanding',
        detail: 'Did the system correctly understand what the citizen was asking or reporting? Scored independently.',
      },
      {
        label: 'Verify the decision',
        detail: 'Given the correct meaning, was the routing/eligibility/classification decision appropriate? Traced and scored.',
      },
    ],
  },
  exampleCase: {
    title: 'Social benefit application, Igbo language',
    input:
      "Citizen applies for a household subsidy via government portal. In the household section, they write in Igbo: \"Anyi bi n'otu — nne m, nna m, ịnwa m atọ\" (We live together — my mother, my father, my three siblings).",
    failure:
      'The AI eligibility screener parsed "nne m, nna m" as separate household heads and classified this as a multi-household application, which is ineligible for the single-household subsidy program. Application auto-rejected.',
    caught:
      'Reviewer confirmed: the citizen described one household with parents and siblings. This is a standard single-household structure. The AI misread family relationship terms as household boundary markers. Understanding score: Failed.',
    severity:
      'Critical (Score 1/5). Eligible citizen denied social benefits. No recourse path was offered in their language.',
  },
  evidence: [
    {
      stat: '2,144',
      detail: 'Languages spoken across Africa. Most government AI systems support fewer than 5, creating a digital exclusion layer over physical service delivery.',
      source: 'Ethnologue, 2024',
    },
    {
      stat: '371 ethnic groups',
      detail: 'In Nigeria alone. Language is explicitly cited as "a barrier to accessing health information and ensuring patient safety." The same applies to every digitized public service.',
      source: 'Wikipedia / Healthcare in Nigeria, citing WHO data',
    },
    {
      stat: '<20 languages',
      detail: 'Served by any single regional LLM. The gap between "languages spoken" and "languages understood by AI" defines who gets excluded from digital government.',
      source: 'AfroBench survey of commercial LLMs, 2025',
    },
  ],
}

export default function GovernmentPage() {
  return <SolutionPageLayout data={data} />
}
