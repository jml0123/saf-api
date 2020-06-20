const knex = require('knex');
const moment = require('moment');

const MessagesService = require('../messages/messages-service.js');
const SubscribersService = require('../subscribers/subscribers-service.js');
const messageWorker = require('../workers/messageWorker.js');


const {PORT, DATABASE_URL} = require('../config')


const db = knex(({
    client: 'pg',
    connection: DATABASE_URL
}))

// Consider logging who the curator is here, so you can send subscribers a "from" name
const parseCurators = (queue) => {
    let curatorIds = []
    queue.forEach(message => {
        if(!curatorIds.includes(message.curator_id)){
            let curator_id = message.curator_id
            curatorIds = [...curatorIds, curator_id]
        }
    })
    return curatorIds
}

const getSubscribers = async (curatorId) => {
    let phonebook = [];
    let list = await SubscribersService.getAllSubscribersByCuratorId(db, curatorId);
    return await list.map(subscriber => {
        return subscriber.phone_number
    })
}

const getCurrentMessages = async (messages, curatorId) => {
    let curatorMessages = []
    messages.map(message => {
        if(message.curator_id === curatorId) {
            curatorMessages.push(message.content)
        }
    })
    return curatorMessages
}

const createQueue = async (messages) => {
    let queuedMessages = {}
    let result = "test"
    const curatorIds = parseCurators(messages)

    await Promise.all(curatorIds.map(async curator => {
        return queuedMessages[curator] = {
            messages: await getCurrentMessages(messages, curator),
            toSend: await getSubscribers(curator)
        }
    })).then(() =>{
        result = queuedMessages
    })
    return result
}

const assignWorkers = (allQueued) => {
    //console.log(allQueued)
    for (const curator in allQueued) {
        for (msg of allQueued[curator].messages) {
            allQueued[curator].toSend.map(number => {
                messageWorker.send(msg, number)
            })
        }
    }  
}

const messageFactory = function() {
    return {
        run: function() {
            let queued = [];
            MessagesService.getAllMessages(db).then(async messages => {
                queued = messages.filter(message => {
                    let now = moment.utc().format("LLL")
                    return moment(message.scheduled).utc().format("LLL") == now
                })
                await createQueue(queued).then(result =>{
                    assignWorkers(result)
                })
            })
            .catch("Error")              
        },
      };
}
module.exports = messageFactory();

/*


module.exports = schedulerFactory();



client.messages
    .create({
      body: "",
      to: TO,
      from: FROM
    })
.then(message => console.log(message.sid));

*/
// GET ALL MESSAGES 
// GET ALL SUBSCRIBERS

// Parse scheduled texts (CRON JOB)

// Filter texts by curator id
// Filter users by curator id

// Send scheduled texts to respective numbers associated with specifc curator id





