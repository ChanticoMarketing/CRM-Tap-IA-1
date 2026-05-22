# Backlog Técnico - Fase 2

## Historias de Usuario Prioritizadas (MoSCoW)

### MUST HAVE (Crítico para MVP)

#### Módulo de Leads
- [ ] **LEAD-001**: Crear lead manualmente
  - Campos: nombre, email, teléfono, empresa, fuente
  - Validación de email único
  - Asignación automática al usuario creador
  
- [ ] **LEAD-002**: Listar leads con filtrado básico
  - Filtros: estado, propietario, fuente
  - Paginación (limit/offset)
  - Ordenamiento por fecha creación
  
- [ ] **LEAD-003**: Actualizar lead
  - Editar todos los campos excepto ID
  - Registrar cambio en auditoría
  
- [ ] **LEAD-004**: Eliminar lead (soft delete)
  - Marcado como eliminado, no borrado físico
  - Solo propietario o admin puede eliminar

#### Módulo de Autenticación
- [ ] **AUTH-001**: Login con email/password
  - Generación de JWT access + refresh token
  - Rate limiting por IP
  
- [ ] **AUTH-002**: Logout
  - Invalidación de refresh token
  - Limpieza de cookies
  
- [ ] **AUTH-003**: Middleware de autenticación
  - Validación de JWT en endpoints protegidos
  - Extracción de user_id y role del token

#### Módulo de Tareas
- [ ] **TASK-001**: Crear tarea
  - Campos: tipo, prioridad, título, descripción, fecha vencimiento
  - Asignación a usuario específico
  - Vinculación opcional a lead
  
- [ ] **TASK-002**: Listar tareas por asignado
  - Filtros: prioridad, completado/pendiente, fecha
  
- [ ] **TASK-003**: Marcar tarea como completada
  - Registro de fecha/hora de completado
  - No editable después de completada

#### Módulo de Usuarios
- [ ] **USER-001**: CRUD de usuarios (solo admin)
  - Crear, editar, desactivar usuarios
  - Asignación de roles (admin, manager, agent)

### SHOULD HAVE (Importante pero no crítico)

#### Pipeline de Ventas
- [ ] **PIPE-001**: Configurar etapas del pipeline
  - Nombre, orden, probabilidad de cierre
  
- [ ] **PIPE-002**: Crear oportunidad vinculada a lead
  - Valor, moneda, fecha estimada de cierre
  
- [ ] **PIPE-003**: Mover oportunidad entre etapas
  - Actualización automática de probabilidad
  - Registro en historial

#### Salud del Lead
- [ ] **HEALTH-001**: Calcular score inicial de lead
  - Basado en completitud de datos (0-100)
  
- [ ] **HEALTH-002**: Actualizar score por interacciones
  - +5 por email respondido
  - -10 por 7 días sin contacto
  - +15 por reunión agendada

#### Integraciones Básicas
- [ ] **INT-001**: Webhook entrante para captura de leads
  - Endpoint público con validación de secreto
  - Creación automática de lead

### COULD HAVE (Deseable)

#### Reportes
- [ ] **REP-001**: Dashboard básico
  - Leads por estado, tareas pendientes, conversion rate
  
- [ ] **REP-002**: Exportar datos a CSV
  - Leads, tareas, oportunidades

#### Notificaciones
- [ ] **NOTIF-001**: Email de recordatorio de tareas
  - 24h antes del vencimiento
  
- [ ] **NOTIF-002**: Alerta de lead con score crítico
  - Score <30 notifica al propietario

### WON'T HAVE (Fuera de alcance inicial)

- Integración con LinkedIn Sales Navigator
- Integración con WhatsApp Business API
- Forecasting con machine learning
- App móvil nativa
- Chat en tiempo real entre agentes
- Personalización avanzada de dashboard
- Múltiples pipelines por equipo
- Aprobación de descuentos en oportunidades

---

## Criterios de Aceptación Comunes

### Código
- [ ] Tests unitarios con >80% cobertura
- [ ] Tests de integración para flujos críticos
- [ ] Linting sin errores
- [ ] Documentación de endpoints actualizada

### Rendimiento
- [ ] Respuesta API <200ms (p95)
- [ ] Consultas DB optimizadas (sin N+1)
- [ ] Índices creados según ERD

### Seguridad
- [ ] Validación de inputs en todos los endpoints
- [ ] RBAC verificado en tests de integración
- [ ] Logs de auditoría generados correctamente
- [ ] Sin secretos en código o repositorio

### Despliegue
- [ ] Dockerfile funcional
- [ ] Pipeline CI/CD ejecuta tests automáticamente
- [ ] Deploy automático a staging tras merge a main

---

## Dependencias Técnicas

1. **Infraestructura AWS** debe estar provisionada antes de desarrollo
2. **Esquema de base de datos** debe ser migrado antes de pruebas de integración
3. **Secretos** deben estar cargados en AWS Secrets Manager
4. **Dominio y certificados** configurados antes de deploy a producción

---

## Estimación de Esfuerzo (Sprints de 2 semanas)

| Sprint | Entregables |
|--------|-------------|
| 1 | AUTH-001/002/003, USER-001, Setup infraestructura |
| 2 | LEAD-001/002/003/004, Modelo de datos completo |
| 3 | TASK-001/002/003, Sistema de auditoría |
| 4 | PIPE-001/002/003, HEALTH-001/002 |
| 5 | INT-001, REP-001/002, NOTIF-001/002 |
| 6 | Hardening, performance testing, documentación final |

**Total estimado**: 6 sprints (12 semanas) para MVP completo
