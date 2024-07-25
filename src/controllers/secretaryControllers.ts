import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Secretary from '../models/Secretary';

const secretKey = process.env.JWT_SECRET_KEY || 'your-secret-key';

export const addSecretary = async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;
        const existingSecretary = await Secretary.findOne({ username });
        if (existingSecretary) {
            return res.status(400).json({ message: 'Username already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newSecretary = new Secretary({ username, password: hashedPassword });
        await newSecretary.save();
        res.status(201).json({ message: 'Secretary added successfully' });
    } catch (error) {
        const err = error as Error;
        res.status(500).json({ error: err.message });
    }
};

export const removeSecretary = async (req: Request, res: Response) => {
    try {
        const { username } = req.body;

        if (!username) {
            return res.status(400).json({ error: 'Username is required' });
        }

        const result = await Secretary.findOneAndDelete({ username });
        if (!result) {
            return res.status(404).json({ message: 'Secretary not found' });
        }

        res.status(200).json({ message: 'Secretary removed successfully' });
    } catch (error) {
        const err = error as Error;
        res.status(500).json({ error: err.message });
    }
};

export const loginSecretary = async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;
        const secretary = await Secretary.findOne({ username });

        if (!secretary) {
            console.log('Invalid credentials: username not found');
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, secretary.password);

        if (!isMatch) {
            console.log('Invalid credentials: password does not match');
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: secretary._id }, secretKey, { expiresIn: '1h' });

        console.log('Before updating login time:', secretary.loginTime);

        secretary.loginTime = new Date();
        console.log('Updating login time:', secretary.loginTime);

        await secretary.save();

        console.log('After saving login time:', secretary.loginTime);

        res.status(200).json({ message: 'Logged in successfully', token });
    } catch (error) {
        const err = error as Error;
        console.error('Error logging in:', err.message);
        res.status(500).json({ error: err.message });
    }
};

export const logoutSecretary = async (req: Request, res: Response) => {
    try {
        const { username } = req.body;
        const secretary = await Secretary.findOne({ username });

        if (!secretary) {
            return res.status(400).json({ message: 'Invalid username' });
        }

        const loginTime = secretary.loginTime;
        const logoutTime = new Date();

        console.log('Login time:', loginTime);
        console.log('Logout time:', logoutTime);

        if (!loginTime) {
            return res.status(400).json({ message: 'Login time not found' });
        }

        const workingTime = Math.abs(logoutTime.getTime() - loginTime.getTime()) / 36e5;

        secretary.workingHours = (secretary.workingHours || 0) + workingTime;
        secretary.loginTime = undefined;

        console.log('Updating working hours:', secretary.workingHours);
        console.log('Setting loginTime to undefined');

        await secretary.save();

        console.log('After saving, working hours:', secretary.workingHours);

        res.status(200).json({ message: 'Logged out successfully', workingHours: secretary.workingHours });
    } catch (error) {
        const err = error as Error;
        console.error('Error logging out:', err.message);
        res.status(500).json({ error: err.message });
    }
};
