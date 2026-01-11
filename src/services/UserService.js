import { UserModel } from '../models/UserModel.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export class UserService {
  static async register(userData) {
    const existingUser = await UserModel.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('El usuario ya existe');
    }
    return await UserModel.create(userData);
  }

  static async login(email, password) {
    const user = await UserModel.findByEmail(email);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    const isValid = await UserModel.verifyPassword(password, user.password);
    if (!isValid) {
      throw new Error('Contraseña incorrecta');
    }
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
    return { user: { id: user.id, username: user.username, email: user.email }, token };
  }

  static async getUserById(id) {
    const user = await UserModel.findById(id);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    return user;
  }

  static verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (err) {
      throw new Error('Token inválido');
    }
  }
}