const SubscribersService = {
    getAllSubscribers(knex) {
        return knex
            .select('*')
            .from('subscribers')
    },
    //getAllSubscribers from a given user
    insertSubscriber(knex, newSubscriber) {
        return knex
            .insert(newSubscriber)
            .into('subscribers')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
    deleteSubscriber(knex, id) {
        return knex
            .from('subscribers')
            .where({id})
            .delete()
    },
}

module.exports = SubscribersService