import { Router } from 'express';
import { getElections, createElection, updateElectionStatus, getActiveElection, closePolls } from '../controllers/election.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = Router();

// Public
router.get('/active', getActiveElection);

// Protected
router.use(verifyToken);
router.get('/', getElections);
router.post('/', createElection);
router.put('/:id/status', updateElectionStatus);
router.post('/:id/close', closePolls);

export default router;
