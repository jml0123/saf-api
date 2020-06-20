require('dotenv').config();
const twilio = require("twilio");

console.log(process.env.TWILIO_ACC_SID)
const client = new twilio(process.env.TWILIO_ACC_SID, process.env.TWILIO_TOKEN);

const messageWorker = function() {
    
return {
    send: function(message, reciever) {
        // Add error handling here
        const US_PHONE_NUMBER = `+1${reciever.replace(/-/g,'')}`;
        console.log(`Sending message: ${message} to ${US_PHONE_NUMBER}`)
        client.messages .create({
            body: message,
            to: US_PHONE_NUMBER,
            from: process.env.TWILIO_FROM
        }).then(message =>
             console.log(`message successfully sent to ${US_PHONE_NUMBER}, event id: ${message.sid}`)
        );
    },
  };
};

module.exports = messageWorker();
