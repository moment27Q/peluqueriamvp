import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { asyncHandler } from '../middleware/error.middleware';

export class FeedbackController {
  // GET /api/feedback/trial
  static getTrialFeedback = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      res.status(400).json({ error: 'Tenant no válido' });
      return;
    }

    const feedback = await prisma.trialFeedback.findUnique({
      where: { tenantId },
      select: {
        id: true,
        rating: true,
        surveyAnswer: true,
        improvements: true,
        createdAt: true,
      },
    });

    res.json({
      success: true,
      submitted: !!feedback,
      data: feedback,
    });
  });

  // POST /api/feedback/trial
  static submitTrialFeedback = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.user?.tenantId;
    const userId = req.user?.userId;
    if (!tenantId) {
      res.status(400).json({ error: 'Tenant no válido' });
      return;
    }

    const { rating, surveyAnswer, improvements } = req.body;
    const numericRating = Number(rating);

    if (!Number.isFinite(numericRating) || numericRating < 1 || numericRating > 5) {
      res.status(400).json({ error: 'La calificación debe estar entre 1 y 5' });
      return;
    }

    const existing = await prisma.trialFeedback.findUnique({ where: { tenantId } });
    if (existing) {
      res.status(409).json({ error: 'La encuesta ya fue enviada' });
      return;
    }

    const feedback = await prisma.trialFeedback.create({
      data: {
        tenantId,
        userId,
        rating: numericRating,
        surveyAnswer: surveyAnswer?.trim() || null,
        improvements: improvements?.trim() || null,
      },
    });

    res.status(201).json({ success: true, data: feedback });
  });
}
