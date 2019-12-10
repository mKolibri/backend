# ONLINE DATABASE BACKEND
    Used nodeJS + MySql

# PREREQUISITES
    (MySql server)
    └── sudo apt-get update
        └── sudo apt-get install mysql-server

# GETTING STARTED
    npm ci
    ├── # RUN FOR PRODUCTION MODE
    │   └── npm run prod
    └── # RUN FOR DEVELOPMENT MODE
        └── npm run dev

# PROJECT SCHEMA
    backend/
    ├── app.js- For the application main entry point.
    ├── config
    │   └── config.json
    ├── configs.js- Contains application configuration settings
    ├── controllers- dummy(wireframe) callback functions that will call from routers.
    │   ├── table.controller.js // special for table-router
    │   └── user.controller.js // special for user-router
    ├── database
    │   └── db.js- // Database connection and sessionStore connection
    ├── middlewares- Use callback functions
    │   ├── header.mid.js // for headers in response
    │   └── session.mid.js // to check session
    ├── migrations- Functions to create tables
    │   ├── 20191129060731-create-tables.js // for tables
    │   └── 20191129061957-create-users.js // for users
    ├── models- database or table models
    │   ├── index.js // database model
    │   ├── tables.js // "tables" table model
    │   └── users.js // "users" table model
    ├── package.json
    ├── package-lock.json
    ├── README.md- Simple form of documentation. Contains information about application.
    ├── routers
    │   └── router.js- A piece of code Express, linking the HTTP action(GET, POST, etc.)
    └── src
        └── src.js- Contains usefull functions that will call from controllers.