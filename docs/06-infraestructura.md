# Infraestructura y DevOps

## 1. Proveedor de Nube: AWS

### Servicios Utilizados
- **Compute**: ECS Fargate (contenedores sin gestión de servidores).
- **Base de Datos**: RDS PostgreSQL (multi-AZ, backup automático).
- **Caché**: ElastiCache Redis.
- **Colas**: SQS Standard.
- **Almacenamiento**: S3 para archivos adjuntos y backups.
- **Red**: VPC con subredes públicas/privadas, NAT Gateway, ALB.
- **Seguridad**: IAM roles, Security Groups, WAF.
- **Monitoreo**: CloudWatch (métricas, logs, alarmas).
- **Secretos**: AWS Secrets Manager.

## 2. Topología de Red

```
┌─────────────────────────────────────────────────────────────┐
│                         VPC                                  │
│  ┌─────────────────────┐     ┌─────────────────────┐        │
│  │   Subred Pública    │     │   Subred Privada    │        │
│  │  - ALB              │     │  - ECS Tasks        │        │
│  │  - NAT Gateway      │     │  - RDS PostgreSQL   │        │
│  │                     │     │  - ElastiCache      │        │
│  └─────────────────────┘     └─────────────────────┘        │
│                                                              │
│  Internet Gateway ◄──► ALB ◄──► ECS Tasks                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Grupos de Seguridad
- **ALB SG**: Puerto 443 desde 0.0.0.0/0.
- **ECS SG**: Puerto 3000 solo desde ALB SG.
- **RDS SG**: Puerto 5432 solo desde ECS SG.
- **Redis SG**: Puerto 6379 solo desde ECS SG.

## 3. Pipeline CI/CD

### Herramientas
- **Source**: GitHub.
- **CI**: GitHub Actions.
- **CD**: AWS CodeDeploy / GitHub Actions.

### Flujo
1. **Push a main**: Trigger del pipeline.
2. **Build**: Docker image build & push a ECR.
3. **Test**: Ejecución de tests unitarios e integración.
4. **Deploy Staging**: Despliegue automático a entorno staging.
5. **Approval**: Aprobación manual para producción.
6. **Deploy Production**: Blue-green deployment.

### Tiempo Objetivo
- Build + Test: <5 minutos.
- Deploy: <5 minutos.
- Total: <10 minutos.

## 4. Contenerización

### Dockerfile (Backend)
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

### Orquestación
- **Desarrollo/Staging**: Docker Compose.
- **Producción**: ECS Fargate con auto-scaling.
- **Kubernetes**: No requerido inicialmente (overhead innecesario).

## 5. Backup y Recuperación

### Backup Automático
- **RDS**: Snapshot cada 6 horas, retención 30 días.
- **S3**: Versioning habilitado, lifecycle policies.
- **Secrets**: Backup manual exportado mensualmente.

### Recuperación ante Desastres
- **RTO**: <1 hora (restaurar desde snapshot + deploy).
- **RPO**: <15 minutos (point-in-time recovery de RDS).
- **Región secundaria**: No requerida inicialmente (costo vs beneficio).

## 6. Monitoreo

### Métricas Clave
- CPU/Memoria de contenedores (>70% alerta).
- Latencia de API (p95 >500ms alerta).
- Errores 5xx (>1% alerta).
- Conexiones a base de datos.
- Tamaño de colas SQS.

### Alertas
- Slack/Email para incidentes críticos.
- PagerDuty para guardia 24/7 (fase posterior).

### Dashboards
- CloudWatch Dashboard unificado.
- Vista por servicio y ambiente.
