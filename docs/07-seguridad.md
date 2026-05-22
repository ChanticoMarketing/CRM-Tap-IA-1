# Seguridad y Compliance

## 1. Encriptación

### Datos en Tránsito
- **TLS 1.3**: Todas las comunicaciones HTTPS.
- **Certificados**: AWS ACM con renovación automática.
- **HSTS**: Habilitado con max-age=31536000.

### Datos en Reposo
- **RDS PostgreSQL**: Encriptación AES-256 con KMS.
- **ElastiCache Redis**: Encriptación en reposo habilitada.
- **S3**: Encriptación SSE-S3 por defecto.
- **Backups**: Encriptados con misma clave KMS.

## 2. Matriz de Roles y Permisos (RBAC)

| Rol | Leads | Oportunidades | Tareas | Usuarios | Reportes | Configuración |
|-----|-------|---------------|--------|----------|----------|---------------|
| Admin | CRUD | CRUD | CRUD | CRUD | Todos | CRUD |
| Manager | CRUD | CRUD | CRUD (equipo) | Leer | Equipo | Limitado |
| Agente | CRUD (propios) | CRUD (propios) | CRUD (propios) | - | Propios | - |

### Implementación
- Middleware de autorización en cada endpoint.
- Claims JWT incluyen: user_id, role, permissions[].
- Validación a nivel de servicio para reglas complejas.

## 3. Gestión de Secretos

### AWS Secrets Manager
- **Credenciales DB**: Rotación automática cada 30 días.
- **API Keys externas**: Almacenadas cifradas.
- **JWT Secret**: Generado aleatoriamente, almacenado en Secrets Manager.

### Acceso a Secretos
- Aplicación obtiene secretos al inicio vía IAM Role.
- No hay secretos en variables de entorno o código.
- Auditoría de acceso a través de CloudTrail.

## 4. Autenticación

### JWT Implementation
- **Access Token**: 15 minutos de validez.
- **Refresh Token**: 7 días, almacenado en HTTP-only cookie.
- **Algoritmo**: RS256 (asimétrico).
- **Revocación**: Lista negra en Redis para logout anticipado.

### Protección de Cuentas
- **Rate Limiting**: 5 intentos de login por minuto por IP.
- **Bloqueo temporal**: 15 minutos tras 10 intentos fallidos.
- **MFA**: Obligatorio para rol Admin (fase 2).

## 5. Protección de Datos (GDPR/Compliance)

### Derechos del Usuario
- **Acceso**: Exportar todos los datos en JSON.
- **Rectificación**: Actualizar datos personales.
- **Eliminación**: Soft delete con retención 30 días, luego hard delete.
- **Portabilidad**: Formato estándar CSV/JSON.

### Consentimiento
- Registro explícito de consentimiento (timestamp, IP, versión política).
- Checkbox no pre-marcado en formularios.
- Política de privacidad versionada y accesible.

### Retención de Datos
- Leads inactivos >2 años: Archivado automático.
- Logs de auditoría: 7 años (requisito legal).
- Backups: 30 días rotativos.

## 6. Auditoría y Logging

### Logs de Auditoría
- Toda creación, actualización, eliminación registrada.
- Campos: usuario, entidad, acción, timestamp, IP, valores anterior/nuevo.
- Inmutables: Solo escritura, sin actualización/eliminación.

### Logs de Aplicación
- Formato JSON estructurado.
- Niveles: ERROR, WARN, INFO (DEBUG solo en staging).
- Centralizados en CloudWatch Logs.
- Retención: 90 días.

### Detección de Amenazas
- AWS GuardDuty habilitado.
- Alertas por accesos anómalos.
- WAF rules para OWASP Top 10.

## 7. Vectores de Ataque Mitigados

| Vector | Mitigación |
|--------|------------|
| SQL Injection | Query parameterized, ORM con validación |
| XSS | Sanitización de inputs, CSP headers |
| CSRF | Tokens CSRF, SameSite cookies |
| Brute Force | Rate limiting, account lockout |
| IDOR | Validación de propiedad en cada recurso |
| Privilege Escalation | RBAC estricto, validación server-side |
