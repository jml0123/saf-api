require("dotenv").config();
const twilio = require("twilio");

const client = new twilio(process.env.TWILIO_ACC_SID, process.env.TWILIO_TOKEN);

const messageWorker = function () {
  return {
    send: function (message, reciever) {
      const US_PHONE_NUMBER = `+1${reciever.replace(/-/g, "")}`;
      //console.log(`Sending message: ${message} to ${US_PHONE_NUMBER}`)
      console.log(`Sending message...`);
      client.messages
        .create({
          body: message,
          to: US_PHONE_NUMBER,
          from: process.env.TWILIO_FROM,
        })
        .then((message) =>
          //console.log(`message successfully sent to ${US_PHONE_NUMBER}, event id: ${message.sid}`)
          console.log(`Message sent successfully. (EVENT ID: ${message.sid})`)
        );
    },
  };
};

module.exports = messageWorker();