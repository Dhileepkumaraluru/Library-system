"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const secretaryControllers_1 = require("../controllers/secretaryControllers");
const router = express_1.default.Router();
// Define the routes
router.post('/add', secretaryControllers_1.addSecretary);
router.delete('/remove/:id', secretaryControllers_1.removeSecretary);
router.post('/login', secretaryControllers_1.loginSecretary);
router.post('/logout', secretaryControllers_1.logoutSecretary);
exports.default = router;
