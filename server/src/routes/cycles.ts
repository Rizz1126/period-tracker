import express from 'express';
import { requireAuth, AuthRequest } from '../middleware/authMiddleware.js';
import { createCycle, getActiveCycle, getCyclesByUser, updateCycle } from '../services/cycleService.js';
import { z } from 'zod';

const router = express.Router();

const cycleSchema = z.object({
  startDate: z.string().min(1),
  endDate: z.string().optional(),
  averageLength: z.number().int().positive().optional(),
  flowIntensity: z.string().optional(),
  notes: z.string().optional(),
});

router.use(requireAuth);

router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const cycles = await getCyclesByUser(req.user!.userId);
    res.json(cycles);
  } catch (error) {
    next(error);
  }
});

router.get('/active', async (req: AuthRequest, res, next) => {
  try {
    const activeCycle = await getActiveCycle(req.user!.userId);
    res.json(activeCycle);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req: AuthRequest, res, next) => {
  try {
    const payload = cycleSchema.parse(req.body);
    const cycle = await createCycle(req.user!.userId, payload);
    res.status(201).json(cycle);
  } catch (error) {
    next(error);
  }
});

router.patch('/:cycleId', async (req: AuthRequest, res, next) => {
  try {
    const cycleId = Number(req.params.cycleId);
    const payload = cycleSchema.partial().parse(req.body);
    const updated = await updateCycle(cycleId, req.user!.userId, payload);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

export default router;
