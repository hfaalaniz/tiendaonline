# Tienda Online de Bijouterie y Moda

Proyecto de tienda online con panel de administración, catálogo público y gestión de productos en Supabase.

## Características

- Catálogo público con filtros por categoría y búsqueda
- Página de detalle de producto
- Carrito de compras local
- Panel de administración CRUD de productos
- Carga de imágenes a Supabase Storage
- API de pago con Mercado Pago (ejemplo)

## Configuración

1. Copia el archivo de ejemplo:

```bash
copy .env.local.example .env.local
```

2. Completa las variables con las credenciales de tu proyecto Supabase.

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_ADMIN_SECRET`
- `NEXT_PUBLIC_WHATSAPP_NUMBER`
- `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY`
- `MERCADOPAGO_ACCESS_TOKEN`

3. Crea la tabla `products` en Supabase con esta estructura:

- `id`: uuid, clave primaria, valor por defecto `gen_random_uuid()`
- `title`: text
- `description`: text
- `price`: numeric
- `category`: text
- `image_url`: text
- `featured`: boolean
- `created_at`: timestamp with time zone, valor por defecto `now()`

4. Crea un bucket público llamado `images` en Supabase Storage.

5. Opcional: usa el SQL de `supabase/schema.sql` para crear la tabla y `supabase/seed.sql` para insertar datos de ejemplo.

6. Para cargar datos semilla desde el proyecto, instala dependencias y ejecuta:

```bash
npm install
npm run seed
```

Esto inserta ejemplos con imágenes externas CDN en la tabla `products`.

## Instalación

```bash
npm install
npm run dev
```

## Rutas principales

- `/` - Tienda pública con catálogo y filtros
- `/product/[id]` - Detalle de producto
- `/cart` - Carrito de compras
- `/admin` - Panel de administración de productos

## Notas

- El panel de administración usa un secreto simple en `NEXT_PUBLIC_ADMIN_SECRET`.
- Ajusta la integración de Mercado Pago en `pages/api/checkout.ts` cuando tengas tus credenciales reales.
