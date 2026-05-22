# Documento de Requerimientos Funcionales (FRD)

## 1. Introducción
Sistema CRM para gestión de leads, pipeline de ventas, salud del lead, tareas y usuarios.

## 2. Módulos Funcionales

### 2.1 Gestión de Leads
- **Captura**: Ingreso manual e importación masiva de leads.
- **Datos**: Nombre, email, teléfono, empresa, fuente, estado inicial.
- **Asignación**: Distribución automática o manual a agentes.
- **Seguimiento**: Historial de interacciones (llamadas, emails, notas).

### 2.2 Pipeline de Ventas
- **Etapas configurables**: Prospección, Contacto, Propuesta, Negociación, Cierre.
- **Movimiento**: Arrastrar y soltar entre etapas.
- **Probabilidad**: Porcentaje de cierre por etapa.
- **Valor estimado**: Monto potencial por oportunidad.

### 2.3 Salud del Lead
- **Score dinámico**: Basado en actividad, engagement y datos demográficos.
- **Factores**: Apertura de emails, respuestas, tiempo sin contacto, completitud de datos.
- **Alertas**: Notificaciones cuando el score cae bajo umbral crítico.

### 2.4 Gestión de Tareas
- **Tipos**: Llamada, Email, Reunión, Seguimiento.
- **Prioridad**: Alta, Media, Baja.
- **Recordatorios**: Notificaciones por email/push.
- **Completado**: Marcado con fecha y hora real.

### 2.5 Usuarios y Roles
- **Roles**: Admin, Manager, Agente.
- **Permisos**: CRUD por módulo según rol.
- **Dashboard**: Vista personalizada por rol.

## 3. Criterios de Aceptación
- Cada requerimiento tiene métrica medible (tiempo de respuesta <2s, 99.9% disponibilidad).
- Flujos completos probados end-to-end.
- Datos validados antes de persistencia.
