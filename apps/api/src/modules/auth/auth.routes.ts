import { Router } from 'express'
import { asyncHandler } from '../../lib/async-handler'
import { requireAuth, sessionOnly } from '../../middleware/auth'
import * as controller from './auth.controller'

export const authRouter = Router()

authRouter.post('/otp/request', asyncHandler(controller.requestOtp))
authRouter.post('/otp/verify', asyncHandler(controller.verifyOtp))
authRouter.post('/login', asyncHandler(controller.login))

// Two-factor: second sign-in step (no session yet), then management for a
// signed-in person. Management never accepts an API token.
authRouter.post('/mfa/verify', asyncHandler(controller.mfaVerify))
authRouter.get('/mfa/status', requireAuth, sessionOnly, asyncHandler(controller.mfaStatus))
authRouter.post('/mfa/setup', requireAuth, sessionOnly, asyncHandler(controller.mfaSetup))
authRouter.post('/mfa/enable', requireAuth, sessionOnly, asyncHandler(controller.mfaEnable))
authRouter.post('/mfa/disable', requireAuth, sessionOnly, asyncHandler(controller.mfaDisable))
authRouter.post('/mfa/recovery-codes', requireAuth, sessionOnly, asyncHandler(controller.mfaRecoveryCodes))
authRouter.post('/refresh', asyncHandler(controller.refresh))
authRouter.post('/logout', asyncHandler(controller.logout))
authRouter.post('/password/forgot', asyncHandler(controller.forgotPassword))
authRouter.post('/password/reset', asyncHandler(controller.resetPassword))
authRouter.get('/me', requireAuth, asyncHandler(controller.me))
