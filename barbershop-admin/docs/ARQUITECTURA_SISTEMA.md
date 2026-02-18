# Arquitectura del Sistema - BarberAdmin Pro

## 1. Visión General del Sistema

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              BARBERADMIN PRO                                │
│                    Sistema de Gestión para Peluquerías                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌───────────┐ │
│  │   React     │────▶│   Node.js   │────▶│  PostgreSQL │────▶│   JWT     │ │
│  │  Frontend   │◀────│   Backend   │◀────│   Database  │◀────│   Auth    │ │
│  │  (Vite+TS)  │     │  (Express)  │     │             │     │           │ │
│  └─────────────┘     └─────────────┘     └─────────────┘     └───────────┘ │
│         │                   │                   │                           │
│         ▼                   ▼                   ▼                           │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                   │
│  │  Tailwind   │     │   bcrypt    │     │   Prisma    │                   │
│  │   shadcn    │     │    cors     │     │    ORM      │                   │
│  │    UI       │     │  helmet     │     │             │                   │
│  └─────────────┘     └─────────────┘     └─────────────┘                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 2. Stack Tecnológico

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 3.4
- **UI Components**: shadcn/ui
- **State Management**: React Context + useReducer
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Charts**: Recharts

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Prisma
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **Security**: helmet, cors, express-rate-limit
- **Validation**: Zod
- **Logging**: winston

### Base de Datos
- **Engine**: PostgreSQL 15+
- **ORM**: Prisma
- **Migrations**: Prisma Migrate

### Infraestructura
- **Hosting**: VPS/Cloud (AWS/DigitalOcean)
- **SSL**: Let's Encrypt
- **Reverse Proxy**: Nginx
- **Process Manager**: PM2

## 3. Estructura de la Base de Datos

### Diagrama ER

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│      users      │     │   employees     │     │    services     │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ id (PK)         │     │ id (PK)         │     │ id (PK)         │
│ email           │     │ user_id (FK)    │◀────│ employee_id(FK) │
│ password_hash   │     │ first_name      │     │ client_name     │
│ role            │     │ last_name       │     │ service_type    │
│ created_at      │     │ phone           │     │ price           │
│ updated_at      │     │ commission_rate │     │ commission_amt  │
│ is_active       │     │ is_active       │     │ service_date    │
└─────────────────┘     │ created_at      │     │ created_at      │
                        │ updated_at      │     │ updated_at      │
                        └─────────────────┘     └─────────────────┘
                                │
                                │
                                ▼
                        ┌─────────────────┐
                        │ service_types   │
                        ├─────────────────┤
                        │ id (PK)         │
                        │ name            │
                        │ default_price   │
                        │ is_active       │
                        └─────────────────┘
```

### Tablas Detalladas

#### 3.1 Tabla: `users`
Almacena credenciales de autenticación.

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'employee' CHECK (role IN ('admin', 'employee')),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 3.2 Tabla: `employees`
Información de barberos/estilistas.

```sql
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    photo_url VARCHAR(500),
    commission_rate DECIMAL(5,2) NOT NULL DEFAULT 50.00 CHECK (commission_rate >= 0 AND commission_rate <= 100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 3.3 Tabla: `service_types`
Catálogo de servicios ofrecidos.

```sql
CREATE TABLE service_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    default_price DECIMAL(10,2) NOT NULL,
    duration_minutes INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 3.4 Tabla: `services`
Registro de cada servicio realizado.

```sql
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
    service_type_id UUID REFERENCES service_types(id) ON DELETE SET NULL,
    client_name VARCHAR(100) NOT NULL,
    client_phone VARCHAR(20),
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    commission_rate DECIMAL(5,2) NOT NULL,
    commission_amount DECIMAL(10,2) NOT NULL,
    service_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id)
);
```

#### 3.5 Tabla: `audit_logs`
Registro de auditoría para seguridad.

```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    table_name VARCHAR(50),
    record_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 4. API Endpoints

### 4.1 Autenticación

| Método | Endpoint | Descripción | Acceso |
|--------|----------|-------------|--------|
| POST | `/api/auth/login` | Iniciar sesión | Público |
| POST | `/api/auth/logout` | Cerrar sesión | Autenticado |
| POST | `/api/auth/refresh` | Refrescar token | Autenticado |
| GET | `/api/auth/me` | Obtener usuario actual | Autenticado |

### 4.2 Gestión de Empleados

| Método | Endpoint | Descripción | Acceso |
|--------|----------|-------------|--------|
| GET | `/api/employees` | Listar empleados | Admin |
| GET | `/api/employees/:id` | Obtener empleado | Admin/Propietario |
| POST | `/api/employees` | Crear empleado | Admin |
| PUT | `/api/employees/:id` | Actualizar empleado | Admin |
| DELETE | `/api/employees/:id` | Desactivar empleado | Admin |
| GET | `/api/employees/:id/earnings` | Ganancias del empleado | Admin/Propietario |

### 4.3 Servicios

| Método | Endpoint | Descripción | Acceso |
|--------|----------|-------------|--------|
| GET | `/api/services` | Listar servicios | Admin |
| GET | `/api/services/:id` | Obtener servicio | Admin |
| POST | `/api/services` | Registrar servicio | Admin |
| PUT | `/api/services/:id` | Actualizar servicio | Admin |
| DELETE | `/api/services/:id` | Eliminar servicio | Admin |

### 4.4 Reportes y Estadísticas

| Método | Endpoint | Descripción | Acceso |
|--------|----------|-------------|--------|
| GET | `/api/reports/earnings` | Ganancias por período | Admin |
| GET | `/api/reports/employees/:id/earnings` | Ganancias por empleado | Admin |
| GET | `/api/reports/summary` | Resumen general | Admin |
| GET | `/api/reports/daily` | Reporte diario | Admin |
| GET | `/api/reports/weekly` | Reporte semanal | Admin |
| GET | `/api/reports/biweekly` | Reporte quincenal | Admin |
| GET | `/api/reports/monthly` | Reporte mensual | Admin |

### 4.5 Tipos de Servicio

| Método | Endpoint | Descripción | Acceso |
|--------|----------|-------------|--------|
| GET | `/api/service-types` | Listar tipos | Autenticado |
| POST | `/api/service-types` | Crear tipo | Admin |
| PUT | `/api/service-types/:id` | Actualizar tipo | Admin |
| DELETE | `/api/service-types/:id` | Eliminar tipo | Admin |

## 5. Cálculo de Comisiones

### 5.1 Flujo del Cálculo

```
┌─────────────────┐
│  Registrar    │
│   Servicio    │
└───────┬─────────┘
        │
        ▼
┌─────────────────┐
│  Validar      │
│   Datos       │
└───────┬─────────┘
        │
        ▼
┌─────────────────┐     ┌─────────────────┐
│  Obtener      │────▶│  % Comisión   │
│  Empleado     │     │  del Empleado │
└───────┬─────────┘     └─────────────────┘
        │
        ▼
┌─────────────────┐
│  Calcular:    │
│  commission = │
│  price * rate │
└───────┬─────────┘
        │
        ▼
┌─────────────────┐
│  Guardar en   │
│   Database    │
└─────────────────┘
```

### 5.2 Implementación del Cálculo (Backend)

```typescript
// services/commission.service.ts
class CommissionService {
  /**
   * Calcula la comisión de un servicio
   * @param price - Precio del servicio
   * @param commissionRate - Porcentaje de comisión (0-100)
   * @returns Objeto con el monto de comisión
   */
  static calculateCommission(
    price: number, 
    commissionRate: number
  ): { commissionAmount: number; salonEarnings: number } {
    // Validaciones de seguridad
    if (price < 0) throw new Error('El precio no puede ser negativo');
    if (commissionRate < 0 || commissionRate > 100) {
      throw new Error('La comisión debe estar entre 0 y 100');
    }

    // Cálculo con precisión de 2 decimales
    const commissionAmount = Math.round(price * (commissionRate / 100) * 100) / 100;
    const salonEarnings = Math.round((price - commissionAmount) * 100) / 100;

    return { commissionAmount, salonEarnings };
  }
}
```

## 6. Seguridad

### 6.1 Autenticación JWT

```
┌─────────────┐                    ┌─────────────┐
│   Cliente   │─── POST /login ───▶│   Server    │
│             │                    │             │
│             │◀── Token JWT ──────│  Genera     │
│  Almacena   │    (15 min)        │  Token      │
│  Token      │                    │             │
└──────┬──────┘                    └─────────────┘
       │
       │ POST /api/services
       │ Authorization: Bearer <token>
       ▼
┌─────────────┐                    ┌─────────────┐
│   Server    │─── Verifica JWT ──▶│   JWT       │
│             │                    │   Secret    │
│  Procesa    │◀─── Válido ────────│             │
│  Request    │                    │             │
└─────────────┘                    └─────────────┘
```

### 6.2 Middleware de Autenticación

```typescript
// middleware/auth.middleware.ts
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado' });
  }
  next();
};
```

### 6.3 Rate Limiting

```typescript
// middleware/rate-limit.middleware.ts
import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos
  message: 'Demasiados intentos de login, intente más tarde',
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 100, // 100 requests
  message: 'Límite de peticiones excedido',
});
```

### 6.4 Prevención de Manipulación

```typescript
// services/service-record.service.ts
export class ServiceRecordService {
  async createService(data: CreateServiceDTO, adminId: string) {
    // El precio y comisión vienen del servidor, NO del cliente
    const employee = await prisma.employee.findUnique({
      where: { id: data.employeeId }
    });

    if (!employee) {
      throw new Error('Empleado no encontrado');
    }

    // Obtener precio del tipo de servicio
    const serviceType = await prisma.serviceType.findUnique({
      where: { id: data.serviceTypeId }
    });

    // Usar precio del servidor, ignorar cualquier precio enviado por el cliente
    const finalPrice = serviceType?.default_price || data.price;
    
    // Calcular comisión en el backend
    const { commissionAmount } = CommissionService.calculateCommission(
      finalPrice,
      employee.commission_rate
    );

    return prisma.service.create({
      data: {
        employee_id: data.employeeId,
        service_type_id: data.serviceTypeId,
        client_name: data.clientName,
        client_phone: data.clientPhone,
        price: finalPrice, // Precio validado del servidor
        commission_rate: employee.commission_rate,
        commission_amount: commissionAmount,
        service_date: new Date(),
        created_by: adminId
      }
    });
  }
}
```

## 7. Estructura de Carpetas

### Backend
```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts
│   │   ├── env.ts
│   │   └── logger.ts
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── employee.controller.ts
│   │   ├── service.controller.ts
│   │   └── report.controller.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   ├── rate-limit.middleware.ts
│   │   └── validation.middleware.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── employee.routes.ts
│   │   ├── service.routes.ts
│   │   └── report.routes.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── commission.service.ts
│   │   ├── employee.service.ts
│   │   ├── report.service.ts
│   │   └── service-record.service.ts
│   ├── types/
│   │   ├── auth.types.ts
│   │   ├── employee.types.ts
│   │   └── service.types.ts
│   ├── utils/
│   │   ├── password.utils.ts
│   │   ├── jwt.utils.ts
│   │   └── date.utils.ts
│   ├── prisma/
│   │   └── schema.prisma
│   └── app.ts
├── tests/
├── .env.example
├── package.json
└── tsconfig.json
```

### Frontend
```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui components
│   │   ├── layout/          # Layout components
│   │   ├── forms/           # Form components
│   │   └── charts/          # Chart components
│   ├── contexts/
│   │   ├── AuthContext.tsx
│   │   └── ThemeContext.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useEmployees.ts
│   │   ├── useServices.ts
│   │   └── useReports.ts
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Employees/
│   │   ├── Services/
│   │   └── Reports/
│   ├── services/
│   │   ├── api.ts
│   │   ├── auth.service.ts
│   │   ├── employee.service.ts
│   │   └── report.service.ts
│   ├── types/
│   │   ├── auth.ts
│   │   ├── employee.ts
│   │   └── service.ts
│   ├── utils/
│   │   ├── formatters.ts
│   │   └── validators.ts
│   ├── App.tsx
│   └── main.tsx
├── public/
└── package.json
```

## 8. Flujo de Datos

### 8.1 Registrar un Servicio

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Admin   │───▶│ Frontend │───▶│  Backend │───▶│  Prisma  │───▶│    DB    │
│          │    │          │    │          │    │          │    │          │
│ Selecciona│   │  Form    │    │ Valida   │    │  Crea    │    │ Guarda   │
│ empleado │    │  datos   │    │ JWT      │    │ registro │    │ servicio │
│ y servicio│   │          │    │ Calcula  │    │          │    │          │
│          │    │          │    │ comisión │    │          │    │          │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
                                                                     │
                                                                     ▼
                                                              ┌──────────┐
                                                              │  Retorna │
                                                              │  datos   │
                                                              │  al admin│
                                                              └──────────┘
```

## 9. Buenas Prácticas Implementadas

### 9.1 Seguridad
- ✅ JWT con expiración corta (15 min)
- ✅ Refresh tokens para sesiones prolongadas
- ✅ bcrypt para hash de contraseñas (cost factor 12)
- ✅ Rate limiting en endpoints sensibles
- ✅ Helmet para headers de seguridad
- ✅ CORS configurado correctamente
- ✅ Validación de datos con Zod
- ✅ SQL Injection protection (Prisma ORM)
- ✅ XSS protection
- ✅ Audit logging

### 9.2 Arquitectura
- ✅ Separación de responsabilidades (MVC)
- ✅ Dependency Injection
- ✅ Repository Pattern (Prisma)
- ✅ Service Layer
- ✅ DTOs para validación
- ✅ Middleware reusable
- ✅ Error handling centralizado

### 9.3 Performance
- ✅ Database indexing
- ✅ Connection pooling
- ✅ Query optimization
- ✅ Caching con Redis (opcional)
- ✅ Lazy loading en frontend

### 9.4 Mantenibilidad
- ✅ TypeScript en todo el stack
- ✅ ESLint + Prettier
- ✅ Conventional commits
- ✅ API versioning
- ✅ Documentación automática (Swagger)

## 10. Variables de Entorno

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/barbershop_db"

# JWT
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="your-refresh-secret-key-min-32-chars"
JWT_REFRESH_EXPIRES_IN="7d"

# Server
PORT=3001
NODE_ENV="production"

# CORS
CORS_ORIGIN="https://yourdomain.com"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL="info"
```

---

**Documento versión**: 1.0  
**Última actualización**: 2024  
**Autor**: BarberAdmin Pro Team
