export type InputType = 'audio' | 'text' | 'document' | 'conversation'

export type VerificationScope = 'language' | 'full'

export type InterpretationAccuracy = 'correct' | 'minor' | 'major' | 'critical'

export type OutcomeVerdict =
  | 'defensible'
  | 'not_defensible_language'
  | 'not_defensible_reasoning'
  | 'inconclusive'

export type CaseSeverity = 1 | 2 | 3 | 4 | 5

export type LanguageSegment = {
  id: string
  startIndex: number
  endIndex: number
  language: string
}

export type MisreadPhrase = {
  id: string
  original: string
  correctMeaning: string
}

export type TemplateField = {
  id: string
  label: string
  type: 'select' | 'text' | 'multiselect'
  options?: string[]
  value: string
}

export type StructuredTemplate = {
  id: string
  language: string
  domain: string
  fields: TemplateField[]
}

export type ConversationTurn = {
  id: string
  role: 'customer' | 'ai' | 'agent'
  content: string
  language?: string
  isDecisionPoint?: boolean
}

export type CaseInput =
  | { type: 'audio'; audioUrl: string; transcript: string; aiInterpretation: string }
  | { type: 'text'; originalText: string; aiInterpretation: string }
  | { type: 'document'; imageUrl: string; aiExtraction: string }
  | { type: 'conversation'; turns: ConversationTurn[]; aiDecisionSummary: string }

export type ReviewCase = {
  id: string
  domain: 'claims' | 'lending' | 'government' | 'healthcare'
  scope: VerificationScope
  input: CaseInput
  aiDecision: string
  aiOutcome: string
  decisionCriteria: string | null
  language: string
  createdAt: string
  isDualSolve: boolean
  isGoldStandard: boolean
}

export type Step1Result = {
  accuracy: InterpretationAccuracy
  segments: LanguageSegment[]
  misreadPhrases: MisreadPhrase[]
  templateFields: TemplateField[]
  committedAt: string
}

export type Step2Result = {
  verdict: OutcomeVerdict
  severity: CaseSeverity
  evidenceSummary: string
  submittedAt: string
}

export type ReviewSubmission = {
  caseId: string
  step1: Step1Result
  step2: Step2Result
  totalTimeMs: number
  step1TimeMs: number
  step2TimeMs: number
  replayCount?: number
}
