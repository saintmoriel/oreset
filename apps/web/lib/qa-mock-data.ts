export const DEFECT_TAGS = [
  { code: 'ERR-01', label: 'Acoustic / environmental noise' },
  { code: 'ERR-02', label: 'Linguistic mismatch' },
  { code: 'ERR-03', label: 'Truncation / trailing-off' },
  { code: 'ERR-04', label: 'Compliance / metadata anomaly' },
] as const

export const QA_QUEUE_ITEMS = [
  { id: 'sess_8f2a3c', duration: '0:04', flag: null, prompt: 'Ọmọ tí kò gbọ́n ni ń jẹ èpò lọ́wọ́ ìyá rẹ̀.' },
  { id: 'sess_1b7de9', duration: '0:06', flag: null, prompt: 'Ẹní bá lọ sí oko ní yóò rí ìre oko.' },
  { id: 'sess_c4a012', duration: '0:03', flag: 'ERR-02' as const, prompt: 'Bí a bá fẹ́ jẹun, a máa fọ ọwọ́.' },
  { id: 'sess_902fbe', duration: '0:05', flag: null, prompt: 'Ọjọ́ gbogbo là ń kọ́ ẹ̀kọ́ tuntun.' },
] as const
