import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { User } from '../models/user.model';
import { generateToken } from '../utils/jwt';

export const signup = async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;

  if (!['student', 'teacher'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  try {
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(409).json({ error: 'Email already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role });

    const token = generateToken(user.id, user.name, user.role);

    res.status(201).json({ token, user: { id: user.id, name, email, role } });
  } catch (err) {
    res.status(500).json({ error: 'Signup failed', details: err });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    if (!user.isActive) return res.status(401).json({ error: 'Your account has been disabled.' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Wrong Password' });

    const token = generateToken(user.id, user.name , user.role);

    res.status(200).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: 'Login failed', details: err });
  }
};

export const adminLogin = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email, role: 'admin' } });
    if (!user || !user.isActive) return res.status(401).json({ error: 'Unauthorized' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Unauthorized' });

    const token = generateToken(user.id, user.name,  user.role);

    res.status(200).json({ token, admin: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: 'Admin login failed', details: err });
  }
};
