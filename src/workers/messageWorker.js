const {ACC_SID, AUTH_TOKEN, FROM} = require('../config');
const twilio = require("twilio");
const client = new twilio(ACC_SID, AUTH_TOKEN);

const messageWorker = function() {
    
return {
    send: function(message, reciever) {
        // Add error handling here
        const US_PHONE_NUMBER = `+1${reciever.replace(/-/g,'')}`;
        console.log(`Sending message: ${message} to ${US_PHONE_NUMBER}`)
        client.messages .create({
            body: message,
            to: US_PHONE_NUMBER,
            from: FROM
        }).then(message =>
             console.log(`message successfully sent to ${US_PHONE_NUMBER}, event id: ${message.sid}`)
        );
    },
  };
};

module.exports = messageWorker();
