import { Router } from 'express';
import * as activityController from '../controllers/activityController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { activitySchema } from '../validators/schemas.js';
import { z } from 'zod';

const router = Router();
router.use(authenticate);

const idSchema = z.object({ params: z.object({ id: z.string().regex(/^[0-9a-fA-F]{24}$/) }) });
const leadIdSchema = z.object({ params: z.object({ leadId: z.string().regex(/^[0-9a-fA-F]{24}$/) }) });

router.get('/lead/:leadId', validateParams(leadIdSchema), activityController.getActivitiesByLead);
router.post('/lead/:leadId', validateParams(leadIdSchema), validate(activitySchema), activityController.createActivity);
router.patch('/:id', validateParams(idSchema), activityController.updateActivity);
router.delete('/:id', validateParams(idSchema), activityController.deleteActivity);

export default router;