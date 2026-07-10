import prisma from '../prisma/client.js';

export const getCandidates = async (req, res) => {
  try {
    const electionId = req.query.electionId ? parseInt(req.query.electionId, 10) : null;
    const whereClause = { deleted_at: null };
    if (electionId) {
      whereClause.elections = { some: { election_id: electionId } };
    }

    const candidates = await prisma.candidate.findMany({
      where: whereClause,
      orderBy: { number: 'asc' }
    });
    res.json(candidates);
  } catch (error) {
    res.status(500).json({ message: 'Error interno' });
  }
};

export const createCandidate = async (req, res) => {
  try {
    const { name, grade, number, proposal, election_id } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    const newCandidate = await prisma.candidate.create({
      data: {
        name,
        grade,
        number,
        proposal,
        image_url,
        elections: election_id ? {
          create: [{ election_id: parseInt(election_id) }]
        } : undefined
      }
    });

    res.status(201).json(newCandidate);
  } catch (error) {
    res.status(500).json({ message: 'Error interno' });
  }
};

export const updateCandidate = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, grade, number, proposal, status, election_id } = req.body;
    
    const data = { name, grade, number, proposal, status };
    if (req.file) data.image_url = `/uploads/${req.file.filename}`;

    const updated = await prisma.candidate.update({
      where: { id: parseInt(id) },
      data
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error interno' });
  }
};

export const deleteCandidate = async (req, res) => {
  try {
    const { id } = req.params;

    // Eliminación lógica
    await prisma.candidate.update({
      where: { id: parseInt(id) },
      data: { deleted_at: new Date() }
    });

    res.json({ message: 'Candidato eliminado (lógico)' });
  } catch (error) {
    res.status(500).json({ message: 'Error interno' });
  }
};
