import prisma from '../prisma/client.js';
import bcrypt from 'bcrypt';

export const getAdmins = async (req, res) => {
  try {
    const admins = await prisma.admin.findMany({
      select: { id: true, name: true, username: true, created_at: true }
    });
    res.json(admins);
  } catch (error) {
    res.status(500).json({ message: 'Error interno' });
  }
};

export const createAdmin = async (req, res) => {
  try {
    const { name, username, password } = req.body;
    
    const existing = await prisma.admin.findUnique({
      where: { username }
    });

    if (existing) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const newAdmin = await prisma.admin.create({
      data: { name, username, password_hash }
    });

    res.status(201).json({ id: newAdmin.id, name: newAdmin.name, username: newAdmin.username });
  } catch (error) {
    res.status(500).json({ message: 'Error interno' });
  }
};

export const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    // Evitar borrar todos los admins
    const totalAdmins = await prisma.admin.count();
    if (totalAdmins <= 1) {
      return res.status(400).json({ message: 'No puedes eliminar el único administrador del sistema' });
    }

    await prisma.admin.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Administrador eliminado' });
  } catch (error) {
    res.status(500).json({ message: 'Error interno' });
  }
};
