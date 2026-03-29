"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const feedback_controller_1 = require("../controllers/feedback.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.use((0, auth_middleware_1.requireRole)([client_1.UserRole.ADMIN, client_1.UserRole.SUPERADMIN]));
router.get('/trial', feedback_controller_1.FeedbackController.getTrialFeedback);
router.post('/trial', feedback_controller_1.FeedbackController.submitTrialFeedback);
exports.default = router;
//# sourceMappingURL=feedback.routes.js.map