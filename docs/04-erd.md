# Modelo Entidad-Relación (ERD)

## Entidades Principales

### Users
- id (PK, UUID)
- email (unique, indexed)
- password_hash
- name
- role (enum: admin, manager, agent)
- created_at
- updated_at

### Leads
- id (PK, UUID)
- owner_id (FK → Users.id, indexed)
- name
- email (indexed)
- phone
- company
- source (enum: web, referral, import, api)
- status (enum: new, contacted, qualified, disqualified)
- health_score (int, 0-100, indexed)
- last_contacted_at
- created_at
- updated_at

### PipelineStages
- id (PK, UUID)
- name
- order (int)
- probability (decimal 0-1)
- is_default (bool)

### Opportunities
- id (PK, UUID)
- lead_id (FK → Leads.id, indexed)
- stage_id (FK → PipelineStages.id, indexed)
- value (decimal)
- currency (default: USD)
- expected_close_date
- actual_close_date
- created_at
- updated_at

### Tasks
- id (PK, UUID)
- assignee_id (FK → Users.id, indexed)
- lead_id (FK → Leads.id, indexed, nullable)
- type (enum: call, email, meeting, followup)
- priority (enum: high, medium, low)
- title
- description
- due_date
- completed_at
- created_at
- updated_at

### Interactions
- id (PK, UUID)
- lead_id (FK → Leads.id, indexed)
- user_id (FK → Users.id)
- type (enum: call, email, note, meeting)
- content (text)
- direction (enum: inbound, outbound, internal)
- created_at

### AuditLogs
- id (PK, UUID)
- user_id (FK → Users.id, indexed)
- entity_type (varchar)
- entity_id (UUID, indexed)
- action (enum: create, update, delete)
- old_value (jsonb, nullable)
- new_value (jsonb, nullable)
- ip_address
- created_at

## Relaciones
- User (1) → (N) Leads (owner)
- User (1) → (N) Tasks (assignee)
- Lead (1) → (1) Opportunity
- Lead (1) → (N) Interactions
- Lead (1) → (N) Tasks
- PipelineStage (1) → (N) Opportunities
- User (1) → (N) AuditLogs

## Índices Estratégicos
- Leads: email, health_score, owner_id, status
- Opportunities: lead_id, stage_id
- Tasks: assignee_id, lead_id, due_date
- Interactions: lead_id, created_at
- AuditLogs: entity_type, entity_id, user_id, created_at

## Normalización
- 3FN aplicada: sin dependencias transitivas.
- Tablas de auditoría separadas para no afectar rendimiento operacional.
- JSONB para valores antiguos/nuevos en auditoría (flexibilidad).
