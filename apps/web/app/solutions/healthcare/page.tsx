'use client'

import { SolutionPageLayout, type SolutionPageData } from '@/components/solution-page-layout'

const data: SolutionPageData = {
  vertical: 'Healthcare',
  headline: "A misunderstood symptom shouldn't become a missed diagnosis.",
  subheadline:
    "AI triage systems, symptom checkers, and telehealth bots are entering African healthcare. When they can't parse how patients describe pain, history, or medication in their own language, clinical decisions go wrong.",
  problem: {
    title: 'When "my body dey hot" gets triaged as low-priority instead of fever',
    description:
      "Healthcare AI tools are trained on clinical English. But patients in Africa describe symptoms using idioms, metaphors, and local terms that don't map to medical terminology. The AI doesn't fail loudly. It silently misclassifies, undertriages, or routes to the wrong specialist.",
    consequences: [
      {
        scenario: 'Symptom idiom missed entirely',
        impact:
          '"My body dey hot, my belle dey turn" (fever with nausea) is parsed as vague discomfort and triaged as non-urgent. A malaria case waits.',
      },
      {
        scenario: 'Medication adherence misread',
        impact:
          'A patient reporting in Yoruba that they "stopped the medicine because it was fighting my body" (adverse reaction) is classified as non-compliant rather than experiencing side effects.',
      },
      {
        scenario: 'Referral blocked by language mismatch',
        impact:
          "A community health worker's referral note in Hausa is summarized by AI as \"unclear complaint.\" The specialist never sees the clinical detail.",
      },
    ],
  },
  howItWorks: {
    steps: [
      {
        label: 'Submit the clinical interaction',
        detail: "Send us the patient input and the AI's triage/classification/routing decision. We handle any language or format.",
      },
      {
        label: 'Clinical + language reviewer',
        detail: 'A certified reviewer with both language fluency and health domain knowledge reviews the case.',
      },
      {
        label: 'Verify clinical understanding',
        detail: "Did the AI correctly interpret the patient's symptoms, history, and intent? Scored against what was actually communicated.",
      },
      {
        label: 'Verify the clinical decision',
        detail: 'Given correct understanding, was the triage/referral/classification appropriate? Severity scored with clinical context.',
      },
    ],
  },
  exampleCase: {
    title: 'Symptom triage, Nigerian Pidgin',
    input:
      'Patient to telehealth chatbot: "My body dey hot since three day. My belle dey do me somehow, I no fit chop. The pikin wey I born last month, e dey suck well but I weak."',
    failure:
      'Chatbot classified as: "General malaise, self-care advice." Recommended rest and hydration. Did not flag: postpartum fever (3 days), inability to eat, or potential puerperal infection risk in a breastfeeding mother.',
    caught:
      "Reviewer confirmed: patient is a postpartum mother with 3-day fever, appetite loss, and weakness while breastfeeding. This is a potential obstetric emergency (puerperal sepsis). The chatbot missed every clinical red flag because it couldn't parse Pidgin symptom descriptions. Understanding score: Failed.",
    severity:
      'Critical (Score 1/5). Life-threatening condition triaged as routine. Patient directed away from urgent care.',
  },
  evidence: [
    {
      stat: '<5%',
      detail: 'Of Nigerians have health insurance. When AI triage fails, patients pay out-of-pocket for the wrong treatment, or don\'t seek care at all.',
      source: 'WHO / World Bank, via Healthcare in Nigeria data',
    },
    {
      stat: '1M+ annually',
      detail: 'Nigerians pushed into poverty by health-related expenses. A misrouted case doesn\'t just delay care. It destroys household finances.',
      source: 'World Bank national health expenditure data',
    },
    {
      stat: 'Language = barrier',
      detail: '"A barrier to accessing health information and ensuring patient safety," explicitly documented in Nigeria\'s 371-ethnic-group healthcare system.',
      source: 'WHO country health profile / Wikipedia Healthcare in Nigeria',
    },
  ],
}

export default function HealthcarePage() {
  return <SolutionPageLayout data={data} />
}
