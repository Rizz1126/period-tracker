import express from 'express';
import { z } from 'zod';
import { requireAuth, AuthRequest } from '../middleware/authMiddleware.js';
import { createDailyLog, getLogsForCycle, getLogsForUser } from '../services/logService.js';

const router = express.Router();

const logSchema = z.object({
  cycleId: z.number().int(),
  logDate: z.string().min(1),
  mood: z.string().optional(),
  symptoms: z.array(z.string()).optional(),
  flow: z.string().optional(),
  temperature: z.string().optional(),
  note: z.string().optional(),
});

router.use(requireAuth);

router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const logs = await getLogsForUser(req.user!.userId);
    res.json(logs);
  } catch (error) {
    next(error);
  }
});

router.get('/:cycleId', async (req: AuthRequest, res, next) => {
  try {
    const cycleId = Number(req.params.cycleId);
    const logs = await getLogsForCycle(req.user!.userId, cycleId);
    res.json(logs);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req: AuthRequest, res, next) => {
  try {
    const payload = logSchema.parse(req.body);
    const logEntry = await createDailyLog(req.user!.userId, payload.cycleId, payload);
    res.status(201).json(logEntry);
  } catch (error) {
    next(error);
  }
});

export default router;
