import type { Request, Response } from 'express'
import { z } from 'zod'
import * as operatorsService from './operators.service'
import { setSessionCookies, requestContext } from '../../lib/session-cookies'

const languageRowSchema = z.object({ language: z.string().min(1), fluency: z.string().min(1) })

const applySchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(8),
  password: z.string().min(8),
  location: z.string().min(1),
  languages: z.array(languageRowSchema).min(1),
  dialect: z.string().optional(),
  academicBackground: z.string().min(1),
  englishProficiency: z.string().min(1),
  availability: z.array(z.string()).optional(),
  experience: z.string().optional(),
})

export async function apply(req: Request, res: Response) {
  const body = applySchema.parse(req.body)
  const { user } = await operatorsService.apply(body)
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
