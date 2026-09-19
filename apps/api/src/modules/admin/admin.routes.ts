import { Router } from 'express'
import { asyncHandler } from '../../lib/async-handler'
import { requireAuth } from '../../middleware/auth'
import { requireModule, requireStaff } from '../../middleware/modules'
import * as controller from './admin.controller'
import * as peopleController from './people.controller'
import { accessRouter } from '../access/access.routes'

export const adminRouter = Router()

// Access to each module is by role default or by an approved grant.
// See packages/shared ROLE_DEFAULT_MODULES and middleware/modules.ts.
adminRouter.use('/access', accessRouter)

const people = requireModule('people')
adminRouter.get('/people', requireAuth, people, asyncHandler(peopleController.list))
adminRouter.post('/staff', requireAuth, people, asyncHandler(peopleController.createStaff))
adminRouter.patch('/users/:id', requireAuth, people, asyncHandler(peopleController.updateUser))
adminRouter.post('/users/:id/reset-password', requireAuth, people, asyncHandler(peopleController.resetPassword))

adminRouter.get('/clients', requireAuth, requireModule('clients'), asyncHandler(peopleController.clients))

// Home is for every staff member; what it shows depends on their modules.
adminRouter.get('/overview', requireAuth, requireStaff, asyncHandler(controller.overview))

adminRouter.get('/regressions', requireAuth, requireModule('regressions'), asyncHandler(controller.regressionSuite))
adminRouter.get('/regressions/stats', requireAuth, requireModule('regressions'), asyncHandler(controller.regressionStats))

adminRouter.get('/operators/performance', requireAuth, requireModule('testers'), asyncHandler(controller.operatorPerformance))
