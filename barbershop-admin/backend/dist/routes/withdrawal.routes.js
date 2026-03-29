"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const withdrawal_controller_1 = require("../controllers/withdrawal.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rate_limit_middleware_1 = require("../middleware/rate-limit.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate, auth_middleware_1.requireAdmin);
router.get('/', withdrawal_controller_1.WithdrawalController.getAll);
router.put('/:id/status', rate_limit_middleware_1.apiLimiter, withdrawal_controller_1.WithdrawalController.updateStatus);
exports.default = router;
//# sourceMappingURL=withdrawal.routes.js.map