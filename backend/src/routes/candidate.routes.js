import { Router } from 'express';
import { getCandidates, createCandidate, updateCandidate, deleteCandidate } from '../controllers/candidate.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';

const router = Router();

// Endpoint público para obtener candidatos (sin token) o el middleware se aplica según la necesidad.
// La votación requiere candidatos, se usa un endpoint público o se omiten middlewares aquí y se usa en otro lado.
// Por ahora, getCandidates público.
router.get('/', getCandidates);

// Rutas protegidas
router.post('/', verifyToken, upload.single('image'), createCandidate);
router.put('/:id', verifyToken, upload.single('image'), updateCandidate);
router.delete('/:id', verifyToken, deleteCandidate);

export default router;
