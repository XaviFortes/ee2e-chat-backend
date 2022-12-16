# ee2e-chat-backend
This is a simple chat backend for the ee2e chat app.
Checkout the frontend [here](https://github.com/XaviFortes/ee2e-chat-frontend-vue)

## Installation
1. Clone the repo
2. Install dependencies with `npm install`
3. Run the server with `npm start`

## Configuration
The server can be configured with the following tweaks:
Inside `app/config/db.config.js` you can change the database connection settings.
example:
```javascript
module.exports = {
  HOST: "localhost",
  USER: "root",
  PASSWORD: "password",
  DB: "ee2e_chat",
  dialect: "mysql",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  redis: {
    host: "192.168.1.1",
    port: 6379,
  },
};
```

Inside `app/config/auth.config.js` you can change the JWT secret and the token expiration time.
example:
```javascript
module.exports = {
  secret: "ee2e-chat-secret-key",
  tokenExpirationTime: 86400 // 24 hours in seconds (60 * 60 * 24)
};
```

## Usage
The server exposes the following endpoints:
### Authentication
#### POST /api/auth/signup
Creates a new user.
example:
```javascript
{
  "username": "username",
  "email": "email",
  "password": "password"
}
```

#### POST /api/auth/signin
Authenticates a user.
example:
```javascript
{
  "email": "email",
  "password": "password"
}
```

### Users
#### GET /api/test/all (Possible deprecation)
Returns a list of all users.

#### POST /api/getUser/
Returns the user with the given id.
example:
```javascript
{
  "uuid": "123e4567-e89b-12d3-a456-426655440000"
}
```

#### PUT /api/user/:id (WIP)
Updates the user with the given id.
example:
```javascript
{
  "username": "username",
  "email": "email",
  "password": "password"
  "profile_pic": "URL of the picture"
}
```
### Messages
#### POST /api/chat/getMessages
Returns a list of all messages.
example:
```javascript
{
  "chatId": "ChatId"
}
```
#### POST /api/chat/postMessage
Creates a new message.
example:
```javascript
{
  "message": "Message",
  "chatId": "receiverId"
}
```


