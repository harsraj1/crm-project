import { Router } from 'express';
import * as customerController from '../controllers/customerController.js';
import { authenticate } from '../middleware/auth.js';
import { validate, validateParams, validateQuery } from '../middleware/validate.js';
import { customerSchema } from '../validators/schemas.js';
import { z } from 'zod';

const router = Router();
router.use(authenticate);

const idSchema = z.object({ id: z.string().regex(/^[0-9a-fA-F]{24}$/) });
const querySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  status: z.enum(['prospect', 'active', 'inactive', 'churned']).optional(),
  search: z.string().optional(),
  sort: z.string().optional().default('-createdAt')
});

router.route('/')
  .get(validateQuery(querySchema), customerController.getAllCustomers)
  .post(validate(customerSchema), customerController.createCustomer);

router.route('/:id')
  .all(validateParams(idSchema))
  .get(customerController.getCustomer)
  .patch(validate(customerSchema.partial()), customerController.updateCustomer)
  .delete(customerController.deleteCustomer);

export default router;
