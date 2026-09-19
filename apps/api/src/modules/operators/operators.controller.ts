import type { Request, Response } from 'express'
import { z } from 'zod'
import * as operatorsService from './operators.service'
import { sendMail } from '../../lib/mail'
import { env } from '../../config/env'
import { setSessionCookies, requestContext } from '../../lib/session-cookies'

const languageRowSchema = z.object({ language: z.string().min(1), fluency: z.string().min(1) })

const applySchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email(),
  phone: z.string().trim().min(8).max(40),
  password: z.string().min(8).max(200),
  location: z.string().trim().min(1).max(120),
  languages: z.array(languageRowSchema).min(1),
  securityExperienceYears: z.enum(['none', 'under_2', '2_to_5', 'over_5']),
  experience: z.string().trim().min(20).max(4000),
  aiRedTeamExposure: z.string().trim().max(4000).optional(),
  tools: z.string().trim().max(1000).optional(),
  workSample: z.string().trim().min(80).max(6000),
  portfolioUrl: z.string().trim().url().max(300).optional().or(z.literal('')),
  availability: z.array(z.string()).optional(),
})

export async function apply(req: Request, res: Response) {
  const body = applySchema.parse(req.body)
  const { user } = await operatorsService.apply(body)

  void sendMail({
    to: body.email,
    subject: 'We received your Oreset Red Team application',
    text: [
      `Hi ${body.name.split(' ')[0]},`,
      '',
      `Thanks for applying. Your tester code is ${user.operatorCode ?? 'in your profile'}.`,
      '',
      'A lead auditor reviews every application before anyone sees client scenarios. Most decisions take a few working days, and you will get an email either way.',
      '',
      `You can sign in to see your status at ${env.WEB_PUBLIC_URL}/operator`,
      '',
      'Oreset Red Team',
    ].join('\n'),
  })

  res.status(201).json({ user })
}

export async function certify(req: Request, res: Response) {
  const { user, accessToken, refreshToken } = await operatorsService.certify(
    req.user!.sub,
    requestContext(req),
  )
  setSessionCookies(res, accessToken, refreshToken)
  res.status(200).json({ user })
}

export async function listApplications(_req: Request, res: Response) {
  const applications = await operatorsService.listApplications()
  res.status(200).json({ applications })
}
