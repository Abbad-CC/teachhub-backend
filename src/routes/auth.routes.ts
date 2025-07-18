import express from 'express';
import { signup, login } from '../controllers/auth.controller';

const router = express.Router();

console.log('✅ auth.routes.ts loaded');

router.post('/signup', signup); // for students & teachers
router.post('/login', login);   // for students & teachers

export default router;
