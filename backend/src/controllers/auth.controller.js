import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../database/pool.js';
import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    username: z.string().min(3),
    password: z.string().min(6),
  })
});

export const loginAdmin = async (req, res) => {
  const { username, password } = req.body;

  try {
    // raw SQL (pg) for login administrator
    const query = 'SELECT id, name, username, password_hash FROM admins WHERE username = $1';
    const result = await pool.query(query, [username]);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const admin = result.rows[0];

    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      message: 'Login exitoso',
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        username: admin.username,
      }
    });
  } catch (error) {
    console.error('Error in loginAdmin:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
