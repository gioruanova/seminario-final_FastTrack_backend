# Estrategia: Refactorización de Feedback

## Objetivo
Unificar rutas de feedback siguiendo el mismo patrón que users. Una sola ruta `/feedback` que maneja todo según el rol.

---

## Estructura Final

### Servicio
```
services/
└── FeedbackService.js  # Lógica de negocio (ya existe, sin cambios)
```

### Controlador
- `FeedbackController.js` - CRUD feedback (ya existe, sin cambios)

### Rutas (Consolidador)
```
routes/
└── feedback/
    └── feedbackRoutes.js  # Una sola ruta /feedback
```

---

## Rutas Unificadas

### ANTES
```
GET    /superApi/platform/feedbacks              → getFeedbacks (solo superadmin)
GET    /superApi/platform/feedbacks/:id          → getFeedbackById (solo superadmin)
DELETE /superApi/platform/feedbacks/:id          → deleteFeedback (solo superadmin)
POST   /customersApi/platform/feedback           → createFeedback (owner, operador, profesional)
```

### DESPUÉS
```
GET    /feedback                    → getFeedbacks (superadmin, owner, operador)
GET    /feedback/:feedback_id       → getFeedbackById (superadmin, owner, operador)
POST   /feedback                    → createFeedback (owner, operador, profesional)
DELETE /feedback/:feedback_id       → deleteFeedback (solo superadmin)
```

---

## Principios

1. **Una sola ruta** - No `/superApi/platform/feedbacks` ni `/customersApi/platform/feedback`, solo `/feedback`
2. **Middleware unificado** - Usa `authUsers` que maneja todos los roles
3. **Servicio sin cambios** - La lógica ya está bien separada en `FeedbackService`
4. **Controlador sin cambios** - Ya está bien estructurado
5. **Respuestas idénticas** - NO cambiar estructura de datos de respuesta

---

## Flujo de Datos

```
Request → Route (Middleware valida auth) → Controller → Service → DB
                                                          ↓
                                                    Response (idéntica)
```

---

## Implementación Completada

✅ Consolidador de rutas creado (`routes/feedback/feedbackRoutes.js`)  
✅ Rutas unificadas en `/feedback`  
✅ Rutas antiguas comentadas en `superRoutes.js` y `userRoutes.js`  
✅ Agregado a `routes/index.js`  
✅ Agregado a `app.js`  
✅ Respuestas HTTP idénticas mantenidas  

---

**Última actualización:** 2025-01-21

