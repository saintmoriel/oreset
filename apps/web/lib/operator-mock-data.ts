export const CLIENT_PLACEMENT = {
  clientName: 'FirstBank AI Chatbot QA',
  description: 'Live placement · reviewing production chatbot transcripts against the client SOP brief.',
}

export const SEVERITY_LEVELS = [
  { code: 'SEV-1', label: 'Critical — blocks release' },
  { code: 'SEV-2', label: 'Major — needs fix before next cycle' },
  { code: 'SEV-3', label: 'Minor — track and monitor' },
] as const

export const ERR_TAGS = [
  { code: 'ERR-01', label: 'Acoustic / environmental noise' },
  { code: 'ERR-02', label: 'Linguistic mismatch' },
  { code: 'ERR-03', label: 'Truncation / trailing-off' },
  { code: 'ERR-04', label: 'Compliance / metadata anomaly' },
] as const

export const CLIENT_QUEUE_ITEMS = [
  {
    id: 'txn_5521a',
    transcript: 'Customer: "Why was my transfer declined?" · Bot: "Please contact your branch for transfer issues."',
  },
  {
    id: 'txn_5521b',
    transcript: 'Customer: "How do I reset my PIN?" · Bot: "Go to Settings > Security > Reset PIN, then verify with OTP."',
  },
  {
    id: 'txn_5521c',
    transcript: 'Customer: "What\'s my account balance?" · Bot: "I can\'t access account details in this chat. Please use the app."',
  },
  {
    id: 'txn_5521d',
    transcript: 'Customer: "Is the app down?" · Bot: "Yes, contact your branch for transfer issues."',
  },
] as const
