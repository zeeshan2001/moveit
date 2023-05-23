MoveIT Backend
=======
---

## Setup
First you need to install NodeJS and thus Node Package manager (NPM). After installation you need to download the dependencies which are stored in package.json in root folder. In this folder you need to type the following command to get the dependencies: `npm install`.
That's all. Now you can run the server by typing `node main.js`.

## Config File
The configuration file is the only one if you don't need to develop anything new. For use this file you need to copy `./src/config_.js´ as `./src/config.js`.
This copied file won't be tracked by git and any further changes needs to be done manually. You can simply change there the fields you want for the server. By simply restarting the changes will be used.

## Keys
Since this backend uses JSON Web Tokens you need to provide public and private key. There are online generators and a given format for this application. Read `./src/secrets/readme.md`for detailed description and ways to do it.

## Authentication
This application doesn't manage user by itself. User needs to be authenticated by a given **LDAP server**. User data is stored in JWT token. A valid token, which can be decrypted by public key, is a valid session.

## Endpoints
Backend offers REST API using JSON for information exchange. Using following methods:
  * POST: Creating a new ressource (Accepting parameters)
  * PUT: Updating an existing ressource (Accepting parameters)
  * GET: Getting desired ressource(s)
  * DELETE: Removing desired ressource(s)

## Documentation UI
This application uses swagger for the documentation. After starting the server the swagger-ui is provided by `{baseurl}/doc.` The documentation happens in the code as comments. Documenting the endpoints and used models e.g. in the database.

## Useful Tools
**Development**: You can use the npm package nodemon which you can get by typing `npm install -g nodemon`. Once the server has been started by `nodemon main.js` it will restart automatically when changing any file while developing.
**Production**: There's a tool called forever (`npm install -g forever`) which is useful if you want to start the server as a background process. This script will also restart the server in case of an unexpected crash.