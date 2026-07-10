import pg from 'pg';

const { Client } = pg;
const client = new Client({ connectionString: process.env.DATABASE_URL });

async function runMigration() {
  await client.connect();

  try {
    await client.query('BEGIN');

    console.log('1. Creating election_candidates table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS election_candidates (
          election_id INTEGER NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
          candidate_id INTEGER NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
          PRIMARY KEY (election_id, candidate_id)
      );
    `);

    console.log('2. Copying relationships...');
    // Simply copy all existing relationships first
    await client.query(`
      INSERT INTO election_candidates (election_id, candidate_id)
      SELECT election_id, id FROM candidates
      ON CONFLICT DO NOTHING;
    `);

    console.log('3. Deduplicating candidates...');
    // For each unique candidate name, find the "primary" ID (the minimum ID)
    const res = await client.query(`
      SELECT name, array_agg(id ORDER BY id ASC) as ids
      FROM candidates
      GROUP BY name
      HAVING count(id) > 1;
    `);

    for (const row of res.rows) {
      const primaryId = row.ids[0];
      const duplicateIds = row.ids.slice(1);
      
      console.log(`Merging duplicates for ${row.name}. Primary: ${primaryId}, Duplicates: ${duplicateIds.join(', ')}`);
      
      for (const dupId of duplicateIds) {
        // Move relationships to the primary ID
        await client.query(`
          INSERT INTO election_candidates (election_id, candidate_id)
          SELECT election_id, $1 FROM election_candidates WHERE candidate_id = $2
          ON CONFLICT DO NOTHING;
        `, [primaryId, dupId]);

        // Update votes to point to the primary ID
        await client.query(`
          UPDATE votes SET candidate_id = $1 WHERE candidate_id = $2;
        `, [primaryId, dupId]);

        // Delete the duplicate candidate
        await client.query(`
          DELETE FROM candidates WHERE id = $1;
        `, [dupId]);
      }
    }

    console.log('4. Dropping election_id from candidates...');
    await client.query(`
      ALTER TABLE candidates DROP COLUMN IF EXISTS election_id CASCADE;
    `);

    await client.query('COMMIT');
    console.log('Migration completed successfully!');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed, rolled back:', error);
  } finally {
    await client.end();
  }
}

runMigration();
