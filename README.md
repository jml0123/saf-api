## Start a 🔥App (API)
This is the API repository for Start a 🔥. To see the client repository, visit *[here](https://github.com/jml0123/saf-textapp-client)*.


[Link to Live Site](https://saf-textapp-client.jml0123.vercel.app/)

## Technology Used
- PostgreSQL
- Express.js
- Node.js (node-cron to schedule SMS message sending)
- React.js
- (Twillio API)


## API Docs

### Curator Profiles Endpoints  `/api/profiles`
`GET /`
- Gets all curator profiles
  
`GET /:curator_id`
- Gets a curator profile by their id

`DELETE /:curator_id`
- Deletes a curator profile

`PATCH /:curator_id`
- Edits the information of a specific curator, given their id
  
### Messages Endpoints `/api/messages`

`GET /`
- Gets all messages
  
`POST /`
- Posts a new message. Content, associated curator_id, and send schedule is required.

`GET /:message_id`
- Gets a specific messsage given its id

`DELETE /:message_id` 
- Deletes a specific message given its id

`PATCH /:message_id` 
- Edits a specific message given its id

`GET /curator/:curator_id` 
- Gets all messages of a given curator
  
### Subscribers Endpoints `/api/subscribers`

`GET /`
- Gets all subscribers
  
`POST /`
- Posts a new subscriber. Requires phone number and associated curator to subscribe to.

`POST /unsubscribe` 
- Unsubscribe a phone number from all curators. Responds with the number of unsubscribed curators. Requires phone number.
  
`GET /:subscriber_id`
- Gets a specific subscriber given their id

`DELETE /:subscriber_id`
- Unsubscribes from a specific subscription associated with a curator

`GET /curator/:curator_id`
- Gets the subscriber count of a given curator
  
### Sign-up Endpoints `/api/users`
`POST /`
- Creates a new curator account. (Requires username, password and full_name of curator)
  

