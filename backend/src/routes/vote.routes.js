import { Router } from 'express';
import { validateStudent, registerVote, validateStudentSchema, voteSchema } from '../controllers/vote.controller.js';
import { validate } from '../middlewares/validate.middleware.js';

const router = Router();

router.post('/validate', validate(validateStudentSchema), validateStudent);
router.post('/register', validate(voteSchema), registerVote);

export default router;
