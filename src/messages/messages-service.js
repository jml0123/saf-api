const MessagesService = {
    getAllMessages(knex) {
        return knex
            .select('*')
            .from('messages')
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
    //MessagesService(knex, id, updatedMessage)
}

module.exports = MessagesService