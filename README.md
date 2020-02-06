# ONLINE DATABASE - BACKEND
    - Used nodeJS + MySql
    - This web site is a tool for database development, management, and administration.
    - Its allows you to create and execute queries, develop and debug stored routines, automate database object management,     analyze table data via an intuitive interface.
    - Web site delivers data and schema comparison and synchronization tools, database reporting tools, backup options with     scheduling, and much more.
    - Building, editing, and running queries get much simpler with the this following functionality:
        - login / logout / register
        - create / delete tables / modify
        - sort table content by filters
        - download table in csv format
    - Data security is guaranteed. Database design tools allow users to create a database diagram, objects  efficiently and     in a user-friendly interface.
    - In addition, it is possible to back up and restore databases to a file.

# GETTING STARTED && INSTALLING
    - clone in your PC this: https://github.com/mKolibri/backend.git
    - npm ci
        # RUN FOR PRODUCTION MODE
            └── npm run prod
        # RUN FOR DEVELOPMENT MODE
            └── npm run dev

# PREREQUISITES
    - Can used with frontend part: https://github.com/mKolibri/frontend.git
    - (MySql server)
        └── sudo apt-get update
            └── sudo apt-get install mysql-server

# BUILT WITH
    - Nodemone
    - express
    - sequelize
    - mysql

# VERSIONING
    This web site has only 1 version.

# AUTHORS
    - Mane Antonyan - https://github.com/mKolibri

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

# ACKNOWLEDGMENT
    - special for Instigate mobile.