"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedbackController = void 0;
const database_1 = require("../config/database");
const error_middleware_1 = require("../middleware/error.middleware");
class FeedbackController {
}
exports.FeedbackController = FeedbackController;
_a = FeedbackController;
// GET /api/feedback/trial
FeedbackController.getTrialFeedback = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
        res.status(400).json({ error: 'Tenant no válido' });
        return;
    }
    const feedback = await database_1.prisma.trialFeedback.findUnique({
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
FeedbackController.submitTrialFeedback = (0, error_middleware_1.asyncHandler)(async (req, res) => {
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
    const existing = await database_1.prisma.trialFeedback.findUnique({ where: { tenantId } });
    if (existing) {
        res.status(409).json({ error: 'La encuesta ya fue enviada' });
        return;
    }
    const feedback = await database_1.prisma.trialFeedback.create({
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
//# sourceMappingURL=feedback.controller.js.map