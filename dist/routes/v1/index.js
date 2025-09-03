"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const roadmap_1 = __importDefault(require("./roadmap"));
const post_1 = __importDefault(require("./post"));
const user_1 = __importDefault(require("./user"));
const check_token_1 = __importDefault(require("../../middlewares/check.token"));
const router = (0, express_1.Router)();
router.use("/roadmap", check_token_1.default, roadmap_1.default);
router.use("/post", check_token_1.default, post_1.default);
router.use("/user", user_1.default);
exports.default = router;
