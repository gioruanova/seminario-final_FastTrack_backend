// HELPERS PARA VALIDACIONES COMUNES
// ----------------------------------------------------------
// ----------------------------------------------------------

// -----------------
// VALIDAR CAMPOS OBLIGATORIOS
// -----------------
function validarCamposObligatorios(datos, camposRequeridos) {
  const faltantes = [];
  const vacios = [];

  for (const campo of camposRequeridos) {
    if (!(campo in datos)) {
      faltantes.push(campo);
    } else {
      const valor = datos[campo];
      if (
        valor === null ||
        valor === undefined ||
        (typeof valor === 'string' && valor.trim() === '')
      ) {
        vacios.push(campo);
      }
    }
  }

  if (faltantes.length > 0) {
    return {
      valid: false,
      error: `Faltan campos requeridos: ${faltantes.join(', ')}`,
      missing: faltantes,
      empty: [],
    };
  }

  if (vacios.length > 0) {
    return {
      valid: false,
      error: `Los siguientes campos no pueden estar vacíos: ${vacios.join(', ')}`,
      missing: [],
      empty: vacios,
    };
  }

  return {
    valid: true,
    missing: [],
    empty: []
  };
}

// -----------------
// FILTRAR SOLO CAMPOS PERMITIDOS PARA ACTUALIZAR
// -----------------
function filtrarCamposPermitidos(body, camposPermitidos, validarVacios = true) {
  const filtrados = {};
  const vacios = [];

  for (const campo of camposPermitidos) {
    if (campo in body) {
      const valor = body[campo];

      if (validarVacios) {
        if (
          valor === null ||
          valor === undefined ||
          (typeof valor === 'string' && valor.trim() === '')
        ) {
          vacios.push(campo);
          continue;
        }
      }

      filtrados[campo] = valor;
    }
  }

  return {
    data: filtrados,
    empty: validarVacios ? vacios : [],
    hasEmpty: vacios.length > 0,
  };
}

// -----------------
// VALIDAR FORMATO DE EMAIL
// -----------------
function validarEmail(email) {
  if (!email || typeof email !== 'string') {
    return false;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// -----------------
// VALIDAR FORMATO DE DNI
// -----------------
function validarDNI(dni) {
  if (!dni) {
    return false;
  }
  const dniStr = dni.toString();
  return /^\d{7,8}$/.test(dniStr);
}

// -----------------
// VALDAAR QUE UN VALOR NO ESTÉ VACÍO
// -----------------
function noEstaVacio(valor) {
  if (valor === null || valor === undefined) {
    return false;
  }
  if (typeof valor === 'string' && valor.trim() === '') {
    return false;
  }
  return true;
}

// -----------------
// VALIDAR Y NORMALIZAR USER_ROLE
// -----------------
function validarUserRole(role) {
  const rolesValidos = ["superadmin", "owner", "operador", "profesional"];
  
  if (!role || typeof role !== 'string') {
    return { valid: false, normalized: null };
  }
  
  const normalized = role.toLowerCase().trim();
  
  if (!rolesValidos.includes(normalized)) {
    return { valid: false, normalized: null };
  }
  
  return { valid: true, normalized };
}

module.exports = {
  validarCamposObligatorios,
  filtrarCamposPermitidos,
  validarEmail,
  validarDNI,
  noEstaVacio,
  validarUserRole,
};
