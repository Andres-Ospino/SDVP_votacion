-- Insert test admin (password is 'admin123' hashed with bcrypt)
-- Using a standard bcrypt hash for 'admin123': $2b$10$Y1s10Hl3HkL1d.tT.F/r.u8F61eMof5S5/l38eHl/66xYl9O1hM5a
INSERT INTO admins (name, username, password_hash)
VALUES ('Administrador Principal', 'admin', '$2b$10$Y1s10Hl3HkL1d.tT.F/r.u8F61eMof5S5/l38eHl/66xYl9O1hM5a')
ON CONFLICT (username) DO NOTHING;

-- Insert test election
INSERT INTO elections (title, start_date, end_date, status, is_active)
VALUES ('Elecciones Personero 2026', '2026-07-01 00:00:00', '2026-07-30 23:59:59', 'ACTIVE', TRUE)
RETURNING id;

-- Note: The returned ID from election is used in subsequent inserts. Assuming ID is 1 for testing.
-- If the table is fresh, id will be 1.

-- Insert test students
INSERT INTO students (unique_code, name, grade) VALUES
('EST001', 'Juan Perez', '11A'),
('EST002', 'Maria Gomez', '11B'),
('EST003', 'Carlos Ruiz', '10A'),
('EST004', 'Ana Torres', '10B'),
('EST005', 'Luis Mendez', '9A')
ON CONFLICT (unique_code) DO NOTHING;

-- Insert test candidates
INSERT INTO candidates (election_id, name, grade, number, proposal, image_url, status) VALUES
(1, 'Pedro Martinez', '11A', '01', 'Mejorar las instalaciones deportivas', null, 'ACTIVE'),
(1, 'Laura Sanchez', '11B', '02', 'Promover el reciclaje y cultura ambiental', null, 'ACTIVE'),
(1, 'Voto en Blanco', 'N/A', '00', 'Voto en blanco', null, 'ACTIVE');

-- Note: No votes inserted initially.
