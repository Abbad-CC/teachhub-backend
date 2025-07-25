const jwt = require('jsonwebtoken');
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET!;

export const generateToken = (userId: string, userName:string,  role: string): string => {
  const token = jwt.sign({ userId, userName, role }, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
  return token;
};

// export const verifyToken = (token: string) => {
//   return jwt.verify(token, JWT_SECRET);
// };