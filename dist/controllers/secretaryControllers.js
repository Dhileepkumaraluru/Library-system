"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logoutSecretary = exports.loginSecretary = exports.removeSecretary = exports.addSecretary = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Secretary_1 = __importDefault(require("../models/Secretary"));
const secretKey = process.env.JWT_SECRET_KEY || 'your-secret-key';
// Add Secretary
const addSecretary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        const existingSecretary = yield Secretary_1.default.findOne({ username });
        if (existingSecretary) {
            return res.status(400).json({ message: 'Username already exists' });
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const newSecretary = new Secretary_1.default({ username, password: hashedPassword });
        yield newSecretary.save();
        res.status(201).json({ message: 'Secretary added successfully' });
    }
    catch (error) {
        const err = error;
        res.status(500).json({ error: err.message });
    }
});
exports.addSecretary = addSecretary;
// Remove Secretary
const removeSecretary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username } = req.body;
        if (!username) {
            return res.status(400).json({ error: 'Username is required' });
        }
        const result = yield Secretary_1.default.findOneAndDelete({ username });
        if (!result) {
            return res.status(404).json({ message: 'Secretary not found' });
        }
        res.status(200).json({ message: 'Secretary removed successfully' });
    }
    catch (error) {
        const err = error;
        res.status(500).json({ error: err.message });
    }
});
exports.removeSecretary = removeSecretary;
// Login Secretary
const loginSecretary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        const secretary = yield Secretary_1.default.findOne({ username });
        if (!secretary) {
            console.log('Invalid credentials: username not found');
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const isMatch = yield bcrypt_1.default.compare(password, secretary.password);
        if (!isMatch) {
            console.log('Invalid credentials: password does not match');
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const token = jsonwebtoken_1.default.sign({ id: secretary._id }, secretKey, { expiresIn: '1h' });
        // Log before updating login time
        console.log('Before updating login time:', secretary.loginTime);
        // Update login time
        secretary.loginTime = new Date();
        console.log('Updating login time:', secretary.loginTime);
        yield secretary.save();
        // Log after updating login time
        console.log('After saving login time:', secretary.loginTime);
        res.status(200).json({ message: 'Logged in successfully', token });
    }
    catch (error) {
        const err = error;
        console.error('Error logging in:', err.message);
        res.status(500).json({ error: err.message });
    }
});
exports.loginSecretary = loginSecretary;
const logoutSecretary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username } = req.body;
        const secretary = yield Secretary_1.default.findOne({ username });
        if (!secretary) {
            return res.status(400).json({ message: 'Invalid username' });
        }
        const loginTime = secretary.loginTime;
        const logoutTime = new Date();
        // Log before checking login time
        console.log('Login time:', loginTime);
        console.log('Logout time:', logoutTime);
        if (!loginTime) {
            return res.status(400).json({ message: 'Login time not found' });
        }
        const workingTime = Math.abs(logoutTime.getTime() - loginTime.getTime()) / 36e5; // Calculate working hours
        // Update working hours
        secretary.workingHours = (secretary.workingHours || 0) + workingTime;
        secretary.loginTime = undefined;
        // Log before saving
        console.log('Updating working hours:', secretary.workingHours);
        console.log('Setting loginTime to undefined');
        yield secretary.save();
        // Log after saving
        console.log('After saving, working hours:', secretary.workingHours);
        res.status(200).json({ message: 'Logged out successfully', workingHours: secretary.workingHours });
    }
    catch (error) {
        const err = error;
        console.error('Error logging out:', err.message);
        res.status(500).json({ error: err.message });
    }
});
exports.logoutSecretary = logoutSecretary;
