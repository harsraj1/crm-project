import { z } from 'zod';

export const registerSchema = z.object({
    name: z.string().min(2).max(50),
    email: z.string().email(),
    password: z.string().min(8).max(128)
});

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1)
});

export const updatePasswordSchema = z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8).max(128)
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email()
});

export const leadSchema = z.object({
    name: z.string().min(1).max(100),
    email: z.string().email(),
    phone: z.string().optional(),
    company: z.string().max(100).optional(),
    status: z.enum(['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed-won', 'closed-lost']).optional(),
    value: z.number().min(0).optional(),
    source: z.enum(['website', 'referral', 'cold-call', 'email', 'social', 'event', 'other']).optional(),
    assignedTo: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    tags: z.array(z.string()).optional(),
    notes: z.string().max(5000).optional(),
    nextFollowUp: z.string().datetime().optional()
});

export const activitySchema = z.object({
    type: z.enum(['call', 'email', 'meeting', 'note', 'task']),
    subject: z.string().min(1).max(200),
    description: z.string().max(5000).optional(),
    duration: z.number().min(0).optional(),
    outcome: z.string().optional(),
    nextFollowUp: z.string().datetime().optional()
});

export const customerSchema = z.object({
    firstName: z.string().min(1).max(50),
    lastName: z.string().min(1).max(50),
    email: z.string().email(),
    phone: z.string().optional(),
    company: z.string().max(100).optional(),
    status: z.enum(['prospect', 'active', 'inactive', 'churned']).optional(),
    assignedTo: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    tags: z.array(z.string()).optional(),
    notes: z.string().max(5000).optional(),
    lifetimeValue: z.number().min(0).optional()
});

export const idSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format')
  })
});

export const querySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
    sort: z.string().optional(),
    search: z.string().optional()
  })
});

// Validation middleware factory
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: result.error.flatten().fieldErrors
    });
  }
  req.body = result.data;
  next();
};

export const validateParams = (schema) => (req, res, next) => {
  const result = schema.safeParse({ params: req.params });
  if (!result.success) {
    return res.status(400).json({ success: false, error: 'Invalid parameters' });
  }
  next();
};

export const validateQuery = (schema) => (req, res, next) => {
  const result = schema.safeParse({ query: req.query });
  if (!result.success) {
    return res.status(400).json({ success: false, error: 'Invalid query parameters' });
  }
  next();
};
