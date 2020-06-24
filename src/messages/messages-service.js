const MessagesService = {
    getAllMessages(knex) {
        return knex
            .select('*')
            .from('messages')
    },
    getAllMessagesByCuratorId(knex, curator_id) {
        return knex
            .from('messages')
            .where('curator_id', curator_id)
            .select('*')
    },
    insertMessage(knex, newMessage) {
        return knex
            .insert(newMessage)
            .into('messages')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
    getByMessageId(knex, id) {
        return knex
            .from('messages')
            .select('*')
            .where('id', id)
            .first()
    },
    deleteMessage(knex, id) {
        return knex
            .from('messages')
            .where({id})
            .delete()
    },
    updateMessage(knex, id, updatedMessage){
        return knex
            .from('messages')
            .where({id})
            .update(updatedMessage)
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
}

module.exports = MessagesService