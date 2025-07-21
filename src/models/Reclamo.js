const BaseModel = require("../db/BaseModel");

class Reclamo extends BaseModel {
  static get tableName() {
    return "reclamos";
  }

  static get idColumn() {
    return "reclamo_id";
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: [
        "reclamo_titulo",
        "reclamo_detalle",
        "reclamo_estado",
        "company_id",
        "especialidad_id",
        "cliente_id",
      ],
      properties: {
        reclamo_id: { type: "integer" },
        reclamo_titulo: { type: "string", minLength: 1 },
        reclamo_detalle: { type: "string", minLength: 1 },
        reclamo_url: { type: ["string", "null"], minLength: 1 },
        reclamo_estado: {
          type: "string",
          enum: [
            "ABIERTO",
            "EN PROCESO",
            "EN PAUSA",
            "CERRADO",
            "CANCELADO",
            "RE-ABIERTO",
          ],
          default: "ABIERTO",
        },
        creado_por: { type: ["integer", "null"] },
        company_id: { type: "integer" },
        especialidad_id: { type: "integer" },
        profesional_id: { type: ["integer", "null"] },
        cliente_id: { type: "integer" },
        reclamo_nota_cierre: { type: ["string", "null"] },
        reclamo_presupuesto: { type: ["number", "null"] },

        created_at: { type: "string", format: "date-time" },
        updated_at: { type: "string", format: "date-time" },
      },
    };
  }
  $beforeUpdate() {
    this.updated_at = new Date().toISOString().slice(0, 19).replace("T", " ");
  }

  static get relationMappings() {
    const User = require("./User");
    const Company = require("./Company");
    const Especialidad = require("./Especialidad");
    const ClienteRecurrente = require("./ClienteRecurrente");
    const AgendaReclamo = require("./AgendaReclamo");

    return {
      creador: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "reclamos.creado_por",
          to: "users.user_id",
        },
      },

      company: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Company,
        join: {
          from: "reclamos.company_id",
          to: "companies.company_id",
        },
      },

      especialidad: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Especialidad,
        join: {
          from: "reclamos.especialidad_id",
          to: "especialidades.id_especialidad",
        },
      },

      profesional: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "reclamos.profesional_id",
          to: "users.user_id",
        },
      },

      cliente: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: ClienteRecurrente,
        join: {
          from: "reclamos.cliente_id",
          to: "clientes_recurrentes.cliente_id",
        },
      },

      agendaReclamo: {
        relation: BaseModel.HasOneRelation,
        modelClass: AgendaReclamo,
        join: {
          from: "reclamos.reclamo_id",
          to: "agenda_reclamo.reclamo_id",
        },
      },
    };
  }
}

module.exports = Reclamo;
