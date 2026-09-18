import { env, isProduction } from '../config/env'

// One door for every email the system sends. Uses Resend's HTTP API when a
// key is configured; otherwise logs the message so the flow still completes
// in development and the content can be read in the API console.

export type Mail = {
  to: string | string[]
  subject: string
  text: string
  replyTo?: string
}

export const mailEnabled = Boolean(env.RESEND_API_KEY)

export async function sendMail(mail: Mail): Promise<{ sent: boolean; id?: string }> {
  if (!env.RESEND_API_KEY) {
    if (!isProduction) {
      console.log(`[mail:not-sent] to=${Array.isArray(mail.to) ? mail.to.join(',') : mail.to} subject="${mail.subject}"\n${mail.text}\n`)
    }
    return { sent: false }
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: env.MAIL_FROM,
        to: Array.isArray(mail.to) ? mail.to : [mail.to],
        subject: mail.subject,
        text: mail.text,
        ...(mail.replyTo ? { reply_to: mail.replyTo } : {}),
      }),
      signal: AbortSignal.timeout(10_000),
    })
    if (!res.ok) {
      console.error(`[mail:error] ${res.status} ${await res.text().catch(() => '')}`)
      return { sent: false }
    }
    const body = (await res.json().catch(() => ({}))) as { id?: string }
    return { sent: true, id: body.id }
  } catch (err) {
    console.error('[mail:error]', (err as Error).message)
    return { sent: false }
  }
}
