import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { registerSchema, loginSchema, updatePasswordSchema, updateProfileSchema } from '../validators/schemas.js';

const router = Router();

router.post('/register', validate(registerSchema), authController.signup);
router.post('/login', validate(loginSchema), authController.login);
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.getMe);
router.patch('/me', authenticate, validate(updateProfileSchema), authController.updateMe);
router.patch('/update-password', authenticate, validate(updatePasswordSchema), authController.updatePassword);

export default router;
