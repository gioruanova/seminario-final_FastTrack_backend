# Resumen Rápido - Cambios de Endpoints Feedback

## 🔄 Cambios Principales

### Feedback - Rutas Unificadas
**ANTES:** `/superApi/platform/feedbacks` y `/customersApi/platform/feedback`  
**DESPUÉS:** `/feedback` (una sola ruta para todos)

**Cambios específicos:**
- `/superApi/platform/feedbacks` → `/feedback` (GET)
- `/superApi/platform/feedbacks/:id` → `/feedback/:feedback_id` (GET)
- `/superApi/platform/feedbacks/:id` → `/feedback/:feedback_id` (DELETE)
- `/customersApi/platform/feedback` → `/feedback` (POST)

---

## 📝 Código de Ejemplo

### Buscar y Reemplazar Global

```javascript
// Reemplazar todas las URLs de feedback
'/superApi/platform/feedbacks' → '/feedback'
'/customersApi/platform/feedback' → '/feedback'
```

---

## ⚠️ Importante

1. **Autenticación:** Todos los endpoints requieren `credentials: 'include'` en fetch
2. **Respuestas:** NO cambian - mismo formato JSON, mismos códigos HTTP
3. **Parámetros:** `feedback_id` en lugar de `id` en algunas rutas

---

## ✅ Checklist Rápido

- [ ] Buscar/reemplazar: `/superApi/platform/feedbacks` → `/feedback`
- [ ] Buscar/reemplazar: `/customersApi/platform/feedback` → `/feedback`
- [ ] Cambiar parámetro: `/:id` → `/:feedback_id` (si aplica)
- [ ] Agregar `credentials: 'include'` a todas las peticiones autenticadas

---

## 🎯 Ejemplos Prácticos

```javascript
// ANTES
fetch('/superApi/platform/feedbacks')
fetch('/superApi/platform/feedbacks/123')
fetch('/customersApi/platform/feedback', { method: 'POST', body: data })

// DESPUÉS
fetch('/feedback', { credentials: 'include' })
fetch('/feedback/123', { credentials: 'include' })
fetch('/feedback', { method: 'POST', credentials: 'include', body: data })
```

---

**Última actualización:** 2025-01-21

