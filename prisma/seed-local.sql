-- Seed SQLite local (run: npx prisma db execute --schema=prisma/schema.sqlite.prisma --file prisma/seed-local.sql)

UPDATE Pipeline
SET isDefault = 0,
    defaultKey = NULL,
    updatedAt = datetime('now')
WHERE defaultKey = 'default'
  AND id <> 'cmleadpipe00001';

UPDATE Pipeline
SET name = 'Ventas',
    isDefault = 1,
    defaultKey = 'default',
    updatedAt = datetime('now')
WHERE id = 'cmleadpipe00001';

INSERT INTO Pipeline (id, name, isDefault, defaultKey, createdAt, updatedAt)
SELECT 'cmleadpipe00001', 'Ventas', 1, 'default', datetime('now'), datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM Pipeline WHERE id = 'cmleadpipe00001');

INSERT INTO PipelineStage (id, pipelineId, name, "order", color, isWon, isLost, createdAt, updatedAt)
SELECT 'cmstage00000001', 'cmleadpipe00001', 'Nuevo', 0, '#94a3b8', 0, 0, datetime('now'), datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM PipelineStage WHERE pipelineId = 'cmleadpipe00001');

INSERT OR IGNORE INTO PipelineStage (id, pipelineId, name, "order", color, isWon, isLost, createdAt, updatedAt) VALUES
('cmstage00000002', 'cmleadpipe00001', 'Contactado', 1, '#60a5fa', 0, 0, datetime('now'), datetime('now')),
('cmstage00000003', 'cmleadpipe00001', 'Propuesta', 2, '#a78bfa', 0, 0, datetime('now'), datetime('now')),
('cmstage00000004', 'cmleadpipe00001', 'Negociación', 3, '#fbbf24', 0, 0, datetime('now'), datetime('now')),
('cmstage00000005', 'cmleadpipe00001', 'Ganado', 4, '#34d399', 1, 0, datetime('now'), datetime('now')),
('cmstage00000006', 'cmleadpipe00001', 'Perdido', 5, '#f87171', 0, 1, datetime('now'), datetime('now'));

INSERT INTO Lead (id, name, email, company, value, stageId, createdAt, updatedAt)
SELECT 'cmlead000000001', 'María López', 'maria@techstart.io', 'TechStart', 15000, 'cmstage00000001', datetime('now'), datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM Lead LIMIT 1);

INSERT OR IGNORE INTO Lead (id, name, email, company, value, stageId, createdAt, updatedAt) VALUES
('cmlead000000002', 'James Chen', 'j.chen@retailco.com', 'RetailCo', 28000, 'cmstage00000003', datetime('now'), datetime('now')),
('cmlead000000003', 'Sofia Martínez', 'sofia@greenleaf.mx', 'GreenLeaf', 42000, 'cmstage00000004', datetime('now'), datetime('now')),
('cmlead000000004', 'Alex Rivera', 'alex@nomatch.com', NULL, 8000, 'cmstage00000006', datetime('now'), datetime('now')),
('cmlead000000005', 'Elena Park', 'elena@wondeal.com', 'WonDeal Inc', 55000, 'cmstage00000005', datetime('now'), datetime('now'));
