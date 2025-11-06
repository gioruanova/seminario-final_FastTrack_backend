// HELPERS PARA ENVIAR RESPUESTAS AL FRONT
// ----------------------------------------------------------
// ----------------------------------------------------------


// -----------------
// ENVIAR LISTA DE DATOS
// -----------------
function enviarLista(res, datos, codigo = 200) {
  return res.status(codigo).json(datos);
}

// -----------------
// ENVIAR MENSAJE DE ÉXITO
// -----------------
function enviarExito(res, mensaje, codigo = 200) {
  return res.status(codigo).json({
    success: true,
    message: mensaje
  });
}

// -----------------
// ENVIAR ÉXITO CON DATOS DEL USUARIO (PARA LOGIN)
// -----------------
function enviarExitoConDatos(res, datos = {}, mensaje, codigo = 200) {
  return res.json({
    ...datos,
    status: codigo,
    success: true,
    message: mensaje
  });
}

// -----------------
// ENVIAR ÉXITO PARA RECLAMOS
// -----------------
function enviarExitoReclamo(res, mensaje, codigo = 200) {
  return res.json({
    status: codigo,
    message: mensaje
  });
}

// -----------------
// ENVIAR VALOR SIMPLE (BOOLEANO, NÚMERO, ETC)
// -----------------
function enviarValor(res, valor) {
  return res.json(valor);
}

// -----------------
// ENVIAR MENSAJE DE ERROR
// -----------------
function enviarError(res, mensaje, codigo = 500) {
  return res.status(codigo).json({
    error: mensaje
  });
}

// -----------------
// ENVIAR ERROR PARA RECLAMOS
// -----------------
function enviarErrorReclamo(res, mensaje, codigo = 400) {
  return res.status(codigo).json({
    status: codigo,
    error: mensaje
  });
}

// -----------------
// ENVIAR ERROR: NO ENCONTRADO
// -----------------
function enviarNoEncontrado(res, nombreRecurso = "Recurso") {
  return res.status(404).json({
    error: `${nombreRecurso} no encontrado`
  });
}

// -----------------
// ENVIAR ERROR: CONFLICTO (DUPLICADO)
// -----------------
function enviarConflicto(res, mensaje) {
  return res.status(409).json({
    error: mensaje
  });
}

// -----------------
// ENVIAR ERROR: SOLICITUD INVÁLIDA
// -----------------
function enviarSolicitudInvalida(res, mensaje) {
  return res.status(400).json({
    error: mensaje
  });
}

// -----------------
// ENVIAR ERROR: SIN PERMISO
// -----------------
function enviarSinPermiso(res, mensaje = "No tenés permiso para realizar esta acción") {
  return res.status(403).json({
    error: mensaje
  });
}

// -----------------
// ENVIAR ERROR: NO AUTENTICADO
// -----------------
function enviarNoAutenticado(res, mensaje = "No autenticado") {
  return res.status(401).json({
    error: mensaje
  });
}

module.exports = {
  enviarLista,
  enviarExito,
  enviarExitoConDatos,
  enviarExitoReclamo,
  enviarValor,
  enviarError,
  enviarErrorReclamo,
  enviarNoEncontrado,
  enviarConflicto,
  enviarSolicitudInvalida,
  enviarSinPermiso,
  enviarNoAutenticado,
};
