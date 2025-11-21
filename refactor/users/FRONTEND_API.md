# API Documentation - Frontend

## 📋 GET /users - Estructura de Respuesta

### Formato
```typescript
// Respuesta es un array directo (sin wrapper)
type User[] = Array<User>

type User = {
  // Campos básicos (siempre presentes)
  user_id: number;
  user_complete_name: string;
  user_dni: string;
  user_phone: string;
  user_email: string;
  user_role: "superadmin" | "owner" | "operador" | "profesional";
  user_status: 0 | 1;  // 0 = Bloqueado, 1 = Activo
  company_id: number | null;
  created_at: string;  // ISO date-time
  updated_at: string;  // ISO date-time
  
  // Campos opcionales (solo para profesionales cuando consulta Owner/Operador)
  apto_recibir?: 0 | 1;  // 0 = No apto, 1 = Apto para recibir trabajo
  especialidades?: Array<{
    Especialidad: {
      nombre_especialidad: string;
    };
  }>;
}
```

### Diferencias por Rol

**SuperAdmin:**
- Ve todos los usuarios del sistema
- NO incluye `apto_recibir` ni `especialidades`

**Owner/Operador:**
- Ve solo usuarios de su empresa
- Para profesionales: incluye `apto_recibir` y `especialidades`

---

## 🔑 Valores Definidos

### Roles
```typescript
type UserRole = "superadmin" | "owner" | "operador" | "profesional"
```

### Estados
```typescript
// user_status
0 = Bloqueado/Deshabilitado
1 = Activo/Habilitado

// apto_recibir (solo profesionales)
0 = No apto para recibir trabajo
1 = Apto para recibir trabajo
```

---

## 📝 Ejemplo de Respuesta

### SuperAdmin
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
  }
]
```

### Owner/Operador (con profesional)
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
      }
    ]
  }
]
```

---

## ⚠️ Notas Importantes

1. **Array directo:** La respuesta NO tiene wrapper `{ data: [...] }`, es directamente un array
2. **Campos opcionales:** `apto_recibir` y `especialidades` solo aparecen para profesionales cuando Owner/Operador consulta
3. **user_status:** Se devuelve como número (0/1), no como boolean
4. **Consistencia:** Los campos básicos son siempre los mismos

---

## 🔗 Swagger Documentation

- **Endpoint:** `/api-docs` (cuando el servidor está corriendo)
- **Ver documentación interactiva:** `http://localhost:8888/api-docs`
- **Buscar:** `GET /users` en la documentación

---

## 💡 Helpers Recomendados

```typescript
// Verificar si es profesional
function isProfesional(user: User): boolean {
  return user.user_role === "profesional";
}

// Verificar si está activo
function isActive(user: User): boolean {
  return user.user_status === 1;
}

// Obtener especialidades como array de strings
function getEspecialidades(user: User): string[] {
  return user.especialidades?.map(e => e.Especialidad.nombre_especialidad) || [];
}

// Verificar si está apto para recibir trabajo
function isAptoRecibir(user: User): boolean {
  return user.apto_recibir === 1;
}
```

---

**Última actualización:** 2025-01-21

