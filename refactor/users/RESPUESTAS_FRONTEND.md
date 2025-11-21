# Respuestas para Frontend - GET /users

## 1. Endpoint GET /users - ¿Varía según el rol?

### ✅ SÍ, la respuesta varía según el rol

**SuperAdmin:**
- Ve **todos los usuarios** de **todas las empresas**
- NO incluye `apto_recibir` ni `especialidades`

**Owner/Operador:**
- Ve **solo usuarios de su empresa**
- Para profesionales: **SÍ incluye** `apto_recibir` y `especialidades`

**Estructura JSON:**
- Los campos básicos son **idénticos** para todos
- Los campos adicionales (`apto_recibir`, `especialidades`) solo aparecen cuando Owner/Operador consulta profesionales

---

## 2. Campos exactos de GET /users

### Campos básicos (siempre presentes)
```typescript
{
  user_id: number;
  user_complete_name: string;  // ⚠️ NO es "user_name"
  user_dni: string;
  user_phone: string;
  user_email: string;
  user_role: "superadmin" | "owner" | "operador" | "profesional";
  user_status: 0 | 1;  // ⚠️ Número, no boolean
  company_id: number | null;
  created_at: string;  // ISO date-time
  updated_at: string;  // ISO date-time
}
```

### Campos opcionales (solo Owner/Operador → profesionales)
```typescript
{
  apto_recibir?: 0 | 1;  // Solo profesionales
  especialidades?: Array<{
    Especialidad: {
      nombre_especialidad: string;
    };
  }>;  // Solo profesionales
}
```

**Respuesta:** Es un **array directo**, NO tiene wrapper `{ data: [...] }`

---

## 3. Tipos de roles

### ✅ Roles definidos en backend
**Ubicación:** `src/models/User.js`

**Valores exactos:**
```typescript
"superadmin" | "owner" | "operador" | "profesional"
```

**Definición en código:**
```javascript
user_role: { 
  type: "string", 
  enum: ["superadmin", "owner", "operador", "profesional"],
  maxLength: 50 
}
```

**Respuesta:** Estos son los únicos 4 roles. No hay más y están fijos en el enum del modelo.

---

## 4. Estados de usuario

### ✅ user_status tiene valores fijos

**Valores posibles:**
- `0` = Bloqueado/Deshabilitado
- `1` = Activo/Habilitado

**Tipo:** Se devuelve como **número** (no boolean)

**Definición en código:**
```javascript
user_status: { type: "boolean", default: true }  // En BD es boolean
// Pero se devuelve como: 0 o 1 (número)
```

**Respuesta:** Solo 0 y 1. No hay otros valores posibles (2, 3, etc.).

---

## 5. Diferencia entre GET /profile y GET /users

### GET /profile (usuario autenticado)
```typescript
{
  user_id: number;
  user_email: string;
  user_name: string;  // ⚠️ Diferente: "user_name" no "user_complete_name"
  user_role: string;
  company_id: number | null;
  company_name: string | null;
  company_status: number | null;
  user_phone: string | null;
  company_phone: string | null;
  company_email: string | null;
  company_whatsapp: string | null;
  company_telegram: string | null;
  user_dni: string | null;
  // NO incluye: created_at, updated_at, user_status, apto_recibir
}
```

### GET /users (lista de usuarios)
```typescript
{
  user_id: number;
  user_complete_name: string;  // ⚠️ Diferente: "user_complete_name"
  user_dni: string;
  user_phone: string;
  user_email: string;
  user_role: string;
  user_status: 0 | 1;
  company_id: number | null;
  created_at: string;
  updated_at: string;
  apto_recibir?: 0 | 1;  // Opcional
  especialidades?: Array<...>;  // Opcional
}
```

**Diferencias clave:**
1. **Nombre del campo:** `/profile` usa `user_name`, `/users` usa `user_complete_name`
2. **Campos adicionales:** `/profile` incluye datos de empresa, `/users` incluye `user_status`, `created_at`, `updated_at`
3. **Estructura:** `/profile` es objeto único, `/users` es array

**Respuesta:** **NO son la misma estructura**. Son diferentes y sirven para propósitos distintos.

---

## 📋 Ejemplos de Respuesta Real

### SuperAdmin - GET /users
```json
[
  {
    "user_id": 1,
    "user_complete_name": "Juan Pérez",
    "user_dni": "12345678",
    "user_phone": "+54 9 11 1234-5678",
    "user_email": "juan@empresa.com",
    "user_role": "owner",
    "user_status": 1,
    "company_id": 5,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  },
  {
    "user_id": 2,
    "user_complete_name": "María García",
    "user_dni": "87654321",
    "user_phone": "+54 9 11 9876-5432",
    "user_email": "maria@empresa.com",
    "user_role": "profesional",
    "user_status": 1,
    "company_id": 5,
    "created_at": "2024-01-16T14:20:00Z",
    "updated_at": "2024-01-16T14:20:00Z"
  }
]
```

### Owner/Operador - GET /users (con profesional)
```json
[
  {
    "user_id": 2,
    "user_complete_name": "María García",
    "user_dni": "87654321",
    "user_phone": "+54 9 11 9876-5432",
    "user_email": "maria@empresa.com",
    "user_role": "profesional",
    "user_status": 1,
    "company_id": 5,
    "created_at": "2024-01-16T14:20:00Z",
    "updated_at": "2024-01-16T14:20:00Z",
    "apto_recibir": 1,
    "especialidades": [
      {
        "Especialidad": {
          "nombre_especialidad": "Cardiología"
        }
      },
      {
        "Especialidad": {
          "nombre_especialidad": "Neurología"
        }
      }
    ]
  }
]
```

### GET /profile (usuario autenticado)
```json
{
  "user_id": 1,
  "user_email": "juan@empresa.com",
  "user_name": "Juan Pérez",
  "user_role": "owner",
  "company_id": 5,
  "company_name": "Mi Empresa S.A.",
  "company_status": 1,
  "user_phone": "+54 9 11 1234-5678",
  "company_phone": "+54 9 11 1234-5678",
  "company_email": "contacto@miempresa.com",
  "company_whatsapp": "+54 9 11 1234-5678",
  "company_telegram": "@miempresa",
  "user_dni": "12345678"
}
```

---

## ✅ Recomendaciones para Frontend

### 1. Interfaces separadas
```typescript
// Para GET /users
interface User {
  user_id: number;
  user_complete_name: string;  // ⚠️ Diferente nombre
  user_dni: string;
  user_phone: string;
  user_email: string;
  user_role: UserRole;
  user_status: 0 | 1;
  company_id: number | null;
  created_at: string;
  updated_at: string;
  apto_recibir?: 0 | 1;
  especialidades?: Especialidad[];
}

// Para GET /profile
interface Profile {
  user_id: number;
  user_email: string;
  user_name: string;  // ⚠️ Diferente nombre
  user_role: UserRole;
  company_id: number | null;
  company_name: string | null;
  // ... otros campos de empresa
}
```

### 2. Constantes para roles y estados
```typescript
export const USER_ROLES = {
  SUPERADMIN: "superadmin",
  OWNER: "owner",
  OPERADOR: "operador",
  PROFESIONAL: "profesional",
} as const;

export const USER_STATUS = {
  BLOQUEADO: 0,
  ACTIVO: 1,
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];
export type UserStatus = typeof USER_STATUS[keyof typeof USER_STATUS];
```

### 3. Helpers seguros
```typescript
function isProfesional(user: User): boolean {
  return user.user_role === USER_ROLES.PROFESIONAL;
}

function isActive(user: User): boolean {
  return user.user_status === USER_STATUS.ACTIVO;
}

function getEspecialidades(user: User): string[] {
  return user.especialidades?.map(e => e.Especialidad.nombre_especialidad) || [];
}
```

---

## 📚 Documentación Adicional

- **Swagger UI:** `http://localhost:8888/api-docs` (cuando el servidor está corriendo)
- **Modelo User:** `src/models/User.js`
- **Documentación completa:** `refactor/users/FRONTEND_API.md`

---

**Última actualización:** 2025-01-21

