const path = require("path");
const express = require("express");
const xss = require("xss");
const SubscribersService = require("./subscribers-service");

const subscribersRouter = express.Router();
const jsonParser = express.json();

const serializeSubscriber = (subscriber) => ({
  id: subscriber.id,
  curator_id: subscriber.curator_id,
});

subscribersRouter
  .route("/")
  .get((req, res, next) => {
    const knexInstance = req.app.get("db");
    SubscribersService.getAllSubscribers(knexInstance)
      .then((subscribers) => {
        res.json(subscribers.map(serializeSubscriber));
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const knexInstance = req.app.get("db");
    const { phone_number, curator_id } = req.body;
    const newSubscriber = { phone_number, curator_id };
    for (const [key, value] of Object.entries(newSubscriber)) {
      if (value == null)
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` },
        });
    }
    // Check to see if user has already subscribed to this phone number
    // If they haven't then insert new subscriber
    SubscribersService.checkExisting(knexInstance, newSubscriber).then(sub => {
      console.log(sub)
      if (!sub) {
        SubscribersService.insertSubscriber(knexInstance, newSubscriber)
        .then((subscriber) => {
          res
            .status(201)
            .location(path.posix.join(req.originalUrl, `/${subscriber.id}`))
            .json(serializeSubscriber(subscriber));
        })
      }
      // Otherwise send am error message
      else {
        return res.status(405).json({
          error: { message: `Number is already subscribed to this curator` },
        });
      }
    })
      .catch(next);
  });

subscribersRouter.route("/unsubscribe").post(jsonParser, (req, res, next) => {
  const knexInstance = req.app.get("db");
  const { phone_number } = req.body;

  if (phone_number === null)
    return res.status(400).json({
      error: { message: `No phone number specified` },
    });
  SubscribersService.deleteSubscriberByPhoneNumber(
    knexInstance,
    phone_number
  ).then((count) => {
    res.status(200).json({ deleteCount: count });
  });
});

subscribersRouter
  .route("/:subscriber_id")
  .all((req, res, next) => {
    knexInstance = req.app.get("db");
    SubscribersService.getBySubscriberId(knexInstance, req.params.subscriber_id)
      .then((subscriber) => {
        if (!subscriber) {
          return res.status(404).json({
            error: { message: `Subscriber doesn't exist` },
          });
        }
        res.subscriber = subscriber;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    res.json(serializeSubscriber(res.subscriber));
  })
  .delete((req, res, next) => {
    SubscribersService.deleteSubscriber(knexInstance, req.params.subscriber_id)
      .then((AffectedEntries) => {
        res.status(204).end();
      })
      .catch(next);
  });

subscribersRouter.route("/curator/:curator_id").get((req, res, next) => {
  const knexInstance = req.app.get("db");
  SubscribersService.getSubscriberCountByCuratorId(
    knexInstance,
    req.params.curator_id
  )
    .then((subscriberCount) => {
      if (!subscriberCount) {
        return res.status(404).json({
          error: { message: `No subscribers found` },
        });
      }
      res.json(subscriberCount);
    })
    .catch(next);
});

module.exports = subscribersRouter;
