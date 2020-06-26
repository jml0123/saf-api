const CuratorsService = {
  getAllCurators(knex) {
    return knex.select("*").from("curators");
  },
  insertCurator(knex, newUser) {
    return knex
      .insert(newUser)
      .into("curators")
      .returning("*")
      .then((rows) => {
        return rows[0];
      });
  },
  getByCuratorId(knex, id) {
    return knex.from("curators").select("*").where("id", id).first();
  },
  deleteCurator(knex, id) {
    return knex.from("curators").where({ id }).delete();
  },
  updateUser(knex, id, updatedUser) {
    return knex
      .from("curators")
      .where({ id })
      .update(updatedUser)
      .returning("*")
      .then((rows) => {
        return rows[0];
      });
  },
};

module.exports = CuratorsService;
