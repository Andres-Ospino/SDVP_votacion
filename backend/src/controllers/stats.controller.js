import pool from '../database/pool.js';

export const getDashboardStats = async (req, res) => {
  try {
    // 1. Total estudiantes, candidatos, votos
    const totalStudentsQuery = 'SELECT COUNT(*) as count FROM students WHERE deleted_at IS NULL';
    const totalCandidatesQuery = 'SELECT COUNT(*) as count FROM candidates WHERE deleted_at IS NULL AND status = $1';
    
    // Obtenemos elección activa (o la última si no hay)
    const activeElectionResult = await pool.query('SELECT id FROM elections WHERE is_active = TRUE LIMIT 1');
    let electionId = null;
    if (activeElectionResult.rows.length > 0) {
      electionId = activeElectionResult.rows[0].id;
    } else {
      const lastElectionResult = await pool.query('SELECT id FROM elections ORDER BY id DESC LIMIT 1');
      if (lastElectionResult.rows.length > 0) electionId = lastElectionResult.rows[0].id;
    }

    if (!electionId) {
      return res.json({ message: 'No hay datos de elecciones' });
    }

    const totalVotesQuery = 'SELECT COUNT(*) as count FROM votes WHERE election_id = $1';

    const [studentsResult, candidatesResult, votesResult] = await Promise.all([
      pool.query(totalStudentsQuery),
      pool.query(totalCandidatesQuery, ['ACTIVE']),
      pool.query(totalVotesQuery, [electionId])
    ]);

    const totalStudents = parseInt(studentsResult.rows[0].count, 10);
    const totalCandidates = parseInt(candidatesResult.rows[0].count, 10);
    const totalVotes = parseInt(votesResult.rows[0].count, 10);

    const participation = totalStudents > 0 ? ((totalVotes / totalStudents) * 100).toFixed(2) : 0;
    const abstention = totalStudents > 0 ? (((totalStudents - totalVotes) / totalStudents) * 100).toFixed(2) : 0;

    res.json({
      totalStudents,
      totalCandidates,
      totalVotes,
      participation: parseFloat(participation),
      abstention: parseFloat(abstention)
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Error interno al obtener estadísticas' });
  }
};

export const getRanking = async (req, res) => {
  try {
    const activeElectionResult = await pool.query('SELECT id FROM elections WHERE is_active = TRUE LIMIT 1');
    if (activeElectionResult.rows.length === 0) return res.json([]);
    const electionId = activeElectionResult.rows[0].id;

    // JOIN, GROUP BY, COUNT, ORDER BY
    const rankingQuery = `
      SELECT c.id, c.name, c.number, c.grade, c.image_url, COUNT(v.id) as votes
      FROM candidates c
      LEFT JOIN votes v ON c.id = v.candidate_id AND v.election_id = $1
      WHERE c.election_id = $1 AND c.deleted_at IS NULL
      GROUP BY c.id
      ORDER BY votes DESC
    `;

    const result = await pool.query(rankingQuery, [electionId]);
    res.json(result.rows.map(row => ({
      ...row,
      votes: parseInt(row.votes, 10)
    })));
  } catch (error) {
    console.error('Error fetching ranking:', error);
    res.status(500).json({ message: 'Error interno' });
  }
};

export const getParticipationByGrade = async (req, res) => {
  try {
    const activeElectionResult = await pool.query('SELECT id FROM elections WHERE is_active = TRUE LIMIT 1');
    if (activeElectionResult.rows.length === 0) return res.json([]);
    const electionId = activeElectionResult.rows[0].id;

    // Participación por grado: total estudiantes vs los que ya votaron
    const query = `
      SELECT 
        s.grade,
        COUNT(s.id) as total_students,
        SUM(CASE WHEN s.has_voted = TRUE THEN 1 ELSE 0 END) as total_voted
      FROM students s
      WHERE s.deleted_at IS NULL
      GROUP BY s.grade
      ORDER BY s.grade ASC
    `;

    const result = await pool.query(query);
    res.json(result.rows.map(row => ({
      grade: row.grade,
      total_students: parseInt(row.total_students, 10),
      total_voted: parseInt(row.total_voted, 10),
      participation_rate: parseInt(row.total_students, 10) > 0 
        ? ((parseInt(row.total_voted, 10) / parseInt(row.total_students, 10)) * 100).toFixed(2) 
        : 0
    })));
  } catch (error) {
    console.error('Error fetching participation by grade:', error);
    res.status(500).json({ message: 'Error interno' });
  }
};

export const getDetailedVotes = async (req, res) => {
  try {
    // Audit: Showing exactly who voted for whom, with dates and times
    // Requirement: Mostrar: Código, Nombre, Curso, Candidato, Fecha, Hora
    const query = `
      SELECT 
        s.unique_code,
        s.name as student_name,
        s.grade as student_grade,
        c.name as candidate_name,
        v.date as vote_datetime
      FROM votes v
      JOIN students s ON v.student_id = s.id
      JOIN candidates c ON v.candidate_id = c.id
      ORDER BY v.date DESC
      LIMIT 1000
    `;

    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching detailed votes:', error);
    res.status(500).json({ message: 'Error interno' });
  }
};
