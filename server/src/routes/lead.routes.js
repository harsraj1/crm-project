import { Router } from 'express';
import * as leadController from '../controllers/leadController.js';
import { authenticate } from '../middleware/auth.js';
import { validate, validateParams, validateQuery } from '../middleware/validate.js';
import { activitySchema, leadSchema } from '../validators/schemas.js';
import { z } from 'zod';

const router = Router();

router.use(authenticate);

const idSchema = z.object({ id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID') });
const querySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  status: z.enum(['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed-won', 'closed-lost']).optional(),
  search: z.string().optional(),
  sort: z.string().optional().default('-createdAt')
});

router.route('/')
  .get(validateQuery(querySchema), leadController.getAllLeads)
  .post(validate(leadSchema), leadController.createLead);

router.get('/stats', leadController.getLeadStats);

router.route('/:id')
  .all(validateParams(idSchema))
  .get(leadController.getLead)
  .patch(validate(leadSchema.partial()), leadController.updateLead)
  .delete(leadController.deleteLead);

router.post('/:id/activities', validate(activitySchema), leadController.addActivity);
router.post('/:id/ai-summary', leadController.requestAiSummary);

export default router;
