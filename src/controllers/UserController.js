import { UserService } from '../services/UserService.js';

export class UserController {
  static async register(req, res) {
    try {
      const user = await UserService.register(req.body);
      res.status(201).json({ message: 'Usuario registrado', user });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;
      const result = await UserService.login(email, password);
      res.json(result);
    } catch (err) {
      res.status(401).json({ message: err.message });
    }
  }

  static async getProfile(req, res) {
    try {
      const user = await UserService.getUserById(req.user.id);
      res.json(user);
    } catch (err) {
      res.status(404).json({ message: err.message });
    }
  }
}