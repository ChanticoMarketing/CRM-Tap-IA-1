# CRM Tap-IA

CRM interno para gestión de clientes y campañas de marketing.

## Requisitos
- Node.js 22+
- NPM 10+
- Base de datos PostgreSQL accesible desde `DATABASE_URL`

## Variables de entorno
Crear `.env` con:

```env
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Instalación
```bash
npm install
```

## Base de datos
Aplicar migraciones:

```bash
npx prisma migrate deploy
```

Ejecutar seed:

```bash
npx prisma db seed
```

## Desarrollo
```bash
npm run dev
```

## Calidad
```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Nota sobre unicidad case-insensitive
La app valida duplicados por nombre de cliente y proyecto de campaña sin distinción de mayúsculas/minúsculas.  
Las migraciones también agregan índices únicos case-insensitive en PostgreSQL para evitar duplicados por condiciones de carrera.
