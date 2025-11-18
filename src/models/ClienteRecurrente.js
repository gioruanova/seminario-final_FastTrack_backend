
const BaseModel = require("../db/BaseModel");

class ClienteRecurrente extends BaseModel {
  static get tableName() {
    return "clientes_recurrentes";
  }

  static get idColumn() {
    return "cliente_id";
  }

  static get relationMappings() {
    const Company = require("./Company");

    return {
      company: {
        relation: BaseModel.BelongsToOneRelation,
        BaseModelClass: Company,
        join: {
          from: "clientes_recurrentes.company_id",
          to: "companies.company_id",
        },
      },
    };
  }
  $beforeUpdate() {
    this.updated_at = new Date();
  }
}

module.exports = ClienteRecurrente;
