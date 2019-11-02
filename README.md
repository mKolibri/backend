# backend
nodeJS + MySql

# database
sudo apt-get update
sudo apt-get install mysql-server

# how to run app
npm ci
node app.js

# project schema
backend/
├── app.js
├── config
│   └── config.json
├── configs.js
├── controllers
│   ├── table.controller.js
│   └── user.controller.js
├── migrations
│   └── 20191029214951-create-users.js
├── models
│   ├── index.js
│   └── users.js
├── package.json
├── package-lock.json
├── README.md
├── routers
│   └── router.js
└── src
    └── src.js