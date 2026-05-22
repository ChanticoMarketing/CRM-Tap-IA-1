# Documento de Requerimientos No Funcionales (NFRD)

## 1. Rendimiento
- Tiempo de respuesta API: <200ms para operaciones CRUD.
- Carga de dashboard: <2s con 10,000 registros.
- Throughput: 100 requests/segundo mínimo.

## 2. Escalabilidad
- Escalado horizontal automático según CPU (>70%) y memoria (>80%).
- Base de datos: Réplicas de lectura para consultas pesadas.
- Arquitectura stateless para facilitar escalado.

## 3. Disponibilidad
- SLA: 99.9% uptime mensual.
- Backup automático cada 6 horas.
- Recovery Time Objective (RTO): <1 hora.
- Recovery Point Objective (RPO): <15 minutos.

## 4. Seguridad
- Encriptación TLS 1.3 en tránsito.
- Encriptación AES-256 en reposo.
- Autenticación JWT con refresh tokens.
- RBAC estricto por módulo y acción.
- Logs de auditoría inmutables.

## 5. Mantenibilidad
- Cobertura de tests: >80%.
- Documentación actualizada con cada cambio.
- CI/CD con despliegue en <10 minutos.
- Monitoreo centralizado (métricas, logs, trazas).

## 6. Compatibilidad
- Navegadores: Chrome, Firefox, Safari (últimas 2 versiones).
- Mobile responsive.
- API versionada (v1, v2...).

## 7. Cumplimiento
- GDPR: Derecho al olvido, portabilidad de datos.
- Consentimiento explícito para procesamiento.
- Retención de datos según política definida.
