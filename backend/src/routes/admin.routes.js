import { Router } from 'express';
import { getAdmins, createAdmin, deleteAdmin } from '../controllers/admin.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(verifyToken);

router.get('/', getAdmins);
router.post('/', createAdmin);
router.delete('/:id', deleteAdmin);

export default router;
