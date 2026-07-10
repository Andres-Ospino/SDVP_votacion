-- Insert test admin (password is 'admin123' hashed with bcrypt)
-- Using a standard bcrypt hash for 'admin123': $2b$10$imCpMVG/6ZAmb7OsYoZs0OkRTnU6w/T7s9BV0G5y42b/2zT/Ke4EG
INSERT INTO admins (name, username, password_hash)
VALUES ('Administrador Principal', 'admin', '$2b$10$imCpMVG/6ZAmb7OsYoZs0OkRTnU6w/T7s9BV0G5y42b/2zT/Ke4EG')
ON CONFLICT (username) DO NOTHING;

-- Insert test election
INSERT INTO elections (title, start_date, end_date, status, is_active)
VALUES ('Elecciones Personero 2026', '2026-07-01 00:00:00', '2026-07-30 23:59:59', 'ACTIVE', TRUE)
RETURNING id;

-- Note: The returned ID from election is used in subsequent inserts. Assuming ID is 1 for testing.
-- If the table is fresh, id will be 1.

-- Insert test students
INSERT INTO students (unique_code, name, grade, birth_date) VALUES
('EST001', 'Juan Perez', '11A', '2005-05-15'),
('EST002', 'Maria Gomez', '11B', '2006-03-22'),
('EST003', 'Carlos Ruiz', '10A', '2007-08-10'),
('EST004', 'Ana Torres', '10B', '2007-11-05'),
('EST005', 'Luis Mendez', '9A', '2008-01-20')
ON CONFLICT (unique_code) DO NOTHING;

-- Insert test candidates
INSERT INTO candidates (election_id, name, grade, number, proposal, image_url, status) VALUES
(1, 'Pedro Martinez', '11A', '01', 'Mejorar las instalaciones deportivas', null, 'ACTIVE'),
(1, 'Laura Sanchez', '11B', '02', 'Promover el reciclaje y cultura ambiental', null, 'ACTIVE'),
(1, 'Voto en Blanco', 'N/A', '00', 'Voto en blanco', null, 'ACTIVE');

-- Note: No votes inserted initially.
