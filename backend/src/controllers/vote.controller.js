import pool from '../database/pool.js';
import { z } from 'zod';
import crypto from 'crypto';

export const validateStudentSchema = z.object({
  body: z.object({
    unique_code: z.string().min(1, 'El código es requerido'),
  })
});

export const voteSchema = z.object({
  body: z.object({
    unique_code: z.string().min(1),
    candidate_id: z.number().int().positive(),
  })
});

export const validateStudent = async (req, res) => {
  const { unique_code } = req.body;

  try {
    // Buscar la elección activa
    const electionQuery = 'SELECT id FROM elections WHERE is_active = TRUE AND status = $1 LIMIT 1';
    const electionResult = await pool.query(electionQuery, ['ACTIVE']);

    if (electionResult.rows.length === 0) {
      return res.status(404).json({ message: 'No hay ninguna elección activa en este momento' });
    }
    const electionId = electionResult.rows[0].id;

    // Buscar al estudiante
    const studentQuery = 'SELECT id, name, grade FROM students WHERE unique_code = $1 AND deleted_at IS NULL';
    const studentResult = await pool.query(studentQuery, [unique_code]);

    if (studentResult.rows.length === 0) {
      return res.status(404).json({ message: 'Estudiante no encontrado o código incorrecto' });
    }

    const student = studentResult.rows[0];

    // Verificar si ya votó en esta elección
    const voteCheckQuery = 'SELECT id FROM votes WHERE student_id = $1 AND election_id = $2 LIMIT 1';
    const voteCheckResult = await pool.query(voteCheckQuery, [student.id, electionId]);

    if (voteCheckResult.rows.length > 0) {
      return res.status(403).json({ message: 'Ya has registrado tu voto en esta elección' });
    }

    res.json({
      message: 'Estudiante validado correctamente',
      student: {
        id: student.id,
        unique_code: unique_code,
        name: student.name,
        grade: student.grade,
      },
      electionId
    });
  } catch (error) {
    console.error('Error validating student:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const registerVote = async (req, res) => {
  const { unique_code, candidate_id } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN'); // Iniciar transacción SQL

    // 1. Validar elección activa
    const electionQuery = 'SELECT id FROM elections WHERE is_active = TRUE AND status = $1 LIMIT 1';
    const electionResult = await client.query(electionQuery, ['ACTIVE']);

    if (electionResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'No hay elecciones activas' });
    }
    const electionId = electionResult.rows[0].id;

    // 2. Validar estudiante (Bloquear registro para evitar concurrencia)
    const studentQuery = 'SELECT id FROM students WHERE unique_code = $1 AND deleted_at IS NULL FOR UPDATE';
    const studentResult = await client.query(studentQuery, [unique_code]);

    if (studentResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Estudiante no encontrado' });
    }

    const student = studentResult.rows[0];

    // Verificar si ya votó en esta elección
    const voteCheckQuery = 'SELECT id FROM votes WHERE student_id = $1 AND election_id = $2 LIMIT 1';
    const voteCheckResult = await client.query(voteCheckQuery, [student.id, electionId]);

    if (voteCheckResult.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(403).json({ message: 'El voto ya fue registrado previamente en esta elección' });
    }

    // 3. Validar que el candidato exista y esté activo en esta elección
    const candidateQuery = 'SELECT id FROM candidates WHERE id = $1 AND election_id = $2 AND status = $3 AND deleted_at IS NULL';
    const candidateResult = await client.query(candidateQuery, [candidate_id, electionId, 'ACTIVE']);

    if (candidateResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Candidato no válido para esta elección' });
    }

    // 4. Registrar el voto
    const receipt_id = crypto.randomUUID();
    const insertVoteQuery = 'INSERT INTO votes (election_id, student_id, candidate_id, receipt_id) VALUES ($1, $2, $3, $4)';
    await client.query(insertVoteQuery, [electionId, student.id, candidate_id, receipt_id]);

    await client.query('COMMIT'); // Confirmar transacción
    res.json({ message: 'Voto registrado exitosamente', receipt_id });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error registering vote:', error);
    res.status(500).json({ message: 'Error interno al registrar el voto' });
  } finally {
    client.release();
  }
};
