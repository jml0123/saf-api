const knex = require("knex");
const app = require("./app");
const { PORT, DATABASE_URL } = require("./config");
const cron = require("node-cron");

const monitorMessages = require("./factories/MessageFactory");
const moment = require("moment");

const db = knex({
  client: "pg",
  connection: DATABASE_URL,
});

app.set("db", db);

// Runs MessageFactory cron job every minute
cron.schedule("* * * * *", function () {
  console.log("Cron job running... Parsing messages to send...");
  monitorMessages.run();
});

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
