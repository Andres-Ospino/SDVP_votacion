import prisma from '../prisma/client.js';

export const getElections = async (req, res) => {
  try {
    const elections = await prisma.election.findMany({
      orderBy: { created_at: 'desc' }
    });
    res.json(elections);
  } catch (error) {
    res.status(500).json({ message: 'Error interno' });
  }
};

export const getActiveElection = async (req, res) => {
  try {
    const election = await prisma.election.findFirst({
      where: { is_active: true }
    });
    if (!election) return res.status(404).json({ message: 'No hay elección activa' });
    res.json(election);
  } catch (error) {
    res.status(500).json({ message: 'Error interno' });
  }
};

export const createElection = async (req, res) => {
  try {
    const { title, start_date, end_date } = req.body;

    const newElection = await prisma.$transaction(async (tx) => {
      const election = await tx.election.create({
        data: {
          title,
          start_date: new Date(start_date),
          end_date: new Date(end_date)
        }
      });

      // Voto en Blanco estructural
      await tx.candidate.create({
        data: {
          election_id: election.id,
          name: 'Voto en Blanco',
          grade: 'N/A',
          number: 'BLANCO',
          is_blank: true,
          status: 'ACTIVE'
        }
      });

      return election;
    });

    res.status(201).json(newElection);
  } catch (error) {
    res.status(500).json({ message: 'Error interno' });
  }
};

export const updateElectionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, is_active, hide_results } = req.body;

    if (is_active) {
      await prisma.election.updateMany({
        where: { id: { not: parseInt(id) } },
        data: { is_active: false, status: 'COMPLETED' }
      });
    }

    const data = {};
    if (status !== undefined) data.status = status;
    if (is_active !== undefined) data.is_active = is_active;
    if (hide_results !== undefined) data.hide_results = hide_results;

    const updated = await prisma.election.update({
      where: { id: parseInt(id) },
      data
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error interno' });
  }
};

export const closePolls = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await prisma.election.update({
      where: { id: parseInt(id) },
      data: { status: 'COMPLETED', is_active: false, hide_results: false }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error interno' });
  }
};
