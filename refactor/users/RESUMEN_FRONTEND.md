# Resumen Rápido - Cambios de Endpoints

## 🔄 Cambios Principales

### 1. Usuarios - Rutas Unificadas
**ANTES:** `/superApi/users` y `/customersApi/users`  
**DESPUÉS:** `/users` (una sola ruta para todos)

**Cambios específicos:**
- `/superApi/users` → `/users`
- `/customersApi/users` → `/users`
- `/users/block/:id` → `/users/:id/block` ⚠️ **Patrón cambiado** (acción después del ID)
- `/users/unblock/:id` → `/users/:id/unblock` ⚠️ **Patrón cambiado** (acción después del ID)
- `/users/restore/:id` → `/users/:id/restore` ⚠️ **Patrón cambiado** (acción después del ID)

**¿Qué significa "Patrón cambiado"?**
- **ANTES:** La acción (`block`, `unblock`, `restore`) venía ANTES del ID del usuario
- **DESPUÉS:** La acción viene DESPUÉS del ID del usuario
- **Ejemplo:** `/users/block/123` → `/users/123/block` (más RESTful)

---

### 2. Perfil - Rutas Unificadas
**ANTES:** `/publicApi/profile` (GET) y `/customersApi/profile/manage` (PUT)  
**DESPUÉS:** `/profile` (GET y PUT)

**Cambios específicos:**
- `/publicApi/profile` → `/profile` (GET) ⚠️ **Ahora requiere autenticación**
- `/customersApi/profile/manage` → `/profile` (PUT)

---

### 3. Workload - Ruta Simplificada
**ANTES:** `/customersApi/workload/*`  
**DESPUÉS:** `/workload/*`

**Cambios específicos:**
- `/customersApi/workload/estado` → `/workload/estado`
- `/customersApi/workload/enable` → `/workload/enable`
- `/customersApi/workload/disable` → `/workload/disable`

---

## 📝 Código de Ejemplo

### Buscar y Reemplazar Global

```javascript
// 1. Reemplazar todas las URLs de usuarios
'/superApi/users' → '/users'
'/customersApi/users' → '/users'

// 2. Cambiar patrones de bloqueo/desbloqueo/restauración
'/users/block/' → '/users/'
'/users/unblock/' → '/users/'
'/users/restore/' → '/users/'

// Luego agregar '/block', '/unblock', '/restore' al final:
// ANTES: `/users/block/${id}` 
// DESPUÉS: `/users/${id}/block`

// 3. Reemplazar URLs de perfil
'/publicApi/profile' → '/profile'
'/customersApi/profile/manage' → '/profile'

// 4. Reemplazar URLs de workload
'/customersApi/workload' → '/workload'
```

---

## ⚠️ Importante

1. **Autenticación:** Todos los endpoints requieren `credentials: 'include'` en fetch
2. **GET /profile:** Ahora requiere autenticación (antes era público)
3. **Respuestas:** NO cambian - mismo formato JSON, mismos códigos HTTP

---

## ✅ Checklist Rápido

- [ ] Buscar/reemplazar: `/superApi/users` → `/users`
- [ ] Buscar/reemplazar: `/customersApi/users` → `/users`
- [ ] Cambiar: `/users/block/${id}` → `/users/${id}/block`
- [ ] Cambiar: `/users/unblock/${id}` → `/users/${id}/unblock`
- [ ] Cambiar: `/users/restore/${id}` → `/users/${id}/restore`
- [ ] Buscar/reemplazar: `/publicApi/profile` → `/profile`
- [ ] Buscar/reemplazar: `/customersApi/profile/manage` → `/profile`
- [ ] Buscar/reemplazar: `/customersApi/workload` → `/workload`
- [ ] Agregar `credentials: 'include'` a todas las peticiones autenticadas
- [ ] Verificar que GET `/profile` ahora envía cookies

---

## 🎯 Ejemplos Prácticos

```javascript
// ANTES
fetch('/superApi/users')
fetch('/customersApi/users/block/123')
fetch('/publicApi/profile')
fetch('/customersApi/profile/manage', { method: 'PUT', body: data })

// DESPUÉS
fetch('/users', { credentials: 'include' })
fetch('/users/123/block', { method: 'POST', credentials: 'include' })
fetch('/profile', { credentials: 'include' })
fetch('/profile', { method: 'PUT', credentials: 'include', body: data })
```

---

**Última actualización:** 2025-01-21

