import { Router } from 'express';
import { getStudents, createStudent, updateStudent, deleteStudent, createBulkStudents } from '../controllers/student.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(verifyToken);

router.get('/', getStudents);
router.post('/', createStudent);
router.post('/bulk', createBulkStudents);
router.put('/:id', updateStudent);
router.delete('/:id', deleteStudent);

export default router;
