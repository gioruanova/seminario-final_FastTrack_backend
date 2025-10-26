exports.seed = async function (knex) {
  await knex("companies_config").del();

  await knex("companies_config").insert([
    {
      company_id: "1000",
      sing_heading_profesional: "Trabajador",
      plu_heading_profesional: "Trabajdores",

      sing_heading_especialidad: "Actividad",
      plu_heading_especialidad: "Actividades",

      sing_heading_owner: "Dueño",
      plu_heading_owner: "Dueños",

      sing_heading_solicitante:"Solicitante",
      plu_heading_solicitante:"Solicitantes",

      sing_heading_reclamos:"Solicitud",
      plu_heading_reclamos:"Solicitudes",

      
      
      
      string_inicio_reclamo_solicitante:
        "Hemos generado una gestión en base a su pedido. Adjunta encontrará la información pertinente al mismo:",
      string_recordatorio_reclamo_solicitante:
        "La fecha de gestión de su pedido se acerca. Adjunta encontrará la información pertinente al mismo:",
      string_actualizacion_reclamo_solicitante:
        "Hay una nueva actualizacion en una gestion registrada. Adjunta encontrará la información pertinente al mismo:",
      string_cierre_reclamo_solicitante:
        "Su gestión ha finalizado. Adjunta encontrará la información pertinente al mismo:",

      string_inicio_reclamo_profesional:
        "Se ha generado una nueva asignación para su actividad. Adjunta encontrará la información pertinente al mismo:",
      string_recordatorio_reclamo_profesional:
        "La fecha de gestión de su actividad se acerca. Adjunta encontrará la información pertinente al mismo:",
      string_actualizacion_reclamo_profesional:
        "Hay una nueva actualizacion en una gestion registrada  a su nombre. Adjunta encontrará la información pertinente al mismo:",
      string_cierre_reclamo_profesional:
        "Se ha finalizado la gestión asignada. Adjunta encontrará la información pertinente al mismo:",
    },
    {
      company_id: "1001",
      string_inicio_reclamo_solicitante:
        "Hemos generado una gestión en base a su pedido. Adjunta encontrará la información pertinente al mismo:",
      string_recordatorio_reclamo_solicitante:
        "La fecha de gestión de su pedido se acerca. Adjunta encontrará la información pertinente al mismo:",
      string_actualizacion_reclamo_solicitante:
        "Hay una nueva actualizacion en una gestion registrada. Adjunta encontrará la información pertinente al mismo:",
      string_cierre_reclamo_solicitante:
        "Su gestión ha finalizado. Adjunta encontrará la información pertinente al mismo:",

      string_inicio_reclamo_profesional:
        "Se ha generado una nueva asignación para su actividad. Adjunta encontrará la información pertinente al mismo:",
      string_recordatorio_reclamo_profesional:
        "La fecha de gestión de su actividad se acerca. Adjunta encontrará la información pertinente al mismo:",
      string_actualizacion_reclamo_profesional:
        "Hay una nueva actualizacion en una gestion registrada  a su nombre. Adjunta encontrará la información pertinente al mismo:",
      string_cierre_reclamo_profesional:
        "Se ha finalizado la gestión asignada. Adjunta encontrará la información pertinente al mismo:",
    },
  ]);
};
