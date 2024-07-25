import express from 'express';
import { addSecretary, removeSecretary, loginSecretary, logoutSecretary } from '../controllers/secretaryControllers';

const router = express.Router();

router.post('/add', addSecretary);
router.delete('/remove/:id', removeSecretary);
router.post('/login', loginSecretary);
router.post('/logout', logoutSecretary);

export default router;
