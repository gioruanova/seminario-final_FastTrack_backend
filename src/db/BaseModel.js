const { Model } = require("objection");
const knex = require("./knex");

Model.knex(knex);

class BaseModel extends Model {}

module.exports = BaseModel;
