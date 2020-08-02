const { deleteAllSubscribersByCuratorId}  = require("../subscribers/subscribers-service.js");


const cleanDemoBot = (app) => {
    const demo_bot_id = 1;
    const knexInstance = app.get("db");
    deleteAllSubscribersByCuratorId(knexInstance, demo_bot_id).then(result=>
        console.log(result)
    )
}

module.exports = cleanDemoBot