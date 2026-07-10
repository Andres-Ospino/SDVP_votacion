import { Router } from 'express';
import { loginAdmin, loginSchema } from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validate.middleware.js';

const router = Router();

router.post('/login', validate(loginSchema), loginAdmin);

export default router;
