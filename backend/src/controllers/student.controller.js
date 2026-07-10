import prisma from '../prisma/client.js';

export const getStudents = async (req, res) => {
  try {
    const students = await prisma.student.findMany({
      where: { deleted_at: null },
      orderBy: { name: 'asc' }
    });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Error interno' });
  }
};

export const createStudent = async (req, res) => {
  try {
    const { unique_code, name, grade } = req.body;
    
    const existing = await prisma.student.findUnique({
      where: { unique_code }
    });

    if (existing) {
      return res.status(400).json({ message: 'El código de estudiante ya existe' });
    }

    const newStudent = await prisma.student.create({
      data: { unique_code, name, grade }
    });

    res.status(201).json(newStudent);
  } catch (error) {
    res.status(500).json({ message: 'Error interno' });
  }
};

export const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { unique_code, name, grade } = req.body;

    const updated = await prisma.student.update({
      where: { id: parseInt(id) },
      data: { unique_code, name, grade }
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error interno' });
  }
};

export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.student.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Estudiante eliminado' });
  } catch (error) {
    res.status(500).json({ message: 'Error interno' });
  }
};

export const createBulkStudents = async (req, res) => {
  try {
    const { students } = req.body; // Array of { unique_code, name, grade, birth_date }
    if (!Array.isArray(students)) return res.status(400).json({ message: 'Formato inválido' });

    // Use createMany for bulk insert (ignores duplicates if skipDuplicates: true)
    const result = await prisma.student.createMany({
      data: students.map(s => ({
        unique_code: s.unique_code,
        name: s.name,
        grade: s.grade,
        birth_date: s.birth_date || null
      })),
      skipDuplicates: true
    });

    res.status(201).json({ message: `Se importaron ${result.count} estudiantes exitosamente` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en la importación masiva' });
  }
};
