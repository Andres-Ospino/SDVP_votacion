import { Router } from 'express';
import { getDashboardStats, getRanking, getParticipationByGrade, getDetailedVotes } from '../controllers/stats.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(verifyToken);

router.get('/dashboard', getDashboardStats);
router.get('/ranking', getRanking);
router.get('/participation', getParticipationByGrade);
router.get('/votes', getDetailedVotes);

export default router;
