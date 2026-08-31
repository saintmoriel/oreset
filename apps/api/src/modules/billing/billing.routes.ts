import { Router } from 'express'
import { asyncHandler } from '../../lib/async-handler'
import { requireAuth } from '../../middleware/auth'
import { requireRole } from '../../middleware/rbac'
import * as controller from './billing.controller'

export const billingRouter = Router()

billingRouter.post('/invoices', requireAuth, requireRole('buyer'), asyncHandler(controller.createInvoice))
billingRouter.get('/invoices', requireAuth, requireRole('buyer'), asyncHandler(controller.myInvoices))
billingRouter.get('/invoices/stats', requireAuth, requireRole('buyer'), asyncHandler(controller.myInvoiceStats))
billingRouter.get('/verify', requireAuth, requireRole('buyer'), asyncHandler(controller.verifyPayment))
billingRouter.get('/callback', asyncHandler(controller.paymentCallback))
billingRouter.post('/flutterwave-webhook', asyncHandler(controller.flutterwaveWebhook))
