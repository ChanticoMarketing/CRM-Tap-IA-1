# Documento de Arquitectura de Solución (SAD)

## 1. Patrones Arquitectónicos
- **Clean Architecture**: Separación clara entre dominio, aplicación e infraestructura.
- **CQRS**: Segregación de responsabilidad para lecturas y escrituras.
- **Event Sourcing**: Para auditoría y reconstrucción de estados.

## 2. Stack Tecnológico
- **Backend**: Node.js con TypeScript (Express/NestJS).
- **Frontend**: React con TypeScript.
- **Base de Datos**: PostgreSQL (datos relacionales), Redis (caché).
- **Infraestructura**: AWS (ECS Fargate, RDS, ElastiCache).
- **Colas**: AWS SQS para procesamiento asíncrono.

## 3. Diagrama de Componentes
```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Cliente   │────▶│  API Gateway │────▶│   Backend   │
│  (React)    │     │  (AWS ALB)   │     │  (Node.js)  │
└─────────────┘     └──────────────┘     └─────────────┘
                                                │
                    ┌───────────────────────────┼───────────────────────────┐
                    ▼                           ▼                           ▼
            ┌──────────────┐          ┌──────────────┐          ┌──────────────┐
            │  PostgreSQL  │          │    Redis     │          │     SQS      │
            │   (RDS)      │          │ (ElastiCache)│          │   (Colas)    │
            └──────────────┘          └──────────────┘          └──────────────┘
```

## 4. Flujo de Datos
1. Cliente solicita datos → API Gateway.
2. Backend valida autenticación/autorización.
3. Consulta a PostgreSQL (escritura) o Redis (lectura cacheada).
4. Respuesta serializada en JSON.
5. Eventos críticos publicados a SQS para procesamiento asíncrono.

## 5. Comunicación entre Servicios
- **Síncrona**: REST API para operaciones CRUD inmediatas.
- **Asíncrona**: SQS para scoring de leads, notificaciones, reportes.
- **Webhooks**: Para integraciones externas entrantes/salientes.

## 6. Escalabilidad y Mantenimiento
- Contenedores stateless escalables horizontalmente.
- Auto-scaling basado en métricas de CPU/memoria.
- Deployments blue-green para cero downtime.
- Feature flags para liberación progresiva.
