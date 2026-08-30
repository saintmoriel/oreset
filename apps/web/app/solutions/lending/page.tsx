'use client'

import { SolutionPageLayout, type SolutionPageData } from '@/components/solution-page-layout'

const data: SolutionPageData = {
  vertical: 'Lending & credit decisions',
  headline: "A misread transaction note shouldn't kill a credit score.",
  subheadline:
    "Digital lenders use AI to assess creditworthiness from transaction histories, M-Pesa notes, and chat messages. When the AI can't parse the language, it defaults to denial.",
  problem: {
    title: 'When the model reads a repayment promise as a default risk',
    description:
      'AI credit scoring increasingly pulls signals from unstructured text like transaction narrations, USSD session logs, and even WhatsApp payment confirmations. These signals are written in local languages and informal registers that models systematically misinterpret.',
    consequences: [
      {
        scenario: 'Transaction narration misclassified',
        impact:
          "A Swahili M-Pesa note reading \"kwa deni ya mama\" (for mother's debt) is flagged as the borrower having existing debt, when it's actually a repayment to a third party.",
      },
      {
        scenario: 'Informal promise parsed as uncertainty',
        impact:
          "A borrower's message \"I go pay you Friday walahi\" is scored as low-confidence intent because the model doesn't recognize Pidgin commitment markers.",
      },
      {
        scenario: 'Business income described in local terms',
        impact:
          'A trader describing revenue as "market dey move well" provides no parseable income figure to the model, so the loan is denied for "insufficient income evidence."',
      },
    ],
  },
  howItWorks: {
    steps: [
      {
        label: 'Submit a decision case',
        detail: "Send us the borrower's input data and the credit decision your model produced. We take it as-is.",
      },
      {
        label: 'Language-matched reviewer',
        detail: "A certified reviewer fluent in the borrower's language and familiar with financial products reviews the case.",
      },
      {
        label: 'Score comprehension',
        detail: 'Did the model correctly understand what the borrower communicated? Intent, context, and meaning verified independently.',
      },
      {
        label: 'Score the decision',
        detail: 'Given the correct interpretation, was the credit decision justified? Mismatch traced and severity-rated.',
      },
    ],
  },
  exampleCase: {
    title: 'Loan application, Pidgin English / Hausa mix',
    input:
      "Borrower's WhatsApp message to agent: \"Bros I go pay you Friday walahi, my market don open back. Na the rain been scatter everything last week.\"",
    failure:
      'NLP pipeline extracted: negative sentiment ("scatter everything"), no concrete income figure, hedging language ("I go pay"). Risk model scored this as high default probability and auto-declined the top-up loan.',
    caught:
      'Reviewer confirmed: borrower is communicating that their business has resumed after a weather disruption, with a firm commitment to repay on Friday. "Walahi" is a strong oath, not hedging. "Market don open back" is positive revenue signal. Understanding score: Failed.',
    severity:
      'High (Score 2/5). Creditworthy borrower denied access to working capital based on language misinterpretation. Business continuity disrupted.',
  },
  evidence: [
    {
      stat: '$147B+',
      detail: 'Moved daily through M-Pesa alone in Kenya. Transaction narrations in these flows are in local languages and informal registers.',
      source: 'Safaricom M-Pesa annual reporting, 2017',
    },
    {
      stat: '17M+',
      detail: "M-Pesa accounts in Kenya alone. Digital credit layered on top of mobile money touches millions whose financial language isn't English.",
      source: 'Safaricom / Wikipedia M-Pesa data',
    },
    {
      stat: '64 languages tested',
      detail: 'LLMs show "large performance gaps" on African languages across all NLU tasks, including intent classification, which is the core of credit signal extraction.',
      source: 'AfroBench, ACL 2025 Findings',
    },
  ],
}

export default function LendingPage() {
  return <SolutionPageLayout data={data} />
}
