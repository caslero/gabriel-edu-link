import { UserService } from '../services/UserService.js';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Token requerido' });
  }
  try {
    const user = UserService.verifyToken(token);
    req.user = user;
    next();
  } catch (err) {
    res.status(403).json({ message: 'Token inválido' });
  }
};