# Estrategia: Refactorización de Usuarios

## Objetivo
Implementar capa de servicio con rutas unificadas. El dispatcher maneja la lógica según el rol del usuario autenticado.

---

## Estructura Final

### Servicios (por entidad)
```
services/
├── users/
│   ├── UserService.js           # Funciones esenciales BD
│   ├── UserAdminService.js      # Lógica SuperAdmin
│   ├── UserOwnerService.js      # Lógica Owner
│   └── UserOperadorService.js   # Lógica Operador
├── profile/
│   └── ProfileService.js        # Perfil propio
└── workload/
    └── WorkloadService.js      # Carga de trabajo profesional
```

### Controladores
- `UserController.js` - CRUD usuarios + dispatcher
- `ProfileController.js` - Perfil propio (GET y PUT)
- `WorkloadController.js` - Carga de trabajo

### Rutas (Consolidador por Entidad)
```
routes/
├── users/userRoutes.js      # Una sola ruta /users
├── profile/profileRoutes.js # Una sola ruta /profile
├── workload/workloadRoutes.js # Una sola ruta /workload
└── index.js                 # Exporta todos
```

---

## Rutas Unificadas

### Concepto
**Una sola ruta** por entidad. El middleware valida autenticación y el dispatcher dirige según rol.

**Ejemplo:**
```javascript
// Una sola ruta /users para todos los roles
app.use("/users", userRoutes);

// El dispatcher en el controlador maneja todo:
async function createUser(req, res) {
  const role = req.user?.user_role || "superadmin";
  switch (role) {
    case "superadmin": return await createUserAsAdmin(req, res);
    case "owner": return await createUserAsOwner(req, res);
    case "operador": return await createUserAsOperador(req, res);
  }
}
```

---

## Principios

1. **Una sola ruta** - No `/superApi/users` ni `/customersApi/users`, solo `/users`
2. **Dispatcher maneja todo** - Según `req.user.user_role`
3. **Código repetido OK** - Preferir explícito sobre abstracción innecesaria
4. **Helpers mínimos** - Solo funciones genéricas realmente necesarias
5. **Separación clara** - Profile y Workload en capas separadas
6. **⚠️ CRÍTICO: Respuestas idénticas** - NO cambiar estructura de datos de respuesta

---

## Regla de Oro: Mantener Respuestas Idénticas

### Formato de Respuestas (NO CAMBIAR)

**Éxito con mensaje:**
```javascript
enviarExito(res, "Usuario creado correctamente", 201);
// Respuesta: { success: true, message: "Usuario creado correctamente" }
// Status: 201
```

**Lista de datos:**
```javascript
enviarLista(res, users);
// Respuesta: [array de usuarios] (directo, sin wrapper)
// Status: 200
```

**Error:**
```javascript
enviarError(res, "Error interno del servidor", 500);
// Respuesta: { error: "Error interno del servidor" }
// Status: 500
```

**NO cambiar:**
- ❌ Nombres de campos
- ❌ Tipos de datos
- ❌ Códigos HTTP
- ❌ Estructura de respuestas

---

## Flujo de Datos

```
Request → Route (Middleware valida auth) → Controller Dispatcher → Service → DB
                                                                    ↓
                                                              Response (idéntica)
```

---

## Implementación Completada

✅ Servicios creados por rol  
✅ Controladores con dispatcher  
✅ Rutas unificadas por entidad  
✅ Middleware `authUsers` (maneja superadmin + otros roles)  
✅ Código antiguo movido a `old/`  
✅ Respuestas HTTP idénticas mantenidas  

---

**Última actualización:** 2025-01-21

