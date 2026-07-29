import { Router } from 'express';
import * as customerController from '../controllers/customerController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate, validateParams } from '../middleware/validate.js';
import { z } from 'zod';

const router = Router();
router.use(authenticate);

const idSchema = z.object({ params: z.object({ id: z.string().regex(/^[0-9a-fA-F]{24}$/) }) });

router.route('/')
  .get(customerController.getAllCustomers)
  .post(customerController.createCustomer);

router.route('/:id')
  .all(validateParams(idSchema))
  .get(customerController.getCustomer)
  .patch(customerController.updateCustomer)
  .delete(authorize('admin', 'manager'), customerController.deleteCustomer);

export default router;