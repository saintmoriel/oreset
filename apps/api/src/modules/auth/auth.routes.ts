import { Router } from 'express'
import { asyncHandler } from '../../lib/async-handler'
import { requireAuth } from '../../middleware/auth'
import * as controller from './auth.controller'

export const authRouter = Router()

authRouter.post('/otp/request', asyncHandler(controller.requestOtp))
authRouter.post('/otp/verify', asyncHandler(controller.verifyOtp))
authRouter.post('/login', asyncHandler(controller.login))
authRouter.post('/refresh', asyncHandler(controller.refresh))
authRouter.post('/logout', asyncHandler(controller.logout))
authRouter.get('/me', requireAuth, asyncHandler(controller.me))
