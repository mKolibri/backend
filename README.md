# backend
nodeJS + MySql

# database
sudo apt-get update
sudo apt-get install mysql-server
sudo npm install nodemon -g

# how to run app
npm ci
# production mode
npm run prod
# development mode
npm run dev

# project schema
backend/
├── app.js
├── config
│   └── config.json
├── configs.js
├── controllers
│   ├── table.controller.js
│   └── user.controller.js
├── package.json
├── package-lock.json
├── README.md
├── routers
│   └── router.js
└── src
    └── src.js